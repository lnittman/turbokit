import { v } from "convex/values";
import { query } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";

/**
 * Get count of unread notifications for the current user
 */
export const countUnread = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .filter((q) => q.eq(q.field("archived"), false))
      .collect();

    return unread.length;
  },
});

/**
 * List notifications for the current user
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, { limit = 20, includeArchived = false }) => {
    const { user } = await requireAuth(ctx);

    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc");

    if (!includeArchived) {
      query = query.filter((q) => q.eq(q.field("archived"), false));
    }

    return await query.take(limit);
  },
});

/**
 * List only unread notifications
 */
export const listUnread = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    const { user } = await requireAuth(ctx);

    return await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .filter((q) => q.eq(q.field("archived"), false))
      .order("desc")
      .take(limit);
  },
});

/**
 * Get a single notification by ID
 */
export const get = query({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const { user } = await requireAuth(ctx);
    const notification = await ctx.db.get(notificationId);

    if (!notification || notification.userId !== user._id) {
      return null;
    }

    return notification;
  },
});

/**
 * Get notification preferences for the current user
 */
export const getPreferences = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);

    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // Return defaults if no preferences exist
    if (!prefs) {
      return {
        email: true,
        push: true,
        inApp: true,
        types: {},
        digestFrequency: "daily" as const,
      };
    }

    return {
      email: prefs.email,
      push: prefs.push,
      inApp: prefs.inApp,
      types: prefs.types ?? {},
      digestFrequency: prefs.digestFrequency ?? "daily",
    };
  },
});

/**
 * Get registered device tokens for push notifications
 */
export const getDeviceTokens = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);

    return await ctx.db
      .query("deviceTokens")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});
