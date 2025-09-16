# Testing Package - AI Agent Instructions

## Overview
This package provides comprehensive testing infrastructure for TurboKit applications, including unit testing with Vitest, E2E testing with Playwright, Convex backend testing, React component testing, and mock data generation. It ensures consistent testing patterns across all apps.

## Quick Start Checklist
- [ ] Configure Vitest for unit tests
- [ ] Set up Playwright for E2E tests
- [ ] Initialize Convex test environment
- [ ] Create test fixtures and mock data
- [ ] Set up CI/CD test pipeline
- [ ] Configure code coverage thresholds

## Architecture

### Package Structure
```
packages/testing/
├── setup/
│   ├── setup.ts              # Global test setup
│   ├── setup.browser.ts      # Browser environment setup
│   └── setup.convex.ts       # Convex testing setup
├── utils/
│   ├── test-helpers.ts       # General test utilities
│   ├── react-helpers.tsx     # React testing utilities
│   ├── convex-helpers.ts     # Convex test helpers
│   └── mock-data.ts          # Mock data generators
├── fixtures/
│   └── index.ts              # Test fixtures
├── e2e/
│   ├── fixtures.ts           # E2E test fixtures
│   └── example.spec.ts       # Example E2E test
├── vitest.config.ts          # Vitest configuration
└── playwright.config.ts      # Playwright configuration
```

### Testing Stack
- **Vitest**: Fast unit test runner with native ESM support
- **Playwright**: Cross-browser E2E testing
- **Convex Test**: Backend function testing
- **React Testing Library**: Component testing
- **Faker.js**: Realistic mock data generation
- **Happy DOM/JSDOM**: DOM implementation for tests

## Vitest Configuration

### Base Configuration
```typescript
// packages/testing/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export const baseConfig = {
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        '*.config.*',
        '**/*.d.ts',
        '**/*.test.*',
        '**/*.spec.*',
        '**/test-*',
        '**/mock-*',
      ],
    },
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
};

// Frontend-specific config
export const frontendConfig = defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: 'happy-dom',
    setupFiles: ['./setup.ts', './setup.browser.ts'],
  },
});

// Backend-specific config
export const backendConfig = defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: 'node',
    setupFiles: ['./setup.ts', './setup.convex.ts'],
  },
});
```

### App-Specific Configuration
```typescript
// apps/app/vitest.config.ts
import { defineConfig } from 'vitest/config';
import { frontendConfig } from '@repo/testing/vitest';
import path from 'path';

export default defineConfig({
  ...frontendConfig,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    ...frontendConfig.test,
    setupFiles: [
      ...frontendConfig.test.setupFiles,
      './test/setup.ts', // App-specific setup
    ],
  },
});
```

## Unit Testing

### Basic Test Structure
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Feature Name', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset mocks, initialize test state
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    vi.restoreAllMocks();
  });

  // Group related tests
  describe('when condition is met', () => {
    it('should behave correctly', () => {
      // Arrange
      const input = { value: 42 };

      // Act
      const result = processInput(input);

      // Assert
      expect(result).toEqual({ processed: true, value: 42 });
    });
  });

  // Test error cases
  it('should handle errors gracefully', () => {
    expect(() => processInvalidInput()).toThrow('Invalid input');
  });
});
```

### Mocking with Vitest
```typescript
import { vi, Mock } from 'vitest';

// Mock modules
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn(),
}));

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://test-api.com');

// Mock timers
vi.useFakeTimers();

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'mocked' }),
    ok: true,
  })
) as Mock;

// Spy on console
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
```

## React Component Testing

### Setup and Utilities
```typescript
// packages/testing/utils/react-helpers.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@repo/design/providers/theme';
import { ConvexProvider } from 'convex/react';
import { ReactElement } from 'react';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark';
  convexClient?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    theme = 'light',
    convexClient = mockConvexClient,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ConvexProvider client={convexClient}>
        <ThemeProvider defaultTheme={theme}>
          {children}
        </ThemeProvider>
      </ConvexProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    rerender: (ui: ReactElement) =>
      render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export testing library utilities
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
```

### Component Test Example
```typescript
import { renderWithProviders, screen, waitFor, userEvent } from '@repo/testing';
import { Button } from '@/components/button';

describe('Button', () => {
  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithProviders(
      <Button onClick={handleClick}>Click me</Button>
    );

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    renderWithProviders(
      <Button loading>Submit</Button>
    );

    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should render different variants', () => {
    const { rerender } = renderWithProviders(
      <Button variant="primary">Primary</Button>
    );

    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });
});
```

### Testing Hooks
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/use-counter';

describe('useCounter', () => {
  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should reset count', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(5);
  });
});
```

## Convex Backend Testing

