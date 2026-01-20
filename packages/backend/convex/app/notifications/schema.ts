import { defineTable } from "convex/server";
import { v } from "convex/values";

// In-app notifications
export const notifications = defineTable({
  userId: v.id("users"),
  type: v.string(), // "user.welcome", "billing.renewal", etc.
  title: v.string(),
  body: v.string(),
  data: v.optional(v.any()), // Custom payload for the notification
  link: v.optional(v.string()), // Deep link or URL
  icon: v.optional(v.string()), // Icon name or URL
  read: v.boolean(),
  readAt: v.optional(v.number()),
  archived: v.boolean(),
  archivedAt: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_read", ["userId", "read"])
  .index("by_user_archived", ["userId", "archived"])
  .index("by_type", ["type"])
  .index("by_created", ["createdAt"]);

// Device tokens for push notifications (FCM/APNs)
export const deviceTokens = defineTable({
  userId: v.id("users"),
  token: v.string(),
  platform: v.union(
    v.literal("fcm"), // Firebase Cloud Messaging (Android/Web)
    v.literal("apns"), // Apple Push Notification service (iOS)
    v.literal("web") // Web Push
  ),
  deviceInfo: v.optional(v.any()), // Browser, OS, etc.
  lastUsed: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_token", ["token"])
  .index("by_platform", ["platform"]);

// User notification preferences
export const notificationPreferences = defineTable({
  userId: v.id("users"),
  email: v.boolean(), // Email notifications enabled
  push: v.boolean(), // Push notifications enabled
  inApp: v.boolean(), // In-app notifications enabled
  types: v.optional(v.any()), // Per-type preferences: { "user.welcome": false, ... }
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"]);
