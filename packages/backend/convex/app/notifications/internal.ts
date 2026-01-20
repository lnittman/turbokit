import { internalAction, internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import { sendFCMNotification, sendAPNsNotification } from "../../lib/push";

// Internal action: Send push notification to user's devices
export const sendPush = internalAction({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    link: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    badge: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user's device tokens
    const tokens = await ctx.runQuery(internal.app.notifications.internal.getDeviceTokens, {
      userId: args.userId,
    });

    if (tokens.length === 0) {
      console.log(`[PUSH] No device tokens for user ${args.userId}`);
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    // Convert data to string key-value pairs (required by FCM)
    const dataStrings = args.data
      ? Object.entries(args.data).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      : undefined;

    // Send to FCM (Android)
    const fcmTokens = tokens.filter((t) => t.platform === "fcm");
    for (const tokenDoc of fcmTokens) {
      const success = await sendFCMNotification({
        token: tokenDoc.token,
        title: args.title,
        body: args.body,
        data: dataStrings,
        imageUrl: args.imageUrl,
      });

      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    // Send to APNs (iOS)
    const apnsTokens = tokens.filter((t) => t.platform === "apns");
    for (const tokenDoc of apnsTokens) {
      const success = await sendAPNsNotification({
        token: tokenDoc.token,
        title: args.title,
        body: args.body,
        data: args.data,
        badge: args.badge,
      });

      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    // Web Push (optional - implement separately)
    const webTokens = tokens.filter((t) => t.platform === "web");
    if (webTokens.length > 0) {
      // Web Push implementation would use web-push library
      // See: https://www.npmjs.com/package/web-push
      console.log(`[PUSH] Web Push: ${webTokens.length} tokens (not implemented)`);
    }

    console.log(`[PUSH] Sent ${sent}/${tokens.length} notifications to user ${args.userId}`);

    return { sent, failed, total: tokens.length };
  },
});

// Internal query: Get user's device tokens
export const getDeviceTokens = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("deviceTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Internal action: Notify user (in-app + push)
export const notifyUser = internalAction({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    link: v.optional(v.string()),
    icon: v.optional(v.string()),
    sendPush: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Create in-app notification
    const notificationId = await ctx.runMutation(
      api.app.notifications.mutations.create,
      {
        userId: args.userId,
        type: args.type,
        title: args.title,
        body: args.body,
        data: args.data,
        link: args.link,
        icon: args.icon,
      }
    );

    // Send push notification if requested
    if (args.sendPush) {
      await sendPush(ctx, {
        userId: args.userId,
        title: args.title,
        body: args.body,
        data: args.data,
        link: args.link,
      });
    }

    return notificationId;
  },
});

// Example: Workflow-triggered notification
// This can be called from workflows or scheduled jobs
export const notifyUserWelcome = internalAction({
  args: {
    userId: v.id("users"),
    userName: v.string(),
  },
  handler: async (ctx, { userId, userName }) => {
    await notifyUser(ctx, {
      userId,
      type: "user.welcome",
      title: `Welcome, ${userName}!`,
      body: "Thanks for joining TurboKit. Let's get you started.",
      icon: "welcome",
      link: "/getting-started",
      sendPush: true,
    });
  },
});

// Example: Billing notification
export const notifyBillingRenewal = internalAction({
  args: {
    userId: v.id("users"),
    renewalDate: v.string(),
    amount: v.string(),
  },
  handler: async (ctx, { userId, renewalDate, amount }) => {
    await notifyUser(ctx, {
      userId,
      type: "billing.renewal",
      title: "Subscription Renewal",
      body: `Your subscription will renew on ${renewalDate} for ${amount}.`,
      icon: "billing",
      link: "/settings/billing",
      sendPush: true,
    });
  },
});

// Import statements (place at top of file in actual implementation)
import { api, internal } from "../../_generated/api";
