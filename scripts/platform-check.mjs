#!/usr/bin/env node

/**
 * platform:check — validates templates against platform-contract.json
 *
 * Checks:
 * 1. Required files exist in each template
 * 2. .loop.json has all required keys
 * 3. .abbie/config.json has required keys and correct values
 * 4. No forbidden (stale/removed) package references in package.json files
 * 5. Required shared packages are present where expected
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "..");
const ROOT = resolve(REPO_ROOT, "..");
const contract = JSON.parse(
	readFileSync(join(REPO_ROOT, "platform-contract.json"), "utf-8"),
);

let errors = 0;
let warnings = 0;

function error(msg) {
	console.error(`  ✗ ${msg}`);
	errors++;
}

function warn(msg) {
	console.warn(`  ○ ${msg}`);
	warnings++;
}

function ok(msg) {
	console.log(`  ✓ ${msg}`);
}

/**
 * Resolve a dotted key path (e.g. "project.name") against an object.
 */
function getNestedValue(obj, keyPath) {
	return keyPath.split(".").reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

/**
 * Recursively find all package.json files in a directory (skipping node_modules).
 */
function findPackageJsons(dir) {
	const results = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".turbo" || entry.name === ".git") continue;
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...findPackageJsons(fullPath));
		} else if (entry.name === "package.json") {
			results.push(fullPath);
		}
	}
	return results;
}

// --- Shared root checks ---

console.log("\n◆ Shared root");

for (const file of contract.shared.requiredRootFiles) {
	const fullPath = join(ROOT, file);
	if (existsSync(fullPath)) {
		ok(file);
	} else {
		error(`missing required file: ${file}`);
	}
}

if (existsSync(join(ROOT, ".abbie/config.json"))) {
	const config = JSON.parse(
		readFileSync(join(ROOT, ".abbie/config.json"), "utf-8"),
	);

	for (const key of contract.shared.requiredConfigKeys) {
		if (config[key] != null) {
			ok(`config.${key} = ${JSON.stringify(config[key])}`);
		} else {
			error(`config missing required key: ${key}`);
		}
	}

	if (config.team !== contract.shared.team) {
		error(`config.team is "${config.team}", expected "${contract.shared.team}"`);
	}
	if (config.workspace !== contract.shared.workspace) {
		error(`config.workspace is "${config.workspace}", expected "${contract.shared.workspace}"`);
	}
}

// --- Per-template checks ---

for (const [name, spec] of Object.entries(contract.templates)) {
	const templateDir = join(ROOT, spec.path);
	console.log(`\n◆ ${name} (${spec.path}/)`);

	if (!existsSync(templateDir)) {
		error(`template directory not found: ${spec.path}/`);
		continue;
	}

	// Required files
	for (const file of spec.requiredFiles) {
		const fullPath = join(templateDir, file);
		if (existsSync(fullPath)) {
			ok(file);
		} else {
			error(`missing required file: ${file}`);
		}
	}

	// .loop.json keys
	const loopPath = join(templateDir, ".loop.json");
	if (existsSync(loopPath)) {
		const loopConfig = JSON.parse(readFileSync(loopPath, "utf-8"));

		for (const keyPath of spec.requiredLoopKeys) {
			const value = getNestedValue(loopConfig, keyPath);
			if (value != null) {
				ok(`.loop.json ${keyPath}`);
			} else {
				error(`.loop.json missing required key: ${keyPath}`);
			}
		}

		if (loopConfig.flywheel !== spec.flywheel) {
			error(`.loop.json flywheel is "${loopConfig.flywheel}", expected "${spec.flywheel}"`);
		}
	}

	// Forbidden packages (stale references)
	if (spec.forbiddenPackages.length > 0 && spec.flywheel === "turborepo") {
		const pkgJsons = findPackageJsons(templateDir);

		for (const pkgPath of pkgJsons) {
			const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
			const allDeps = {
				...pkg.dependencies,
				...pkg.devDependencies,
				...pkg.peerDependencies,
			};
			const relativePath = pkgPath.replace(`${ROOT}/`, "");

			for (const forbidden of spec.forbiddenPackages) {
				if (allDeps[forbidden]) {
					error(`${relativePath} references forbidden package: ${forbidden}`);
				}
			}
		}
		ok("no forbidden package references");
	}

	// Required shared packages (check root package.json + app package.json)
	if (spec.requiredSharedPackages.length > 0 && spec.flywheel === "turborepo") {
		const pkgJsons = findPackageJsons(templateDir);
		const allFoundDeps = new Set();

		for (const pkgPath of pkgJsons) {
			const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
			const allDeps = {
				...pkg.dependencies,
				...pkg.devDependencies,
			};
			for (const dep of Object.keys(allDeps)) {
				allFoundDeps.add(dep);
			}
		}

		for (const required of spec.requiredSharedPackages) {
			if (allFoundDeps.has(required)) {
				ok(`shared package: ${required}`);
			} else {
				warn(`shared package not found in any package.json: ${required}`);
			}
		}
	}
}

// --- Telemetry env matrix ---

for (const [name, spec] of Object.entries(contract.templates)) {
	if (!spec.telemetry) continue;
	const templateDir = join(ROOT, spec.path);
	console.log(`\n◆ ${name} telemetry`);

	// Check .env.example documents all required vars
	const envExamplePath = join(templateDir, ".env.example");
	if (existsSync(envExamplePath)) {
		const envContent = readFileSync(envExamplePath, "utf-8");
		for (const [service, config] of Object.entries(spec.telemetry)) {
			for (const envVar of config.requiredEnvVars) {
				if (envContent.includes(envVar)) {
					ok(`${service}: ${envVar} documented in .env.example`);
				} else {
					error(`${service}: ${envVar} missing from .env.example`);
				}
			}
			if (config.gracefulDegradation) {
				ok(`${service}: graceful degradation enabled`);
			}
		}
	}

	// Check .env.local for actual configuration (warn-only, not error)
	const envLocalPath = join(templateDir, "apps/app/.env.local");
	if (existsSync(envLocalPath)) {
		const envLocal = readFileSync(envLocalPath, "utf-8");
		for (const [service, config] of Object.entries(spec.telemetry)) {
			for (const envVar of config.requiredEnvVars) {
				const match = envLocal.match(new RegExp(`^${envVar}=(.+)$`, "m"));
				if (match && match[1].trim()) {
					ok(`${service}: ${envVar} configured locally`);
				} else {
					warn(`${service}: ${envVar} not set in .env.local (${config.gracefulDegradation ? "graceful" : "required"})`);
				}
			}
		}
	} else {
		warn("no .env.local found (telemetry unconfigured for local dev)");
	}
}

// --- Summary ---

console.log("\n─────────────────────────────────");
if (errors > 0) {
	console.log(`\n✗ ${errors} error(s), ${warnings} warning(s)\n`);
	process.exit(1);
} else if (warnings > 0) {
	console.log(`\n○ 0 errors, ${warnings} warning(s)\n`);
	process.exit(0);
} else {
	console.log(`\n✓ all checks passed\n`);
	process.exit(0);
}
