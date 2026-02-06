"use node";

import { v } from "convex/values";
import { api, internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { sendAPNsNotification, sendFCMNotification } from "../../lib/push";

const TOKEN_INVALIDATION_PATTERNS = [
	"notregistered",
	"registration-token-not-registered",
	"invalid registration token",
	"baddevicetoken",
	"unregistered",
	"410",
];

function toDataStrings(data: unknown): Record<string, string> | undefined {
	if (!data || typeof data !== "object") {
		return undefined;
	}

	return Object.entries(data).reduce(
		(acc, [key, value]) => {
			acc[key] = String(value);
			return acc;
		},
		{} as Record<string, string>,
	);
}

function shouldDeleteToken(reason: string | undefined): boolean {
	if (!reason) {
		return false;
	}

	const normalized = reason.toLowerCase();
	return TOKEN_INVALIDATION_PATTERNS.some((pattern) =>
		normalized.includes(pattern),
	);
}

// Internal action: send push notification to a user's devices
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
	handler: async (
		ctx,
		args,
	): Promise<{
		sent: number;
		failed: number;
		cleaned: number;
		total: number;
	}> => {
		const tokens = await ctx.runQuery(
			internal.app.notifications.queries.getDeviceTokensInternal,
			{
				userId: args.userId,
			},
		);

		if (tokens.length === 0) {
			console.log(`[PUSH] No device tokens for user ${args.userId}`);
			return { sent: 0, failed: 0, cleaned: 0, total: 0 };
		}

		const dataStrings = toDataStrings(args.data);
		let sent = 0;
		let failed = 0;
		let cleaned = 0;

		const fcmTokens = tokens.filter((tokenDoc) => tokenDoc.platform === "fcm");
		for (const tokenDoc of fcmTokens) {
			const result = await sendFCMNotification({
				token: tokenDoc.token,
				title: args.title,
				body: args.body,
				data: dataStrings,
				imageUrl: args.imageUrl,
			});

			if (result.success) {
				sent++;
				continue;
			}

			failed++;
			if (shouldDeleteToken(result.reason)) {
				await ctx.runMutation(
					internal.app.notifications.mutations.deleteDeviceTokenInternal,
					{
						tokenId: tokenDoc._id,
					},
				);
				cleaned++;
			}
		}

		const apnsTokens = tokens.filter(
			(tokenDoc) => tokenDoc.platform === "apns",
		);
		for (const tokenDoc of apnsTokens) {
			const result = await sendAPNsNotification({
				token: tokenDoc.token,
				title: args.title,
				body: args.body,
				data: dataStrings,
				badge: args.badge,
			});

			if (result.success) {
				sent++;
				continue;
			}

			failed++;
			if (shouldDeleteToken(result.reason)) {
				await ctx.runMutation(
					internal.app.notifications.mutations.deleteDeviceTokenInternal,
					{
						tokenId: tokenDoc._id,
					},
				);
				cleaned++;
			}
		}

		const webTokens = tokens.filter((tokenDoc) => tokenDoc.platform === "web");
		if (webTokens.length > 0) {
			failed += webTokens.length;
			console.warn(
				`[PUSH] Web Push delivery not implemented (${webTokens.length} tokens)`,
			);
		}

		console.log(
			`[PUSH] Sent ${sent}/${tokens.length} notifications to user ${args.userId} (failed=${failed}, cleaned=${cleaned})`,
		);

		return { sent, failed, cleaned, total: tokens.length };
	},
});

// Internal action: notify user (in-app + optional push)
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
			},
		);

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

// Example: workflow-triggered notification
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

// Example: billing notification
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
