import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const createUser = internalMutation({
  args: { clerkId: v.string(), email: v.string(), name: v.optional(v.string()), imageUrl: v.optional(v.string()) },
  handler: async (ctx, { clerkId, email, name, imageUrl }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (existing) return existing._id;
    const userId = await ctx.db.insert("users", { clerkId, email, name, imageUrl, role: "user", createdAt: Date.now(), updatedAt: Date.now() });
    await ctx.db.insert("activities", { userId, action: "user.created", resourceType: "user", resourceId: userId, timestamp: Date.now() });
    return userId;
  },
});

export const updateUser = internalMutation({
  args: { clerkId: v.string(), email: v.string(), name: v.optional(v.string()), imageUrl: v.optional(v.string()) },
  handler: async (ctx, { clerkId, email, name, imageUrl }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (!user) {
      return ctx.scheduler.runNow(ctx.api.users.internal.createUser, { clerkId, email, name, imageUrl });
    }
    await ctx.db.patch(user._id, { email, name, imageUrl, updatedAt: Date.now() });
    return user._id;
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (!user) return;
    await ctx.db.delete(user._id);
    await ctx.db.insert("activities", { userId: user._id, action: "user.deleted", resourceType: "user", resourceId: user._id, timestamp: Date.now() });
  },
});

export const logActivity = internalMutation({
  args: { userId: v.union(v.id("users"), v.literal("system")), action: v.string(), resourceType: v.optional(v.string()), resourceId: v.optional(v.string()), metadata: v.optional(v.any()) },
  handler: async (ctx, args) => {
    await ctx.db.insert("activities", { userId: args.userId as any, action: args.action, resourceType: args.resourceType, resourceId: args.resourceId, metadata: args.metadata, timestamp: Date.now() });
  },
});

