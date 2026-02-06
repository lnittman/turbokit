import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E testing configuration
 */
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI
		? [["github"], ["html", { open: "never" }]]
		: [["list"], ["html", { open: "on-failure" }]],

	use: {
		baseURL: process.env.BASE_URL || "http://localhost:3000",
		trace: process.env.CI ? "retain-on-failure" : "on-first-retry",
		screenshot: "only-on-failure",
		video: process.env.CI ? "retain-on-failure" : "off",
		actionTimeout: 15000,
		navigationTimeout: 30000,
	},

	projects: [
		// Desktop browsers
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},

		// Mobile browsers
		{
			name: "mobile-chrome",
			use: { ...devices["Pixel 5"] },
		},
		{
			name: "mobile-safari",
			use: { ...devices["iPhone 12"] },
		},

		// Branded browsers
		{
			name: "edge",
			use: { ...devices["Desktop Edge"], channel: "msedge" },
		},
		{
			name: "chrome",
			use: { ...devices["Desktop Chrome"], channel: "chrome" },
		},
	],

	webServer: {
		command: process.env.CI ? "pnpm build && pnpm start" : "pnpm dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		stdout: "pipe",
		stderr: "pipe",
	},

	outputDir: "./test-results",
});

/**
 * Custom test configuration for specific apps
 */
export const appConfig = defineConfig({
	...defineConfig,
	testDir: "../../apps/app/e2e",
	use: {
		...defineConfig.use,
		baseURL: "http://localhost:3000",
	},
});

export const docsConfig = defineConfig({
	...defineConfig,
	testDir: "../../docs/e2e",
	use: {
		...defineConfig.use,
		baseURL: "http://localhost:3002",
	},
	webServer: {
		command: "pnpm --filter docs dev",
		url: "http://localhost:3002",
		reuseExistingServer: !process.env.CI,
		timeout: 60000,
	},
});
