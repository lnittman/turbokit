import { v } from "convex/values";
import { internalAction, internalMutation } from "../../_generated/server";

/**
 * Send push notification to a user's devices
 * Internal action that handles FCM/APNs/Web Push delivery
 */
export const sendPush = internalAction({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    link: v.optional(v.string()),
  },
  handler: async (ctx, { userId, title, body, data, link }) => {
    // Get user's device tokens
    const tokens = await ctx.runQuery(
      // @ts-expect-error - internal query access
      "app/notifications/queries:getDeviceTokensByUser",
      { userId }
    );

    if (!tokens || tokens.length === 0) {
      console.log(`[NOTIFICATIONS] No device tokens for user ${userId}`);
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const token of tokens) {
      try {
        switch (token.platform) {
          case "fcm":
            await sendFCM(token.token, { title, body, data, link });
            break;
          case "apns":
            await sendAPNS(token.token, { title, body, data, link });
            break;
          case "web":
            await sendWebPush(token.token, { title, body, data, link });
            break;
        }
        sent++;
      } catch (error) {
        console.error(
          `[NOTIFICATIONS] Failed to send to ${token.platform}:`,
          error
        );
        failed++;

        // Clean up invalid tokens
        if (isInvalidTokenError(error)) {
          await ctx.runMutation(
            // @ts-expect-error - internal mutation access
            "app/notifications/internal:removeInvalidToken",
            { tokenId: token._id }
          );
        }
      }
    }

    console.log(
      `[NOTIFICATIONS] Push sent to user ${userId}: ${sent} sent, ${failed} failed`
    );
    return { sent, failed };
  },
});

/**
 * Remove an invalid device token
 */
export const removeInvalidToken = internalMutation({
  args: { tokenId: v.id("deviceTokens") },
  handler: async (ctx, { tokenId }) => {
    await ctx.db.delete(tokenId);
  },
});

/**
 * Create notification and optionally send push
 * Internal mutation for use in workflows and crons
 */
export const createWithPush = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
    icon: v.optional(v.string()),
    data: v.optional(v.any()),
    sendPush: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { userId, type, title, body, link, icon, data, sendPush: shouldSendPush }
  ) => {
    // Check user preferences
    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Skip if type is disabled
    if (prefs?.types && prefs.types[type] === false) {
      return null;
    }

    // Create in-app notification if enabled
    let notificationId: string | null = null;
    if (!prefs || prefs.inApp !== false) {
      notificationId = await ctx.db.insert("notifications", {
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
    }

    // Schedule push notification if enabled
    if (shouldSendPush && (!prefs || prefs.push !== false)) {
      await ctx.scheduler.runAfter(
        0,
        // @ts-expect-error - internal action access
        "app/notifications/internal:sendPush",
        { userId, title, body, data, link }
      );
    }

    return notificationId;
  },
});

/**
 * Cleanup old notifications
 * Used by cron to archive/delete old notifications
 */
export const cleanupOld = internalMutation({
  args: {
    olderThanDays: v.number(),
    action: v.union(v.literal("archive"), v.literal("delete")),
  },
  handler: async (ctx, { olderThanDays, action }) => {
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    const old = await ctx.db
      .query("notifications")
      .withIndex("by_created")
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .take(1000);

    let processed = 0;
    const now = Date.now();

    for (const notification of old) {
      if (action === "delete") {
        await ctx.db.delete(notification._id);
      } else {
        await ctx.db.patch(notification._id, {
          archived: true,
          archivedAt: now,
        });
      }
      processed++;
    }

    console.log(
      `[NOTIFICATIONS] Cleanup: ${action}d ${processed} notifications older than ${olderThanDays} days`
    );
    return processed;
  },
});

// --- Push notification providers ---
// These are placeholder implementations. In production, you would
// integrate with actual push notification services.

interface PushPayload {
  title: string;
  body: string;
  data?: unknown;
  link?: string;
}

async function sendFCM(token: string, payload: PushPayload): Promise<void> {
  const serverKey = process.env.FCM_SERVER_KEY;
  if (!serverKey) {
    console.log("[NOTIFICATIONS] FCM not configured, skipping push");
    return;
  }

  const response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      Authorization: `key=${serverKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: token,
      notification: {
        title: payload.title,
        body: payload.body,
        click_action: payload.link,
      },
      data: payload.data,
    }),
  });

  if (!response.ok) {
    throw new Error(`FCM error: ${response.status}`);
  }
}

async function sendAPNS(token: string, payload: PushPayload): Promise<void> {
  // APNs requires more complex setup with certificates
  // This is a placeholder - implement with a library like @parse/node-apn
  console.log("[NOTIFICATIONS] APNs not implemented, skipping push");
}

async function sendWebPush(token: string, payload: PushPayload): Promise<void> {
  // Web Push requires VAPID keys
  // This is a placeholder - implement with web-push library
  console.log("[NOTIFICATIONS] Web Push not implemented, skipping push");
}

function isInvalidTokenError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("invalid") ||
      message.includes("unregistered") ||
      message.includes("not found")
    );
  }
  return false;
}
