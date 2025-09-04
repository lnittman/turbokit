/**
 * TurboKit Testing Library
 * 
 * Comprehensive testing utilities for unit, integration, and E2E tests
 */

// Export Vitest configuration
export { default as vitestConfig, frontendConfig, backendConfig } from "./vitest.config";

// Export testing utilities
export * from "./utils";

// Export test fixtures
export * from "./fixtures";

// Export E2E fixtures and helpers (only for Playwright tests)
// These are typically imported directly in E2E test files:
// import { test, expect } from "@repo/testing/e2e/fixtures";

// Re-export commonly used testing libraries
export { describe, it, test, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from "vitest";
export { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
export { convexTest } from "convex-test";

// Export type definitions
export type { RenderResult, RenderOptions } from "@testing-library/react";
export type { ConvexTestingCtx } from "convex-test";