# Testing Package

Comprehensive testing utilities for TurboKit applications including unit, integration, and E2E testing support.

## Features

- **Vitest** for unit and integration testing
- **Playwright** for E2E testing
- **Convex Test** for backend function testing
- **React Testing Library** for component testing
- **Mock data generators** with Faker.js
- **Test fixtures** for consistent test data
- **Custom test utilities** and helpers

## Installation

This package is automatically installed as part of TurboKit. To use in your tests:

```typescript
import { test, expect } from "@repo/testing";
```

## Unit Testing

### Basic Test

```typescript
import { describe, it, expect } from "@repo/testing";

describe("Math operations", () => {
  it("should add numbers correctly", () => {
    expect(1 + 1).toBe(2);
  });
});
```

### React Component Testing

```typescript
import { renderWithProviders, screen, userEvent } from "@repo/testing";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("should handle click events", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyComponent />);
    
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Clicked!")).toBeInTheDocument();
  });
});
```

### Convex Function Testing

```typescript
import { createConvexTestContext, testMutation } from "@repo/testing";
import schema from "@repo/backend/convex/schema";
import { createProject } from "@repo/backend/convex/functions/mutations/projects";

describe("Projects", () => {
  const ctx = createConvexTestContext(schema);
  
  afterEach(async () => {
    await ctx.cleanup();
  });
  
  it("should create a project", async () => {
    const result = await testMutation(ctx.t, createProject, {
      name: "Test Project",
      description: "Test Description",
    }, {
      authenticated: true,
      userId: "test_user",
    });
    
    expect(result).toBeDefined();
    expect(result.name).toBe("Test Project");
  });
});
```

## E2E Testing

### Basic E2E Test

```typescript
import { test, expect } from "@repo/testing/e2e/fixtures";

test("should navigate to dashboard", async ({ page }) => {
  await page.goto("/");
  await page.click('a[href="/dashboard"]');
  await expect(page).toHaveURL("/dashboard");
});
```

### Authenticated E2E Test

```typescript
import { test, expect, LoginPage } from "@repo/testing/e2e/fixtures";

test("should access protected route", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/dashboard");
  await expect(authenticatedPage.locator("h1")).toContainText("Dashboard");
});
```

### Page Object Model

```typescript
import { test, DashboardPage } from "@repo/testing/e2e/fixtures";

test("should create a project", async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();
  await dashboard.createProject("New Project", "Description");
  
  await expect(page.locator('[data-project-name="New Project"]')).toBeVisible();
});
```

## Mock Data

### Generate Mock Users

```typescript
import { createMockUser, generateMockData } from "@repo/testing";

const user = createMockUser({
  name: "Custom Name",
  email: "custom@example.com",
});

const { users, projects } = generateMockData({
  users: 10,
  projectsPerUser: 3,
});
```

### Use Test Fixtures

```typescript
import { testUsers, testProjects } from "@repo/testing";

describe("User permissions", () => {
  it("should allow admin access", () => {
    const admin = testUsers.admin;
    expect(admin.role).toBe("admin");
  });
});
```

## Configuration

### Vitest Configuration

Create a `vitest.config.ts` in your package:

```typescript
import { defineConfig } from "vitest/config";
import { frontendConfig } from "@repo/testing/vitest";

export default defineConfig({
  ...frontendConfig,
  // Custom overrides
  test: {
    ...frontendConfig.test,
    setupFiles: ["./test-setup.ts"],
  },
});
```

### Playwright Configuration

Create a `playwright.config.ts` in your app:

```typescript
import { appConfig } from "@repo/testing/playwright";

export default appConfig;
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage

# Debug mode
pnpm test:debug
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Interactive UI mode
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug

# Specific project
pnpm test:e2e --project=chromium
```

### Run All Tests

```bash
pnpm test:all
```

## Test Organization

### Recommended Structure

```
apps/app/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx     # Component tests
│   └── utils/
│       ├── format.ts
│       └── format.test.ts      # Unit tests
├── e2e/
│   ├── auth.spec.ts            # E2E tests
│   └── dashboard.spec.ts
└── vitest.config.ts
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:e2e
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: |
            coverage/
            test-results/
            playwright-report/
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Use Fixtures**: Consistent test data across tests
3. **Mock External Services**: Don't make real API calls
4. **Test User Journeys**: Focus on real user workflows
5. **Keep Tests Fast**: Mock heavy operations
6. **Use Page Objects**: For E2E test maintainability
7. **Test Accessibility**: Include a11y checks
8. **Document Complex Tests**: Add comments for clarity

## Troubleshooting

### Common Issues

**Tests timing out**
- Increase timeout in test configuration
- Check for unresolved promises
- Ensure mocks are properly configured

**Convex test failures**
- Ensure test database is clean
- Check authentication mocks
- Verify schema matches

**Playwright failures**
- Ensure dev server is running
- Check selectors are correct
- Use `page.waitFor` for dynamic content

**Coverage not working**
- Ensure source files are included
- Check coverage configuration
- Exclude test files from coverage

## Support

For issues or questions, check:
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Testing Library Documentation](https://testing-library.com)
- [Convex Test Documentation](https://docs.convex.dev/testing)