### Setup Convex Test Environment
```typescript
// packages/testing/setup.convex.ts
import { ConvexTestingHelper } from 'convex-test';
import schema from '@repo/backend/convex/schema';

export function createConvexTestContext() {
  return new ConvexTestingHelper(schema);
}

export async function testQuery<Args, Output>(
  t: ConvexTestingHelper,
  query: FunctionReference<'query', Args, Output>,
  args: Args,
  options?: { identity?: string }
): Promise<Output> {
  const identity = options?.identity
    ? { subject: options.identity }
    : undefined;

  return await t.query(query, args, { identity });
}

export async function testMutation<Args, Output>(
  t: ConvexTestingHelper,
  mutation: FunctionReference<'mutation', Args, Output>,
  args: Args,
  options?: { identity?: string }
): Promise<Output> {
  const identity = options?.identity
    ? { subject: options.identity }
    : undefined;

  return await t.mutation(mutation, args, { identity });
}

export async function testAction<Args, Output>(
  t: ConvexTestingHelper,
  action: FunctionReference<'action', Args, Output>,
  args: Args,
  options?: { identity?: string }
): Promise<Output> {
  const identity = options?.identity
    ? { subject: options.identity }
    : undefined;

  return await t.action(action, args, { identity });
}
```

### Testing Convex Functions
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createConvexTestContext, testMutation, testQuery } from '@repo/testing';
import { api } from '@repo/backend/convex/_generated/api';

describe('Projects', () => {
  const t = createConvexTestContext();

  beforeEach(async () => {
    await t.reset();
  });

  afterEach(async () => {
    await t.cleanup();
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      // Create user first
      const userId = await testMutation(
        t,
        api.users.internal.createUser,
        {
          email: 'test@example.com',
          name: 'Test User',
          clerkId: 'user_123',
        }
      );

      // Create project
      const project = await testMutation(
        t,
        api.projects.createProject,
        {
          name: 'Test Project',
          description: 'A test project',
        },
        { identity: 'user_123' }
      );

      expect(project).toMatchObject({
        name: 'Test Project',
        description: 'A test project',
        userId,
      });

      // Verify project exists
      const projects = await testQuery(
        t,
        api.projects.listProjects,
        {},
        { identity: 'user_123' }
      );

      expect(projects).toHaveLength(1);
      expect(projects[0]._id).toEqual(project._id);
    });

    it('should require authentication', async () => {
      await expect(
        testMutation(t, api.projects.createProject, {
          name: 'Test Project',
        })
      ).rejects.toThrow('Unauthenticated');
    });
  });

  describe('with existing data', () => {
    let userId: Id<'users'>;
    let projectId: Id<'projects'>;

    beforeEach(async () => {
      // Set up test data
      userId = await testMutation(
        t,
        api.users.internal.createUser,
        {
          email: 'test@example.com',
          name: 'Test User',
          clerkId: 'user_123',
        }
      );

      projectId = await testMutation(
        t,
        api.projects.createProject,
        { name: 'Existing Project' },
        { identity: 'user_123' }
      );
    });

    it('should update project', async () => {
      const updated = await testMutation(
        t,
        api.projects.updateProject,
        {
          id: projectId,
          name: 'Updated Name',
        },
        { identity: 'user_123' }
      );

      expect(updated.name).toBe('Updated Name');
    });

    it('should delete project', async () => {
      await testMutation(
        t,
        api.projects.deleteProject,
        { id: projectId },
        { identity: 'user_123' }
      );

      const projects = await testQuery(
        t,
        api.projects.listProjects,
        {},
        { identity: 'user_123' }
      );

      expect(projects).toHaveLength(0);
    });
  });
});
```

## E2E Testing with Playwright

### Playwright Configuration
```typescript
// packages/testing/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### E2E Test Fixtures
```typescript
// packages/testing/e2e/fixtures.ts
import { test as base, expect, Page } from '@playwright/test';

// Page Objects
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/dashboard');
  }
}

class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
  }

  async createProject(name: string, description?: string) {
    await this.page.click('[data-testid="create-project-button"]');
    await this.page.fill('[name="name"]', name);

    if (description) {
      await this.page.fill('[name="description"]', description);
    }

    await this.page.click('button[type="submit"]');
    await this.page.waitForSelector(`[data-project-name="${name}"]`);
  }
}

// Custom fixtures
type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  authenticatedPage: async ({ page, context }, use) => {
    // Set auth cookies/storage
    await context.addCookies([
      {
        name: '__session',
        value: process.env.TEST_SESSION_TOKEN || '',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');
    await use(page);
  },
});

export { expect };
```

### E2E Test Examples
```typescript
// e2e/auth.spec.ts
import { test, expect } from './fixtures';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page, loginPage }) => {
    await loginPage.goto();
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials');
  });

  test('should logout successfully', async ({ authenticatedPage }) => {
    await authenticatedPage.click('[data-testid="user-menu"]');
    await authenticatedPage.click('[data-testid="logout-button"]');

    await expect(authenticatedPage).toHaveURL('/');
    await expect(authenticatedPage.locator('[data-testid="login-link"]')).toBeVisible();
  });
});

// e2e/dashboard.spec.ts
test.describe('Dashboard', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
  });

  test('should display user projects', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.locator('[data-testid="projects-list"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="project-card"]')).toHaveCount(3);
  });

  test('should create new project', async ({ authenticatedPage, dashboardPage }) => {
    await dashboardPage.createProject('E2E Test Project', 'Created by Playwright');

    await expect(authenticatedPage.locator('[data-project-name="E2E Test Project"]')).toBeVisible();
  });

  test('should search projects', async ({ authenticatedPage }) => {
    await authenticatedPage.fill('[data-testid="search-input"]', 'test');
    await authenticatedPage.press('[data-testid="search-input"]', 'Enter');

    const projects = authenticatedPage.locator('[data-testid="project-card"]');
    await expect(projects).toHaveCount(1);
    await expect(projects.first()).toContainText('test');
  });
});
```

