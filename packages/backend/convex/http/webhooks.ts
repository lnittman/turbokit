import { api } from "../_generated/api";
import { httpAction } from "../_generated/server";

// Example: Generic webhook handler
export const handleGeneric = httpAction(async (ctx, req) => {
  const url = new URL(req.url);
  const service = url.pathname.split("/").pop() || "unknown";
  const body = await req.json().catch(() => ({}));
  console.log(`Webhook received: ${service}`, body);
  return new Response("OK", { status: 200 });
});
