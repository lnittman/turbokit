import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { resend } from "./app/emails/resend";
import { clerkWebhook } from "./http/webhooks/clerk";

const http = httpRouter();

// Health check
http.route({
	path: "/health",
	method: "GET",
	handler: httpAction(
		async () =>
			new Response(JSON.stringify({ status: "ok", ts: Date.now() }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
	),
});

// Clerk webhooks for user sync
http.route({
	path: "/clerk/webhook",
	method: "POST",
	handler: clerkWebhook,
});

// Resend webhooks
http.route({
	path: "/webhooks/resend",
	method: "POST",
	handler: httpAction(async (ctx, req) =>
		resend.handleResendEventWebhook(ctx, req),
	),
});

// Generic catch‑all (logs only)
http.route({
	path: "/webhooks/{service}",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		const { service } = (req as any).params ?? { service: "unknown" };
		const body = await req.json().catch(() => ({}));
		await ctx.runMutation(internal.app.users.internal.logActivity, {
			userId: "system" as any,
			action: "webhook.received",
			resourceType: "webhook",
			resourceId: service,
			metadata: { service, body, ts: Date.now() },
		});
		return new Response("OK", { status: 200 });
	}),
});

export default http;
