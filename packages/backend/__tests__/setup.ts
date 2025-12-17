import { convexTest } from "convex-test";
import type { Id } from "../convex/_generated/dataModel";
import schema from "../convex/schema";
import { modules } from "../test-setup/convex.setup";

export type TestContext = ReturnType<typeof convexTest<typeof schema>>;

export interface TestUser {
  userId: Id<"users">;
  clerkId: string;
  email: string;
}

export interface TestSpot {
  spotId: Id<"spots">;
  name: string;
  city: string;
  country: string;
}

export interface TestInterest {
  interestId: Id<"interests">;
  name: string;
}

export function createTestContext(): TestContext {
  return convexTest(schema, modules);
}

export async function withTestUser(
  t: TestContext,
  overrides: Partial<{
    clerkId: string;
    email: string;
    name: string;
    role: "user" | "admin";
    onboardingComplete: boolean;
  }> = {}
): Promise<TestUser> {
  const clerkId =
    overrides.clerkId ??
    `test-clerk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = overrides.email ?? `test-${clerkId}@example.com`;

  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      clerkId,
      email,
      name: overrides.name,
      role: overrides.role ?? "user",
      onboardingComplete: overrides.onboardingComplete ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  return { userId, clerkId, email };
}

export async function withTestSpot(
  t: TestContext,
  overrides: Partial<{
    name: string;
    description: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    rating: number;
  }> = {}
): Promise<TestSpot> {
  const name = overrides.name ?? `Test Spot ${Date.now()}`;
  const city = overrides.city ?? "San Francisco";
  const country = overrides.country ?? "USA";

  const spotId = await t.run(async (ctx) => {
    return await ctx.db.insert("spots", {
      name,
      description: overrides.description,
      city,
      country,
      latitude: overrides.latitude ?? 37.7749,
      longitude: overrides.longitude ?? -122.4194,
      rating: overrides.rating,
      checkInsCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  return { spotId, name, city, country };
}

export async function withTestInterest(
  t: TestContext,
  overrides: Partial<{
    name: string;
    description: string;
    category: string;
    trending: boolean;
    trendScore: number;
  }> = {}
): Promise<TestInterest> {
  const name = overrides.name ?? `Test Interest ${Date.now()}`;

  const interestId = await t.run(async (ctx) => {
    return await ctx.db.insert("interests", {
      name,
      description: overrides.description,
      category: overrides.category,
      trending: overrides.trending ?? false,
      trendScore: overrides.trendScore ?? 0,
      isSeasonal: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  return { interestId, name };
}

export async function withTestImageJob(
  t: TestContext,
  userId: Id<"users">,
  overrides: Partial<{
    prompt: string;
    provider: string;
    status: string;
  }> = {}
): Promise<Id<"imageJobs">> {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("imageJobs", {
      userId,
      prompt: overrides.prompt ?? "Test prompt",
      provider: overrides.provider ?? "openai",
      status: overrides.status ?? "queued",
      attempts: 0,
      correlationId: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });
}

export { modules };
