import { ConvexError, v } from "convex/values";
import { internalMutation, mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";

// Create a notification (typically called from other backend functions)
export const create = mutation({
	args: {
		userId: v.id("users"),
		type: v.string(),
		title: v.string(),
		body: v.string(),
		data: v.optional(v.any()),
		link: v.optional(v.string()),
		icon: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Check if user has preferences and respects them
		const prefs = await ctx.db
			.query("notificationPreferences")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.unique();

		// If in-app notifications are disabled, skip
		if (prefs && !prefs.inApp) {
			return null;
		}

		// Check type-specific preferences
		if (prefs?.types && prefs.types[args.type] === false) {
			return null;
		}

		const notificationId = await ctx.db.insert("notifications", {
			userId: args.userId,
			type: args.type,
			title: args.title,
			body: args.body,
			data: args.data,
			link: args.link,
			icon: args.icon,
			read: false,
			archived: false,
			createdAt: Date.now(),
		});

		// Log activity
		await ctx.db.insert("activities", {
			userId: args.userId,
			action: "notification.created",
			resourceType: "notification",
			resourceId: notificationId,
			metadata: { type: args.type },
			timestamp: Date.now(),
		});

		return notificationId;
	},
});

// Mark notification as read
export const markRead = mutation({
	args: { notificationId: v.id("notifications") },
	handler: async (ctx, { notificationId }) => {
		const { user } = await requireAuth(ctx);
		const notification = await ctx.db.get(notificationId);

		if (!notification) {
			throw new ConvexError("Notification not found");
		}

		if (notification.userId !== user._id) {
			throw new ConvexError("Unauthorized");
		}

		if (!notification.read) {
			await ctx.db.patch(notificationId, {
				read: true,
				readAt: Date.now(),
			});
		}
	},
});

// Mark all notifications as read
export const markAllRead = mutation({
	handler: async (ctx) => {
		const { user } = await requireAuth(ctx);

		const unread = await ctx.db
			.query("notifications")
			.withIndex("by_user_read", (q) =>
				q.eq("userId", user._id).eq("read", false),
			)
			.collect();

		const now = Date.now();
		for (const notification of unread) {
			await ctx.db.patch(notification._id, {
				read: true,
				readAt: now,
			});
		}

		return { count: unread.length };
	},
});

// Archive notification
export const archive = mutation({
	args: { notificationId: v.id("notifications") },
	handler: async (ctx, { notificationId }) => {
		const { user } = await requireAuth(ctx);
		const notification = await ctx.db.get(notificationId);

		if (!notification) {
			throw new ConvexError("Notification not found");
		}

		if (notification.userId !== user._id) {
			throw new ConvexError("Unauthorized");
		}

		await ctx.db.patch(notificationId, {
			archived: true,
			archivedAt: Date.now(),
		});
	},
});

// Delete notification
export const deleteNotification = mutation({
	args: { notificationId: v.id("notifications") },
	handler: async (ctx, { notificationId }) => {
		const { user } = await requireAuth(ctx);
		const notification = await ctx.db.get(notificationId);

		if (!notification) {
			throw new ConvexError("Notification not found");
		}

		if (notification.userId !== user._id) {
			throw new ConvexError("Unauthorized");
		}

		await ctx.db.delete(notificationId);
	},
});

// Update notification preferences
export const updatePreferences = mutation({
	args: {
		email: v.optional(v.boolean()),
		push: v.optional(v.boolean()),
		inApp: v.optional(v.boolean()),
		types: v.optional(v.any()), // Per-type preferences
	},
	handler: async (ctx, args) => {
		const { user } = await requireAuth(ctx);

		const existing = await ctx.db
			.query("notificationPreferences")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.unique();

		const now = Date.now();

		if (existing) {
			await ctx.db.patch(existing._id, {
				...(args.email !== undefined && { email: args.email }),
				...(args.push !== undefined && { push: args.push }),
				...(args.inApp !== undefined && { inApp: args.inApp }),
				...(args.types !== undefined && { types: args.types }),
				updatedAt: now,
			});
		} else {
			await ctx.db.insert("notificationPreferences", {
				userId: user._id,
				email: args.email ?? true,
				push: args.push ?? true,
				inApp: args.inApp ?? true,
				types: args.types || {},
				createdAt: now,
				updatedAt: now,
			});
		}

		// Log activity
		await ctx.db.insert("activities", {
			userId: user._id,
			action: "notification.preferences.updated",
			resourceType: "notificationPreferences",
			resourceId: user._id,
			metadata: { email: args.email, push: args.push, inApp: args.inApp },
			timestamp: now,
		});
	},
});

// Register device token for push notifications
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
			.unique();

		if (existing) {
			// Update last used
			await ctx.db.patch(existing._id, {
				lastUsed: Date.now(),
				deviceInfo,
			});
			return existing._id;
		}

		// Insert new token
		const tokenId = await ctx.db.insert("deviceTokens", {
			userId: user._id,
			token,
			platform,
			deviceInfo,
			lastUsed: Date.now(),
			createdAt: Date.now(),
		});

		return tokenId;
	},
});

// Unregister device token
export const unregisterDeviceToken = mutation({
	args: { token: v.string() },
	handler: async (ctx, { token }) => {
		const { user } = await requireAuth(ctx);

		const tokenDoc = await ctx.db
			.query("deviceTokens")
			.withIndex("by_token", (q) => q.eq("token", token))
			.unique();

		if (tokenDoc && tokenDoc.userId === user._id) {
			await ctx.db.delete(tokenDoc._id);
		}
	},
});

// Internal: remove a device token (used for invalid token cleanup after push failures)
export const deleteDeviceTokenInternal = internalMutation({
	args: { tokenId: v.id("deviceTokens") },
	handler: async (ctx, { tokenId }) => {
		await ctx.db.delete(tokenId);
	},
});

// Internal: Bulk create notifications (for system events)
export const bulkCreate = internalMutation({
	args: {
		notifications: v.array(
			v.object({
				userId: v.id("users"),
				type: v.string(),
				title: v.string(),
				body: v.string(),
				data: v.optional(v.any()),
				link: v.optional(v.string()),
				icon: v.optional(v.string()),
			}),
		),
	},
	handler: async (ctx, { notifications }) => {
		const ids: string[] = [];
		const now = Date.now();

		for (const notif of notifications) {
			const id = await ctx.db.insert("notifications", {
				...notif,
				read: false,
				archived: false,
				createdAt: now,
			});
			ids.push(id);
		}

		return ids;
	},
});
