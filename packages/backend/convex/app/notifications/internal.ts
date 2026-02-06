import { internalAction, internalQuery } from "../../_generated/server";
import { v } from "convex/values";
// TODO: Re-enable when push.ts Node.js dependencies are resolved
// import { sendFCMNotification, sendAPNsNotification } from "../../lib/push";

// Type for device tokens returned from query
interface DeviceToken {
  platform: "apns" | "fcm" | "web";
  token: string;
}

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
  handler: async (ctx, args): Promise<{ sent: number; failed: number; total?: number }> => {
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

    // TODO: Re-enable when push.ts Node.js dependencies are resolved
    // Send to FCM (Android)
    const fcmTokens = tokens.filter((t: DeviceToken) => t.platform === "fcm");
    for (const _tokenDoc of fcmTokens) {
      // const success = await sendFCMNotification({
      //   token: tokenDoc.token,
      //   title: args.title,
      //   body: args.body,
      //   data: dataStrings,
      //   imageUrl: args.imageUrl,
      // });
      const success = false; // Stubbed - push not yet configured
      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    // Send to APNs (iOS)
    const apnsTokens = tokens.filter((t: DeviceToken) => t.platform === "apns");
    for (const _tokenDoc of apnsTokens) {
      // const success = await sendAPNsNotification({
      //   token: tokenDoc.token,
      //   title: args.title,
      //   body: args.body,
      //   data: args.data,
      //   badge: args.badge,
      // });
      const success = false; // Stubbed - push not yet configured
      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    // Web Push (optional - implement separately)
    const webTokens = tokens.filter((t: DeviceToken) => t.platform === "web");
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
  handler: async (ctx, args): Promise<string | null> => {
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
      await ctx.runAction(internal.app.notifications.internal.sendPush, {
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
  handler: async (ctx, { userId, userName }): Promise<void> => {
    await ctx.runAction(internal.app.notifications.internal.notifyUser, {
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
  handler: async (ctx, { userId, renewalDate, amount }): Promise<void> => {
    await ctx.runAction(internal.app.notifications.internal.notifyUser, {
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
