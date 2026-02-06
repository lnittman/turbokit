import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		name: "turbokit",
		environment: "happy-dom",
		globals: true,
		setupFiles: ["./setup.ts"],
		exclude: ["e2e/**", "node_modules/**", "dist/**", ".turbo/**"],
		passWithNoTests: true,
		server: {
			deps: {
				inline: ["convex-test"],
			},
		},
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			exclude: [
				"**/_generated/**",
				"**/*.config.{js,ts,mjs,mts}",
				"**/*.test.{js,ts,jsx,tsx}",
				"**/*.spec.{js,ts,jsx,tsx}",
				"**/node_modules/**",
				"**/dist/**",
				"**/build/**",
				"**/.next/**",
				"**/coverage/**",
				"**/test-utils/**",
				"**/testing/**",
				"**/__tests__/**",
				"**/__mocks__/**",
			],
			thresholds: {
				branches: 70,
				functions: 70,
				lines: 70,
				statements: 70,
			},
		},
		testTimeout: 10000,
		hookTimeout: 10000,
		// Run tests in sequence for Convex tests to avoid conflicts
		pool: "forks",
		poolOptions: {
			forks: {
				singleFork: true,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "../../packages/backend/convex"),
			"@repo": path.resolve(__dirname, "../"),
			"~": path.resolve(__dirname, "./"),
			"@/app": path.resolve(__dirname, "../../apps/app/src"),
			"@/design": path.resolve(__dirname, "../design"),
		},
	},
});

// Export a separate config for frontend tests
export const frontendConfig = defineConfig({
	plugins: [react()],
	test: {
		name: "frontend",
		environment: "jsdom",
		globals: true,
		setupFiles: ["./setup.ts", "./setup.browser.ts"],
		exclude: ["e2e/**", "node_modules/**", "dist/**", ".turbo/**"],
		passWithNoTests: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"**/*.config.{js,ts,mjs,mts}",
				"**/*.test.{js,ts,jsx,tsx}",
				"**/node_modules/**",
				"**/.next/**",
			],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "../../apps/app/src"),
			"@repo": path.resolve(__dirname, "../"),
		},
	},
});

// Export a separate config for backend/Convex tests
export const backendConfig = defineConfig({
	test: {
		name: "backend",
		environment: "node",
		globals: true,
		setupFiles: ["./setup.ts", "./setup.convex.ts"],
		exclude: ["e2e/**", "node_modules/**", "dist/**", ".turbo/**"],
		passWithNoTests: true,
		server: {
			deps: {
				inline: ["convex-test"],
			},
		},
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"**/_generated/**",
				"**/*.config.{js,ts}",
				"**/*.test.{js,ts}",
				"**/node_modules/**",
			],
		},
		pool: "forks",
		poolOptions: {
			forks: {
				singleFork: true,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "../../packages/backend/convex"),
			"@repo": path.resolve(__dirname, "../"),
		},
	},
});
