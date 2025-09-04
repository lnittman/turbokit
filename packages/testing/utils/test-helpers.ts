import { convexTest } from "convex-test";
import type { ConvexTestingCtx } from "convex-test";
import { GenericId, Id } from "convex/values";
import { vi } from "vitest";

/**
 * Create a test context with common setup for Convex testing
 */
export function createConvexTestContext(schema: any) {
  const t = convexTest(schema);
  
  return {
    t,
    
    /**
     * Create an authenticated context with a test user
     */
    withUser: (userId: string = "test_user_123", email: string = "test@example.com") => {
      return t.withIdentity({ 
        subject: userId,
        email,
        emailVerified: true,
        tokenIdentifier: `test-${userId}`,
      });
    },
    
    /**
     * Create an admin user context
     */
    withAdmin: (userId: string = "admin_user_123") => {
      return t.withIdentity({
        subject: userId,
        email: "admin@example.com",
        emailVerified: true,
        tokenIdentifier: `admin-${userId}`,
        // Add admin claims if needed
        isAdmin: true,
      });
    },
    
    /**
     * Seed initial test data
     */
    seedData: async () => {
      return await t.run(async (ctx) => {
        // Create test user
        const userId = await ctx.db.insert("users", {
          clerkId: "test_user_123",
          email: "test@example.com",
          name: "Test User",
          role: "user",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        // Create test project
        const projectId = await ctx.db.insert("projects", {
          name: "Test Project",
          description: "A test project for testing",
          ownerId: userId as Id<"users">,
          status: "active",
          settings: {},
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        return { userId, projectId };
      });
    },
    
    /**
     * Clean up all test data
     */
    cleanup: async () => {
      await t.run(async (ctx) => {
        // List of tables to clean
        const tables = [
          "users",
          "projects", 
          "activities",
          "threads",
          "messages",
        ];
        
        for (const table of tables) {
          try {
            const items = await ctx.db.query(table as any).collect();
            for (const item of items) {
              await ctx.db.delete(item._id);
            }
          } catch (error) {
            // Table might not exist, continue
            console.warn(`Could not clean table ${table}:`, error);
          }
        }
      });
    },
    
    /**
     * Create a test user in the database
     */
    createUser: async (overrides?: Partial<any>) => {
      return await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          clerkId: `clerk_${Date.now()}`,
          email: `test${Date.now()}@example.com`,
          name: "Test User",
          role: "user",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...overrides,
        });
      });
    },
  };
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => Promise<boolean> | boolean,
  options: {
    timeout?: number;
    interval?: number;
    message?: string;
  } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100, message = "Condition not met" } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Timeout: ${message} after ${timeout}ms`);
}

/**
 * Create a mock context for testing functions that need ctx
 */
export function createMockContext() {
  return {
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue({
        subject: "test_user_123",
        email: "test@example.com",
        emailVerified: true,
      }),
    },
    db: {
      query: vi.fn().mockReturnThis(),
      insert: vi.fn(),
      patch: vi.fn(),
      replace: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(),
      withIndex: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      first: vi.fn(),
      unique: vi.fn(),
      collect: vi.fn().mockResolvedValue([]),
    },
    scheduler: {
      runAfter: vi.fn(),
      runAt: vi.fn(),
    },
    storage: {
      generateUploadUrl: vi.fn(),
      getUrl: vi.fn(),
      delete: vi.fn(),
    },
  };
}

/**
 * Helper to create a delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to create a mock ID
 */
export function mockId<T extends string>(table: T): Id<T> {
  return `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as Id<T>;
}

/**
 * Helper to assert that a function throws
 */
export async function expectToThrow(
  fn: () => Promise<any> | any,
  errorMessage?: string | RegExp
): Promise<void> {
  let threw = false;
  let error: any;
  
  try {
    await fn();
  } catch (e) {
    threw = true;
    error = e;
  }
  
  if (!threw) {
    throw new Error("Expected function to throw, but it didn't");
  }
  
  if (errorMessage) {
    const message = error?.message || String(error);
    if (typeof errorMessage === "string") {
      if (!message.includes(errorMessage)) {
        throw new Error(`Expected error to include "${errorMessage}", but got "${message}"`);
      }
    } else {
      if (!errorMessage.test(message)) {
        throw new Error(`Expected error to match ${errorMessage}, but got "${message}"`);
      }
    }
  }
}

/**
 * Helper to spy on console methods
 */
export function spyOnConsole() {
  const originalConsole = { ...console };
  const spies = {
    log: vi.spyOn(console, "log"),
    error: vi.spyOn(console, "error"),
    warn: vi.spyOn(console, "warn"),
    info: vi.spyOn(console, "info"),
    debug: vi.spyOn(console, "debug"),
  };
  
  return {
    spies,
    restore: () => {
      Object.keys(spies).forEach(key => {
        spies[key as keyof typeof spies].mockRestore();
      });
    },
    getLastLog: () => spies.log.mock.calls[spies.log.mock.calls.length - 1],
    getLastError: () => spies.error.mock.calls[spies.error.mock.calls.length - 1],
  };
}