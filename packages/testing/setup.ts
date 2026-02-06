import { vi } from "vitest";

/**
 * Global test setup
 * This file runs before all tests
 */

// Mock console methods to reduce noise in tests
// Keep error and warn for debugging
global.console = {
	...console,
	log: vi.fn(),
	debug: vi.fn(),
	info: vi.fn(),
	// Keep warn and error for visibility
	warn: console.warn,
	error: console.error,
	trace: vi.fn(),
	dir: vi.fn(),
	dirxml: vi.fn(),
	group: vi.fn(),
	groupCollapsed: vi.fn(),
	groupEnd: vi.fn(),
	table: vi.fn(),
	time: vi.fn(),
	timeEnd: vi.fn(),
	timeLog: vi.fn(),
	clear: vi.fn(),
	count: vi.fn(),
	countReset: vi.fn(),
	assert: vi.fn(),
	profile: vi.fn(),
	profileEnd: vi.fn(),
	timeStamp: vi.fn(),
};

// Setup test timeouts
vi.setConfig({
	testTimeout: 10000,
	hookTimeout: 10000,
});

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.CONVEX_URL = process.env.CONVEX_URL || "https://test.convex.cloud";
process.env.NEXT_PUBLIC_CONVEX_URL =
	process.env.NEXT_PUBLIC_CONVEX_URL || "https://test.convex.cloud";
process.env.CLERK_SECRET_KEY =
	process.env.CLERK_SECRET_KEY || "test_clerk_secret";
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
	process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "test_clerk_publishable";

// Mock fetch for tests
if (!globalThis.fetch) {
	vi.stubGlobal("fetch", vi.fn());
}

// Setup performance monitoring
beforeAll(() => {
	// Record test start time
	(global as any).__TEST_START_TIME = Date.now();
});

afterAll(() => {
	// Log test suite duration
	const duration = Date.now() - (global as any).__TEST_START_TIME;
	if (process.env.VITEST_SHOW_DURATION === "true") {
		console.warn(`Test suite completed in ${duration}ms`);
	}
});

// Clean up after each test
afterEach(() => {
	// Clear all mocks
	vi.clearAllMocks();

	// Clear any timers
	vi.clearAllTimers();

	// Restore all mocks
	vi.restoreAllMocks();
});

export * from "./utils/mock-data";
// Export test utilities
export * from "./utils/test-helpers";
