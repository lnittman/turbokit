import { createPlaywrightConfig } from "@lnittman/playwright-config";
import { devices } from "@playwright/test";

export default createPlaywrightConfig({
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? "github" : "html",
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
	],
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
