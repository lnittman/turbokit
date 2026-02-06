import { v } from "convex/values";
import { internalQuery, query } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";

// List user's notifications (paginated, real-time)
export const list = query({
	args: {
		limit: v.optional(v.number()),
		includeArchived: v.optional(v.boolean()),
	},
	handler: async (ctx, { limit = 50, includeArchived = false }) => {
		const { user } = await requireAuth(ctx);

		let notificationsQuery = ctx.db
			.query("notifications")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.order("desc");

		if (!includeArchived) {
			notificationsQuery = ctx.db
				.query("notifications")
				.withIndex("by_user_archived", (q) =>
					q.eq("userId", user._id).eq("archived", false),
				)
				.order("desc");
		}

		return await notificationsQuery.take(limit);
	},
});

// Count unread notifications (for badge)
export const countUnread = query({
	handler: async (ctx) => {
		const { user } = await requireAuth(ctx);

		const unread = await ctx.db
			.query("notifications")
			.withIndex("by_user_read", (q) =>
				q.eq("userId", user._id).eq("read", false),
			)
			.collect();

		return unread.length;
	},
});

// Get user's notification preferences
export const getPreferences = query({
	handler: async (ctx) => {
		const { user } = await requireAuth(ctx);

		const prefs = await ctx.db
			.query("notificationPreferences")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.unique();

		// Return defaults if not set
		return (
			prefs || {
				email: true,
				push: true,
				inApp: true,
				types: {},
			}
		);
	},
});

// Get unread notifications only
export const listUnread = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, { limit = 50 }) => {
		const { user } = await requireAuth(ctx);

		return await ctx.db
			.query("notifications")
			.withIndex("by_user_read", (q) =>
				q.eq("userId", user._id).eq("read", false),
			)
			.order("desc")
			.take(limit);
	},
});

// Get notification by ID
export const getById = query({
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

// Internal query: fetch all device tokens for a target user.
export const getDeviceTokensInternal = internalQuery({
	args: { userId: v.id("users") },
	handler: async (ctx, { userId }) => {
		return await ctx.db
			.query("deviceTokens")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();
	},
});
