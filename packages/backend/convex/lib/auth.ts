import { ConvexError, v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import {
  type ActionCtx,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "../_generated/server";

type AuthenticatedQueryCtx = QueryCtx & {
  user: Doc<"users">;
  userId: string;
};

type AuthenticatedMutationCtx = MutationCtx & {
  user: Doc<"users">;
  userId: string;
};

type AuthenticatedActionCtx = ActionCtx & {
  user: Doc<"users">;
  userId: string;
};

export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx | ActionCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthorized");
  }
  return identity.subject;
}

export async function getAuthUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const clerkId = await getAuthUserId(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();

  if (!user) {
    throw new ConvexError("User not found");
  }

  return user;
}

export async function requireAuth<Ctx extends QueryCtx | MutationCtx>(
  ctx: Ctx
): Promise<Ctx & { user: Doc<"users">; userId: string }> {
  const user = await getAuthUser(ctx);
  return { ...(ctx as any), user, userId: user._id } as any;
}

// Internal query for getting user by clerkId (used in actions)
export const _getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

export async function requireAuthAction(
  ctx: ActionCtx
): Promise<AuthenticatedActionCtx> {
  const clerkId = await getAuthUserId(ctx);
  // In actions, we need to query the database via runQuery
  const user = await ctx.runQuery(_getUserByClerkId as any, { clerkId });

  if (!user) {
    throw new ConvexError("User not found");
  }

  return { ...(ctx as any), user, userId: user._id } as any;
}

export function requireRole(user: Doc<"users">, role: "admin"): void {
  if (user.role !== role) {
    throw new ConvexError("Insufficient permissions");
  }
}

// Spots-specific auth helpers

export async function requireOnboarding(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const user = await getAuthUser(ctx);

  if (!user.onboardingComplete) {
    throw new ConvexError("Onboarding not completed");
  }

  return user;
}

export function requireOwnership(userId: string, resourceUserId: string): void {
  if (userId !== resourceUserId) {
    throw new ConvexError("Access denied: not resource owner");
  }
}
