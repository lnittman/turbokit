import React, { ReactElement, ReactNode } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider } from "@clerk/nextjs";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

/**
 * React testing utilities
 */

// Create a mock Convex client for testing
const mockConvexClient = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://test.convex.cloud"
);

// Mock Clerk props
const mockClerkProps = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "test_pk",
};

/**
 * Custom render function with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  withConvex?: boolean;
  withClerk?: boolean;
  convexClient?: ConvexReactClient;
  clerkProps?: any;
  initialRouterEntry?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    withConvex = true,
    withClerk = false,
    convexClient = mockConvexClient,
    clerkProps = mockClerkProps,
    initialRouterEntry = "/",
    ...renderOptions
  }: CustomRenderOptions = {}
): RenderResult {
  function Wrapper({ children }: { children: ReactNode }) {
    let wrapped = children;
    
    // Wrap with Convex if needed
    if (withConvex) {
      wrapped = (
        <ConvexProvider client={convexClient}>
          {wrapped}
        </ConvexProvider>
      );
    }
    
    // Wrap with Clerk if needed
    if (withClerk) {
      wrapped = (
        <ClerkProvider {...clerkProps}>
          {wrapped}
        </ClerkProvider>
      );
    }
    
    return <>{wrapped}</>;
  }
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Create a user event instance for testing
 */
export function setupUserEvent(options?: Parameters<typeof userEvent.setup>[0]) {
  return userEvent.setup({
    delay: null, // Remove delay in tests for speed
    ...options,
  });
}

/**
 * Mock hook for testing components that use hooks
 */
export function mockHook<T>(hookName: string, returnValue: T) {
  return vi.mock(hookName, () => ({
    default: () => returnValue,
  }));
}

/**
 * Wait for element to be removed from DOM
 */
export async function waitForElementToBeRemoved(
  callback: () => HTMLElement | HTMLElement[] | null,
  options?: { timeout?: number; interval?: number }
) {
  const { timeout = 5000, interval = 50 } = options || {};
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = callback();
    if (!element || (Array.isArray(element) && element.length === 0)) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Element was not removed within ${timeout}ms`);
}

/**
 * Mock Next.js router
 */
export function createMockRouter(overrides?: Partial<any>) {
  return {
    basePath: "",
    pathname: "/",
    route: "/",
    asPath: "/",
    query: {},
    push: vi.fn().mockResolvedValue(true),
    replace: vi.fn().mockResolvedValue(true),
    reload: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
    ...overrides,
  };
}

/**
 * Create a mock Convex query/mutation
 */
export function createMockConvexFunction<T>(returnValue: T) {
  return vi.fn().mockResolvedValue(returnValue);
}

/**
 * Test accessibility of a component
 */
export async function testA11y(container: HTMLElement) {
  const results = await import("@axe-core/react").then(mod => mod.default.run(container));
  expect(results).toHaveNoViolations();
}

/**
 * Helper to test form submission
 */
export async function fillAndSubmitForm(
  container: HTMLElement,
  formData: Record<string, string>,
  submitButtonText: string = "Submit"
) {
  const user = setupUserEvent();
  
  // Fill in form fields
  for (const [name, value] of Object.entries(formData)) {
    const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      await user.clear(input);
      await user.type(input, value);
    }
  }
  
  // Submit form
  const submitButton = container.querySelector(`button[type="submit"]`) ||
    Array.from(container.querySelectorAll("button")).find(
      btn => btn.textContent?.includes(submitButtonText)
    );
    
  if (submitButton) {
    await user.click(submitButton);
  }
}

/**
 * Mock window.matchMedia
 */
export function mockMatchMedia(matches: boolean = false) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

/**
 * Test component snapshot
 */
export function testSnapshot(component: ReactElement, name?: string) {
  const { container } = render(component);
  expect(container.firstChild).toMatchSnapshot(name);
}

// Re-export commonly used testing library functions
export { 
  screen, 
  fireEvent, 
  waitFor, 
  within,
  act,
  cleanup,
  prettyDOM,
} from "@testing-library/react";

export { default as userEvent } from "@testing-library/user-event";