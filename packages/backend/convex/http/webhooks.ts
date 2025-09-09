import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";
import { resend } from "../components/email";

// Example: Resend webhook handler (can be routed from http/router)
export const handleResend = httpAction(async (ctx, req) => {
  return await resend.handleResendEventWebhook(ctx, req);
});

// Example: Generic webhook handler
export const handleGeneric = httpAction(async (ctx, req) => {
  const url = new URL(req.url);
  const service = url.pathname.split("/").pop() || "unknown";
  const body = await req.json().catch(() => ({}));
  await ctx.runMutation(api.users.internal.logActivity, {
    userId: "system" as any,
    action: "webhook.received",
    resourceType: "webhook",
    resourceId: service,
    metadata: { body, service, timestamp: Date.now() },
  });
  return new Response("OK", { status: 200 });
});
