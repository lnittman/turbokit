/**
 * TurboKit Testing Library
 *
 * Comprehensive testing utilities for unit, integration, and E2E tests
 */

// Export test fixtures
export * from "./fixtures";

// Export testing utilities
export * from "./utils";
// Export Vitest configuration
export {
	backendConfig,
	default as vitestConfig,
	frontendConfig,
} from "./vitest.config";

// Export E2E fixtures and helpers (only for Playwright tests)
// These are typically imported directly in E2E test files:
// import { test, expect } from "@repo/testing/e2e/fixtures";

// Export type definitions
export type { RenderOptions, RenderResult } from "@testing-library/react";
export {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
export type { ConvexTestingCtx } from "convex-test";
export { convexTest } from "convex-test";
// Re-export commonly used testing libraries
export {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	test,
	vi,
} from "vitest";