## Mock Data Generation

### Faker.js Integration
```typescript
// packages/testing/utils/mock-data.ts
import { faker } from '@faker-js/faker';

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    avatar: faker.image.avatar(),
    role: faker.helpers.arrayElement(['user', 'admin', 'moderator']),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

export function createMockProject(overrides?: Partial<Project>): Project {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    status: faker.helpers.arrayElement(['active', 'archived', 'draft']),
    userId: faker.string.uuid(),
    tags: faker.helpers.arrayElements(['frontend', 'backend', 'design', 'testing'], 2),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

export function generateMockData(config: {
  users?: number;
  projectsPerUser?: number;
}) {
  const users = Array.from({ length: config.users || 10 }, () => createMockUser());

  const projects = users.flatMap(user =>
    Array.from({ length: config.projectsPerUser || 3 }, () =>
      createMockProject({ userId: user.id })
    )
  );

  return { users, projects };
}

// Seed faker for consistent data
export function seedFaker(seed: number = 12345) {
  faker.seed(seed);
}
```

### Test Fixtures
```typescript
// packages/testing/fixtures/index.ts
export const testUsers = {
  admin: {
    id: 'user_admin',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as const,
  },
  user: {
    id: 'user_regular',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user' as const,
  },
  guest: {
    id: 'user_guest',
    email: 'guest@example.com',
    name: 'Guest User',
    role: 'guest' as const,
  },
} as const;

export const testProjects = {
  active: {
    id: 'project_active',
    name: 'Active Project',
    status: 'active' as const,
    userId: testUsers.admin.id,
  },
  archived: {
    id: 'project_archived',
    name: 'Archived Project',
    status: 'archived' as const,
    userId: testUsers.admin.id,
  },
} as const;

export const testApiResponses = {
  success: {
    status: 200,
    data: { message: 'Success' },
  },
  error: {
    status: 400,
    error: { message: 'Bad Request' },
  },
  unauthorized: {
    status: 401,
    error: { message: 'Unauthorized' },
  },
} as const;
```

## Coverage Configuration

### Coverage Thresholds
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      watermarks: {
        statements: [80, 95],
        branches: [80, 95],
        functions: [80, 95],
        lines: [80, 95],
      },
    },
  },
});
```

### Generating Coverage Reports
```bash
# Generate coverage
pnpm test:coverage

# View HTML report
open coverage/index.html

# Generate for CI (lcov format)
pnpm test:coverage --reporter=lcov
```

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - run: pnpm install --frozen-lockfile
      - run: pnpm playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          PLAYWRIGHT_TEST_BASE_URL: http://localhost:3000

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

### Test Organization
1. **Colocate tests with code** - Keep `.test.ts` files next to source files
2. **Use descriptive names** - Test names should describe behavior
3. **Follow AAA pattern** - Arrange, Act, Assert
4. **One assertion per test** - Keep tests focused
5. **Use test fixtures** - Consistent test data

### Performance
1. **Run tests in parallel** - Use Vitest's parallel execution
2. **Mock heavy operations** - Database, API calls, file I/O
3. **Use test databases** - Separate from development data
4. **Optimize E2E tests** - Reuse authentication state

### Maintainability
1. **Use Page Object Model** - For E2E tests
2. **Extract test utilities** - Reusable helper functions
3. **Keep tests DRY** - But prioritize clarity
4. **Document complex tests** - Add comments for context

## Common Issues & Solutions

### Flaky Tests
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Increase timeouts for slow operations
test('slow operation', async () => {
  // Test code
}, { timeout: 10000 });
```

### Mock Reset Issues
```typescript
// Always clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Or reset all mocks
afterEach(() => {
  vi.restoreAllMocks();
});
```

### Convex Test Isolation
```typescript
// Always reset database between tests
beforeEach(async () => {
  await t.reset();
});

// Clean up after tests
afterEach(async () => {
  await t.cleanup();
});
```

## Environment Variables
```env
# E2E Testing
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
TEST_SESSION_TOKEN=test_token_for_auth

# Coverage
COVERAGE_THRESHOLD=80

# Test environment
NODE_ENV=test
```

## Key Files
- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration
- `setup.ts` - Global test setup
- `utils/` - Test utilities and helpers
- `fixtures/` - Test data fixtures
- `e2e/` - End-to-end tests

## TurboKit Conventions
- Comprehensive test coverage for critical paths
- Fast unit tests with Vitest
- Reliable E2E tests with Playwright
- Type-safe test utilities
- Consistent mock data generation
- CI/CD integration ready