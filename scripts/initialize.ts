import { exec as execCallback } from "node:child_process";
import {
	appendFileSync,
	existsSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import {
	cancel,
	confirm,
	intro,
	isCancel,
	log,
	note,
	outro,
	spinner,
} from "@clack/prompts";
import * as colors from "picocolors";

const _exec = promisify(execCallback);

interface InitOptions {
	name?: string;
	skipInstall?: boolean;
	git?: boolean;
}

interface TurboKitConfig {
	version: string;
	projectName: string;
	created: string;
	specification?: any;
	aiClient?: "gemini" | "claude" | "cursor" | "none";
}

/**
 * Update the project status tracking
 * This maintains a running log of project state in .turbokit/status/
 */
function updateStatus(
	turbokitDir: string,
	phase: string,
	task: string,
	status: string,
	context: Record<string, any> = {},
) {
	const timestamp = new Date().toISOString();
	const currentPath = join(turbokitDir, "status", "CURRENT.md");
	const historyPath = join(turbokitDir, "status", "HISTORY.md");

	// Archive current status to history if it exists
	if (existsSync(currentPath)) {
		const current = readFileSync(currentPath, "utf-8");
		appendFileSync(historyPath, `\n\n${current}\n${"=".repeat(60)}`);
	}

	// Generate new status
	const statusContent = `# TurboKit Project Status

**Timestamp**: ${timestamp}  
**Phase**: ${phase}  
**Task**: ${task}  
**Status**: ${status}

## Context
${Object.entries(context)
	.map(([key, value]) => {
		if (typeof value === "object" && value !== null) {
			return `### ${key}\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
		}
		return `- **${key}**: ${value}`;
	})
	.join("\n")}

## Next Steps
${context.nextSteps || "Continue with current workflow"}

---`;

	writeFileSync(currentPath, statusContent);
}

/**
 * Initialize a TurboKit project in the current directory
 * Expects .turbokit/ to already exist (from template)
 */
export async function initialize(options: InitOptions) {
	try {
		console.clear();
		intro(colors.inverse(" TurboKit Initialization "));

		const cwd = process.cwd();
		const turbokitDir = join(cwd, ".turbokit");

		// Check if .turbokit exists
		if (!existsSync(turbokitDir)) {
			log.error(
				".turbokit directory not found. This doesn't appear to be a TurboKit project.",
			);
			log.info(
				"To create a new TurboKit project, use: npx create-turbokit@latest",
			);
			process.exit(1);
		}

		// Check if already initialized
		const configPath = join(turbokitDir, "config", "project.json");
		if (existsSync(configPath) && !options.name) {
			const reinit = await confirm({
				message: "Project already initialized. Reinitialize?",
				initialValue: false,
			});

			if (isCancel(reinit) || !reinit) {
				cancel("Initialization cancelled.");
				process.exit(0);
			}
		}

		// Update status: Starting
		updateStatus(
			turbokitDir,
			"Initialization",
			"Starting onboarding",
			"In Progress",
			{
				workingDirectory: cwd,
				timestamp: new Date().toISOString(),
				turboKitVersion: "1.0.0",
			},
		);

		// Minimal non-AI onboarding: infer name from directory or argument
		console.log("");
		note(
			"Initializing TurboKit project metadata (no AI involved).",
			"TurboKit",
		);

		const inferredName = options.name || cwd.split("/").pop() || "turbokit-app";
		const projectSpec = {
			name: inferredName,
			domain: "app",
			features: [],
			convexComponents: [],
			agentConfiguration: { primaryAgent: "none" },
		} as any;

		const s = spinner();
		s.start("Saving project configuration...");

		// Save configuration
		const config: TurboKitConfig = {
			version: "1.0.0",
			projectName: projectSpec.name,
			created: new Date().toISOString(),
			specification: projectSpec,
		};

		await writeFile(
			join(turbokitDir, "config", "project.json"),
			JSON.stringify(config, null, 2),
		);

		// Update status with specification
		updateStatus(
			turbokitDir,
			"Configuration",
			"Project specification saved",
			"Complete",
			{
				projectName: projectSpec.name,
				domain: projectSpec.domain,
				features: projectSpec.features.map((f: any) => f.name),
				convexComponents: projectSpec.convexComponents,
				agentPreference: projectSpec.agentConfiguration.primaryAgent,
				nextSteps: "Configure AI assistant if needed",
			},
		);

		s.stop("Configuration saved!");

		// No AI configuration in CLI; coding agent usage is documented in AGENTS.md

		// Final summary
		console.log("");
		note(
			`${colors.bold("Project:")} ${projectSpec.name}\n` +
				`${colors.bold("Type:")} ${projectSpec.domain}\n` +
				`${colors.bold("Features:")} ${projectSpec.features.map((f: any) => f.name).join(", ")}\n` +
				`${colors.bold("Convex Components:")} ${projectSpec.convexComponents.join(", ")}\n` +
				`${colors.bold("Preferred Agent:")} ${projectSpec.agentConfiguration.primaryAgent}`,
			"Configuration Summary",
		);

		// Update final status
		updateStatus(
			turbokitDir,
			"Initialized",
			"Ready for development",
			"Complete",
			{
				projectName: projectSpec.name,
				initialized: new Date().toISOString(),
				aiClient: "none",
				nextSteps: "Install dependencies: pnpm install",
			},
		);

		outro(colors.green("✓ TurboKit initialized successfully!"));

		console.log("");
		console.log(colors.bold("Next steps:"));
		console.log("");

		console.log("  1. Install dependencies:");
		console.log(colors.cyan("     pnpm install"));
		console.log("");
		console.log("  2. Initialize Convex:");
		console.log(colors.cyan("     npx convex init"));
		console.log("");
		console.log("  3. Start development:");
		console.log(colors.cyan("     pnpm dev"));

		console.log("");
		console.log(colors.dim("Configuration saved to .turbokit/"));
		console.log(colors.dim("Status tracking in .turbokit/status/CURRENT.md"));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		log.error(`Failed to initialize: ${message}`);
		process.exit(1);
	}
}
