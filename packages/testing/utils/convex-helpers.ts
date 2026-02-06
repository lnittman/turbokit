import type { DataModel } from "@repo/backend/convex/_generated/dataModel";
import type { Id } from "convex/values";
import { convexTest } from "convex-test";
import { vi } from "vitest";

/**
 * Convex-specific testing helpers
 */

/**
 * Create a test instance with the app schema
 */
export function createTestInstance() {
	// Import the actual schema from your backend
	const schema = require("@repo/backend/convex/schema").default;
	return convexTest(schema);
}

/**
 * Mock authenticated context for Convex functions
 */
export function mockAuthenticatedContext(
	userId: string = "test_user",
	email: string = "test@example.com",
) {
	return {
		auth: {
			getUserIdentity: vi.fn().mockResolvedValue({
				subject: userId,
				email,
				emailVerified: true,
				name: "Test User",
				pictureUrl: "https://example.com/avatar.jpg",
				tokenIdentifier: `https://clerk.com|${userId}`,
			}),
		},
	};
}

/**
 * Mock unauthenticated context
 */
export function mockUnauthenticatedContext() {
	return {
		auth: {
			getUserIdentity: vi.fn().mockResolvedValue(null),
		},
	};
}

/**
 * Create test data for a specific table
 */
export async function seedTable<T extends keyof DataModel>(
	t: ReturnType<typeof convexTest>,
	table: T,
	data: Partial<DataModel[T]["document"]>[],
) {
	const ids: Id<T>[] = [];

	await t.run(async (ctx) => {
		for (const item of data) {
			const id = await ctx.db.insert(table, item as any);
			ids.push(id as Id<T>);
		}
	});

	return ids;
}

/**
 * Clear all data from a table
 */
export async function clearTable<T extends keyof DataModel>(
	t: ReturnType<typeof convexTest>,
	table: T,
) {
	await t.run(async (ctx) => {
		const items = await ctx.db.query(table).collect();
		for (const item of items) {
			await ctx.db.delete(item._id);
		}
	});
}

/**
 * Test a Convex query
 */
export async function testQuery<_T>(
	t: ReturnType<typeof convexTest>,
	query: any,
	args: any,
	options?: {
		authenticated?: boolean;
		userId?: string;
		setup?: () => Promise<void>;
	},
) {
	const { authenticated = false, userId = "test_user", setup } = options || {};

	// Run setup if provided
	if (setup) {
		await setup();
	}

	// Create context
	const context = authenticated ? t.withIdentity({ subject: userId }) : t;

	// Run query
	return await context.run(query, args);
}

/**
 * Test a Convex mutation
 */
export async function testMutation<T>(
	t: ReturnType<typeof convexTest>,
	mutation: any,
	args: any,
	options?: {
		authenticated?: boolean;
		userId?: string;
		setup?: () => Promise<void>;
		verify?: (result: T) => Promise<void> | void;
	},
) {
	const {
		authenticated = false,
		userId = "test_user",
		setup,
		verify,
	} = options || {};

	// Run setup if provided
	if (setup) {
		await setup();
	}

	// Create context
	const context = authenticated ? t.withIdentity({ subject: userId }) : t;

	// Run mutation
	const result = await context.run(mutation, args);

	// Run verification if provided
	if (verify) {
		await verify(result);
	}

	return result;
}

/**
 * Test a Convex action
 */
export async function testAction<_T>(
	t: ReturnType<typeof convexTest>,
	action: any,
	args: any,
	options?: {
		authenticated?: boolean;
		userId?: string;
		mocks?: {
			fetch?: vi.Mock;
			env?: Record<string, string>;
		};
	},
) {
	const { authenticated = false, userId = "test_user", mocks } = options || {};

	// Setup mocks
	if (mocks?.fetch) {
		global.fetch = mocks.fetch;
	}
	if (mocks?.env) {
		Object.assign(process.env, mocks.env);
	}

	// Create context
	const context = authenticated ? t.withIdentity({ subject: userId }) : t;

	// Run action
	return await context.run(action, args);
}

/**
 * Test error handling in Convex functions
 */
export async function expectConvexError(
	fn: () => Promise<any>,
	expectedError?: string | RegExp,
) {
	try {
		await fn();
		throw new Error("Expected function to throw, but it didn't");
	} catch (error: any) {
		if (expectedError) {
			const message = error.message || String(error);
			if (typeof expectedError === "string") {
				expect(message).toContain(expectedError);
			} else {
				expect(message).toMatch(expectedError);
			}
		}
	}
}

/**
 * Create a mock scheduler for testing scheduled functions
 */
export function createMockScheduler() {
	const scheduled: Array<{
		delay: number;
		functionName: string;
		args: any;
	}> = [];

	return {
		runAfter: vi.fn((delay: number, functionName: string, args: any) => {
			scheduled.push({ delay, functionName, args });
			return Promise.resolve(`job_${Date.now()}`);
		}),
		runAt: vi.fn((timestamp: number, functionName: string, args: any) => {
			const delay = timestamp - Date.now();
			scheduled.push({ delay, functionName, args });
			return Promise.resolve(`job_${Date.now()}`);
		}),
		getScheduled: () => scheduled,
		clear: () => {
			scheduled.length = 0;
		},
	};
}

/**
 * Create a mock storage for testing file operations
 */
export function createMockStorage() {
	const files = new Map<string, any>();

	return {
		generateUploadUrl: vi
			.fn()
			.mockResolvedValue(`https://upload.example.com/${Date.now()}`),
		getUrl: vi.fn((storageId: string) => {
			return files.has(storageId)
				? `https://storage.example.com/${storageId}`
				: null;
		}),
		delete: vi.fn((storageId: string) => {
			files.delete(storageId);
			return Promise.resolve();
		}),
		store: (storageId: string, data: any) => {
			files.set(storageId, data);
		},
		getFiles: () => files,
	};
}

/**
 * Test pagination
 */
export async function testPagination<T>(
	t: ReturnType<typeof convexTest>,
	paginatedFunction: any,
	args: any,
	expectedTotal: number,
) {
	const results: T[] = [];
	let cursor = null;
	let iterations = 0;
	const maxIterations = 10; // Prevent infinite loops

	while (iterations < maxIterations) {
		const page = await t.run(paginatedFunction, { ...args, cursor });
		results.push(...page.data);

		if (page.isDone) {
			break;
		}

		cursor = page.cursor;
		iterations++;
	}

	expect(results).toHaveLength(expectedTotal);
	return results;
}
