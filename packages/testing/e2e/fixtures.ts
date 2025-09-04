import { test as base, expect, Page, BrowserContext } from "@playwright/test";
import { faker } from "@faker-js/faker";

/**
 * Custom test fixtures for E2E testing
 */

// Define custom fixture types
type TestFixtures = {
  authenticatedPage: Page;
  testUser: {
    email: string;
    password: string;
    name: string;
  };
  apiContext: BrowserContext;
};

// Create custom test with fixtures
export const test = base.extend<TestFixtures>({
  // Authenticated page fixture
  authenticatedPage: async ({ page, context }, use) => {
    // Mock authentication
    await context.addCookies([
      {
        name: "__clerk_session",
        value: "test_session_token",
        domain: "localhost",
        path: "/",
      },
    ]);
    
    // Set local storage for auth state
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("__clerk_user_id", "test_user_123");
      localStorage.setItem("__clerk_session_id", "test_session_123");
    });
    
    await use(page);
  },
  
  // Test user fixture
  testUser: async ({}, use) => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      name: faker.person.fullName(),
    };
    
    await use(user);
    
    // Cleanup after test if needed
  },
  
  // API context for making direct API calls
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: process.env.API_URL || "http://localhost:3000/api",
      extraHTTPHeaders: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TEST_API_KEY || "test_api_key"}`,
      },
    });
    
    await use(context as any);
    await context.dispose();
  },
});

export { expect };

/**
 * Page object models
 */
export class LoginPage {
  constructor(public page: Page) {}
  
  async goto() {
    await this.page.goto("/signin");
  }
  
  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL("/dashboard");
  }
  
  async loginWithGoogle() {
    await this.page.click('button:has-text("Continue with Google")');
    // Handle OAuth flow
  }
}

export class DashboardPage {
  constructor(public page: Page) {}
  
  async goto() {
    await this.page.goto("/dashboard");
  }
  
  async createProject(name: string, description?: string) {
    await this.page.click('button:has-text("New Project")');
    await this.page.fill('input[name="name"]', name);
    if (description) {
      await this.page.fill('textarea[name="description"]', description);
    }
    await this.page.click('button:has-text("Create")');
  }
  
  async searchProjects(query: string) {
    await this.page.fill('input[placeholder*="Search"]', query);
    await this.page.press('input[placeholder*="Search"]', "Enter");
  }
  
  async deleteProject(name: string) {
    await this.page.click(`[data-project-name="${name}"] button[aria-label="Delete"]`);
    await this.page.click('button:has-text("Confirm")');
  }
}

/**
 * Common E2E test helpers
 */
export async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState("networkidle");
}

export async function mockAPIResponse(
  page: Page,
  url: string | RegExp,
  response: any
) {
  await page.route(url, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

export async function interceptAPICall(
  page: Page,
  url: string | RegExp,
  callback: (request: any) => void
) {
  await page.route(url, async (route, request) => {
    callback(request);
    await route.continue();
  });
}

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `./test-results/screenshots/${name}.png`,
    fullPage: true,
  });
}

export async function checkAccessibility(page: Page) {
  // Inject axe-core
  await page.addScriptTag({
    url: "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js",
  });
  
  // Run accessibility tests
  const violations = await page.evaluate(async () => {
    // @ts-ignore
    const results = await window.axe.run();
    return results.violations;
  });
  
  if (violations.length > 0) {
    console.error("Accessibility violations:", violations);
  }
  
  expect(violations).toHaveLength(0);
}

export async function fillForm(
  page: Page,
  formData: Record<string, string>
) {
  for (const [selector, value] of Object.entries(formData)) {
    await page.fill(selector, value);
  }
}

export async function selectOption(
  page: Page,
  selector: string,
  value: string
) {
  await page.selectOption(selector, value);
}

export async function uploadFile(
  page: Page,
  selector: string,
  filePath: string
) {
  const fileInput = await page.locator(selector);
  await fileInput.setInputFiles(filePath);
}

export async function downloadFile(
  page: Page,
  downloadTriggerSelector: string
): Promise<string> {
  const downloadPromise = page.waitForEvent("download");
  await page.click(downloadTriggerSelector);
  const download = await downloadPromise;
  const path = await download.path();
  return path!;
}

export async function mockGeolocation(
  page: Page,
  latitude: number,
  longitude: number
) {
  await page.context().setGeolocation({ latitude, longitude });
  await page.context().grantPermissions(["geolocation"]);
}

export async function mockDate(page: Page, date: Date) {
  await page.addInitScript(`{
    Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          super(${date.getTime()});
        } else {
          super(...args);
        }
      }
    };
    const __date = ${date.getTime()};
    Date.now = () => __date;
  }`);
}