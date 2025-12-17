import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { internal } from "../../_generated/api";

/**
 * Add an interest to the current user
 */
export const addToUser = mutation({
  args: {
    interestName: v.string(),
    category: v.optional(v.string()),
    source: v.optional(
      v.union(
        v.literal("onboarding"),
        v.literal("explicit"),
        v.literal("inferred")
      )
    ),
  },
  handler: async (ctx, args): Promise<Id<"interests">> => {
    const { user } = await requireAuth(ctx);

    // Ensure the interest exists (create if not)
    const interestId = (await ctx.runMutation(
      internal.app.interests.internal.ensureInterestExists as any,
      { name: args.interestName, category: args.category }
    )) as Id<"interests">;

    // Add to user's interests
    await ctx.runMutation(
      internal.app.interests.internal.addUserInterest as any,
      {
        userId: user._id,
        interestId,
        strength: 0.5,
        source: args.source ?? "explicit",
      }
    );

    // Increment trend score for this interest
    await ctx.runMutation(
      internal.app.interests.internal.updateTrendScore as any,
      {
        interestId,
        scoreDelta: 1,
      }
    );

    return interestId;
  },
});

/**
 * Remove an interest from the current user
 */
export const removeFromUser = mutation({
  args: {
    interestId: v.id("interests"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { user } = await requireAuth(ctx);

    await ctx.runMutation(
      internal.app.interests.internal.removeUserInterest as any,
      {
        userId: user._id,
        interestId: args.interestId,
      }
    );

    // Decrement trend score
    await ctx.runMutation(
      internal.app.interests.internal.updateTrendScore as any,
      {
        interestId: args.interestId,
        scoreDelta: -1,
      }
    );

    return true;
  },
});

/**
 * Set user's interests (replaces existing)
 */
export const setUserInterests = mutation({
  args: {
    interestNames: v.array(v.string()),
    source: v.optional(
      v.union(
        v.literal("onboarding"),
        v.literal("explicit"),
        v.literal("inferred")
      )
    ),
  },
  handler: async (ctx, args): Promise<Id<"interests">[]> => {
    const { user } = await requireAuth(ctx);

    // Get current user interests
    const currentInterests = await ctx.db
      .query("userInterests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Remove all current interests
    for (const ui of currentInterests) {
      await ctx.db.delete(ui._id);
    }

    // Add new interests
    const addedIds: Id<"interests">[] = [];
    for (const name of args.interestNames) {
      // Ensure interest exists
      const interestId = (await ctx.runMutation(
        internal.app.interests.internal.ensureInterestExists as any,
        { name }
      )) as Id<"interests">;

      // Add to user
      await ctx.runMutation(
        internal.app.interests.internal.addUserInterest as any,
        {
          userId: user._id,
          interestId,
          strength: 0.5,
          source: args.source ?? "explicit",
        }
      );

      addedIds.push(interestId);
    }

    return addedIds;
  },
});

/**
 * Update the strength of a user's interest
 */
export const updateStrength = mutation({
  args: {
    interestId: v.id("interests"),
    strength: v.number(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);

    const userInterest = await ctx.db
      .query("userInterests")
      .withIndex("by_user_interest", (q) =>
        q.eq("userId", user._id).eq("interestId", args.interestId)
      )
      .first();

    if (!userInterest) {
      throw new Error("User does not have this interest");
    }

    await ctx.db.patch(userInterest._id, {
      strength: Math.max(0, Math.min(1, args.strength)),
      updatedAt: Date.now(),
    });

    return true;
  },
});
