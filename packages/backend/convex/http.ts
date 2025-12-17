import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";
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
      })
  ),
});

// Clerk webhooks for user sync
http.route({
  path: "/clerk/webhook",
  method: "POST",
  handler: clerkWebhook,
});

// Generic catch‑all (logs only)
http.route({
  path: "/webhooks/{service}",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const { service } = (req as any).params ?? { service: "unknown" };
    const body = await req.json().catch(() => ({}));
    console.log(`Webhook received: ${service}`, body);
    return new Response("OK", { status: 200 });
  }),
});

export default http;
