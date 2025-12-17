import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";

/**
 * Create a new notification for a user
 * Used from backend code to notify users of events
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
    icon: v.optional(v.string()),
    data: v.optional(v.any()),
  },
  handler: async (ctx, { userId, type, title, body, link, icon, data }) => {
    // Check user preferences before creating
    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // If user has disabled this notification type, skip
    if (prefs?.types && prefs.types[type] === false) {
      return null;
    }

    // If user has disabled in-app notifications entirely, skip
    if (prefs && !prefs.inApp) {
      return null;
    }

    const notificationId = await ctx.db.insert("notifications", {
      userId,
      type,
      title,
      body,
      link,
      icon,
      data,
      read: false,
      archived: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

/**
 * Mark a notification as read
 */
export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const { user } = await requireAuth(ctx);
    const notification = await ctx.db.get(notificationId);

    if (!notification || notification.userId !== user._id) {
      throw new Error("Notification not found");
    }

    if (notification.read) {
      return; // Already read
    }

    await ctx.db.patch(notificationId, {
      read: true,
      readAt: Date.now(),
    });
  },
});

/**
 * Mark all notifications as read for the current user
 */
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    const now = Date.now();
    await Promise.all(
      unread.map((n) =>
        ctx.db.patch(n._id, {
          read: true,
          readAt: now,
        })
      )
    );

    return unread.length;
  },
});

/**
 * Archive a notification
 */
export const archive = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const { user } = await requireAuth(ctx);
    const notification = await ctx.db.get(notificationId);

    if (!notification || notification.userId !== user._id) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(notificationId, {
      archived: true,
      archivedAt: Date.now(),
    });
  },
});

/**
 * Delete a notification permanently
 */
export const remove = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const { user } = await requireAuth(ctx);
    const notification = await ctx.db.get(notificationId);

    if (!notification || notification.userId !== user._id) {
      throw new Error("Notification not found");
    }

    await ctx.db.delete(notificationId);
  },
});

/**
 * Update notification preferences
 */
export const updatePreferences = mutation({
  args: {
    email: v.optional(v.boolean()),
    push: v.optional(v.boolean()),
    inApp: v.optional(v.boolean()),
    types: v.optional(v.any()),
    digestFrequency: v.optional(
      v.union(v.literal("daily"), v.literal("weekly"), v.literal("never"))
    ),
  },
  handler: async (ctx, { email, push, inApp, types, digestFrequency }) => {
    const { user } = await requireAuth(ctx);

    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(email !== undefined && { email }),
        ...(push !== undefined && { push }),
        ...(inApp !== undefined && { inApp }),
        ...(types !== undefined && { types }),
        ...(digestFrequency !== undefined && { digestFrequency }),
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("notificationPreferences", {
        userId: user._id,
        email: email ?? true,
        push: push ?? true,
        inApp: inApp ?? true,
        types: types ?? {},
        digestFrequency: digestFrequency ?? "daily",
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Register a device token for push notifications
 */
export const registerDeviceToken = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal("fcm"), v.literal("apns"), v.literal("web")),
    deviceInfo: v.optional(v.any()),
  },
  handler: async (ctx, { token, platform, deviceInfo }) => {
    const { user } = await requireAuth(ctx);

    // Check if token already exists
    const existing = await ctx.db
      .query("deviceTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (existing) {
      // Update existing token
      await ctx.db.patch(existing._id, {
        userId: user._id, // In case token was transferred to new user
        platform,
        deviceInfo,
        lastUsed: Date.now(),
      });
      return existing._id;
    }

    // Create new token
    return await ctx.db.insert("deviceTokens", {
      userId: user._id,
      token,
      platform,
      deviceInfo,
      lastUsed: Date.now(),
      createdAt: Date.now(),
    });
  },
});

/**
 * Unregister a device token
 */
export const unregisterDeviceToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const { user } = await requireAuth(ctx);

    const existing = await ctx.db
      .query("deviceTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (existing && existing.userId === user._id) {
      await ctx.db.delete(existing._id);
    }
  },
});

/**
 * Bulk create notifications for multiple users
 * Useful for broadcasting announcements
 */
export const bulkCreate = mutation({
  args: {
    userIds: v.array(v.id("users")),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
    icon: v.optional(v.string()),
    data: v.optional(v.any()),
  },
  handler: async (ctx, { userIds, type, title, body, link, icon, data }) => {
    const now = Date.now();
    const created: string[] = [];

    for (const userId of userIds) {
      // Check user preferences
      const prefs = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (prefs?.types && prefs.types[type] === false) {
        continue;
      }

      if (prefs && !prefs.inApp) {
        continue;
      }

      const id = await ctx.db.insert("notifications", {
        userId,
        type,
        title,
        body,
        link,
        icon,
        data,
        read: false,
        archived: false,
        createdAt: now,
      });

      created.push(id);
    }

    return created;
  },
});
