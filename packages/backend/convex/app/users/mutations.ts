import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getAuthUser } from "../../lib/auth";

export const upsert = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role: "user",
      onboardingComplete: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    await ctx.db.patch(user._id, {
      onboardingComplete: true,
      updatedAt: Date.now(),
    });
    return user._id;
  },
});

export const updateInterests = mutation({
  args: { interestIds: v.array(v.id("interests")) },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const existing = await ctx.db
      .query("userInterests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const ui of existing) {
      await ctx.db.delete(ui._id);
    }

    for (const interestId of args.interestIds) {
      await ctx.db.insert("userInterests", {
        userId: user._id,
        interestId,
        strength: 0.7,
        source: "onboarding",
        createdAt: Date.now(),
      });
    }
    return true;
  },
});
