import { beforeAll, afterAll, afterEach } from "vitest";

/**
 * Convex backend testing setup
 * This file runs before Convex/backend tests
 */

// Setup Convex test environment
beforeAll(() => {
  // Set up any global Convex test configuration
  process.env.CONVEX_TEST_MODE = "true";
  
  // Disable Convex telemetry in tests
  process.env.CONVEX_TELEMETRY_DISABLED = "true";
  
  // Use test deployment if not specified
  if (!process.env.CONVEX_DEPLOYMENT) {
    process.env.CONVEX_DEPLOYMENT = "test";
  }
});

// Clean up after each test
afterEach(async () => {
  // Clear any test data if needed
  // This would typically be handled by convex-test's cleanup
});

// Global teardown
afterAll(() => {
  // Clean up any resources
  delete process.env.CONVEX_TEST_MODE;
});