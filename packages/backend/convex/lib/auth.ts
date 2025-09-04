import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { ConvexError } from "convex/values";
import { Doc } from "../_generated/dataModel";

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

export async function getAuthUserId(ctx: QueryCtx | MutationCtx | ActionCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthorized");
  }
  return identity.subject;
}

export async function getAuthUser(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
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
  return {
    ...ctx,
    user,
    userId: user._id,
  } as any;
}

export async function requireAuthAction(
  ctx: ActionCtx
): Promise<AuthenticatedActionCtx> {
  const clerkId = await getAuthUserId(ctx);
  // In actions, we need to query the database via runQuery
  const user = await ctx.runQuery(
    async ({ db }: { db: any }) => {
      return await db
        .query("users")
        .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
        .unique();
    }
  );
  
  if (!user) {
    throw new ConvexError("User not found");
  }
  
  return {
    ...ctx,
    user,
    userId: user._id,
  } as any;
}

export function requireRole(user: Doc<"users">, role: "admin"): void {
  if (user.role !== role) {
    throw new ConvexError("Insufficient permissions");
  }
}

