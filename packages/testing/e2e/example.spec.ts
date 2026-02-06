import { DashboardPage, expect, LoginPage, test } from "./fixtures";

/**
 * Example E2E test to demonstrate testing patterns
 */

test.describe("Authentication Flow", () => {
	test("should redirect to login when not authenticated", async ({ page }) => {
		await page.goto("/dashboard");
		await expect(page).toHaveURL("/signin");
	});

	test("should login successfully", async ({ page, testUser }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(testUser.email, testUser.password);

		await expect(page).toHaveURL("/dashboard");
		await expect(page.locator("h1")).toContainText("Dashboard");
	});

	test("should access protected routes when authenticated", async ({
		authenticatedPage,
	}) => {
		await authenticatedPage.goto("/dashboard");
		await expect(authenticatedPage.locator("h1")).toContainText("Dashboard");

		await authenticatedPage.goto("/settings");
		await expect(authenticatedPage.locator("h1")).toContainText("Settings");
	});
});

test.describe("Project Management", () => {
	test.beforeEach(async ({ authenticatedPage }) => {
		const dashboard = new DashboardPage(authenticatedPage);
		await dashboard.goto();
	});

	test("should create a new project", async ({ authenticatedPage }) => {
		const dashboard = new DashboardPage(authenticatedPage);
		const projectName = `Test Project ${Date.now()}`;

		await dashboard.createProject(projectName, "Test description");

		// Verify project appears in list
		await expect(
			authenticatedPage.locator(`text=${projectName}`),
		).toBeVisible();
	});

	test("should search projects", async ({ authenticatedPage }) => {
		const dashboard = new DashboardPage(authenticatedPage);

		// Create multiple projects
		await dashboard.createProject("Alpha Project", "First project");
		await dashboard.createProject("Beta Project", "Second project");
		await dashboard.createProject("Gamma Project", "Third project");

		// Search for specific project
		await dashboard.searchProjects("Beta");

		// Verify search results
		await expect(authenticatedPage.locator("text=Beta Project")).toBeVisible();
		await expect(
			authenticatedPage.locator("text=Alpha Project"),
		).not.toBeVisible();
		await expect(
			authenticatedPage.locator("text=Gamma Project"),
		).not.toBeVisible();
	});

	test("should delete a project", async ({ authenticatedPage }) => {
		const dashboard = new DashboardPage(authenticatedPage);
		const projectName = `To Delete ${Date.now()}`;

		// Create project
		await dashboard.createProject(projectName);
		await expect(
			authenticatedPage.locator(`text=${projectName}`),
		).toBeVisible();

		// Delete project
		await dashboard.deleteProject(projectName);

		// Verify project is deleted
		await expect(
			authenticatedPage.locator(`text=${projectName}`),
		).not.toBeVisible();
	});
});

test.describe("Responsive Design", () => {
	test("should work on mobile viewport", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/");

		// Mobile menu should be visible
		await expect(page.locator('[aria-label="Menu"]')).toBeVisible();

		// Desktop navigation should be hidden
		await expect(page.locator("nav.desktop-nav")).not.toBeVisible();
	});

	test("should work on tablet viewport", async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto("/");

		// Check tablet-specific layout
		await expect(page.locator(".container")).toHaveCSS("max-width", "768px");
	});
});

test.describe("Accessibility", () => {
	test("should have no accessibility violations on homepage", async ({
		page,
	}) => {
		await page.goto("/");

		// Dynamic import to avoid loading in non-test environments
		const { checkAccessibility } = await import("./fixtures");
		await checkAccessibility(page);
	});

	test("should be keyboard navigable", async ({ page }) => {
		await page.goto("/");

		// Tab through interactive elements
		await page.keyboard.press("Tab");
		const firstFocused = await page.evaluate(
			() => document.activeElement?.tagName,
		);
		expect(firstFocused).toBeTruthy();

		// Press Enter on focused link
		await page.keyboard.press("Enter");
		await page.waitForLoadState("networkidle");
	});
});

test.describe("Performance", () => {
	test("should load homepage within performance budget", async ({ page }) => {
		const startTime = Date.now();
		await page.goto("/");
		const loadTime = Date.now() - startTime;

		// Homepage should load within 3 seconds
		expect(loadTime).toBeLessThan(3000);
	});

	test("should have good Core Web Vitals", async ({ page }) => {
		await page.goto("/");

		// Measure LCP (Largest Contentful Paint)
		const lcp = await page.evaluate(() => {
			return new Promise((resolve) => {
				new PerformanceObserver((list) => {
					const entries = list.getEntries();
					const lastEntry = entries[entries.length - 1];
					resolve(lastEntry.renderTime || lastEntry.loadTime);
				}).observe({ entryTypes: ["largest-contentful-paint"] });
			});
		});

		// LCP should be less than 2.5 seconds
		expect(Number(lcp)).toBeLessThan(2500);
	});
});
