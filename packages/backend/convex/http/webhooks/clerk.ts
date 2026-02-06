/**
 * Clerk Webhook Handler
 * 
 * Handles user lifecycle events from Clerk to keep Convex database in sync.
 * Webhook endpoint: https://your-convex-url/clerk/webhook
 * 
 * Configure in Clerk Dashboard:
 * 1. Go to Webhooks in Clerk Dashboard
 * 2. Add endpoint: https://your-convex-url/clerk/webhook
 * 3. Select events: user.created, user.updated, user.deleted
 * 4. Copy signing secret to CLERK_WEBHOOK_SECRET env var
 */

import { httpAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Webhook } from "svix";

// Clerk webhook event types (simplified for backend use)
interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ id: string; email_address: string }>;
    primary_email_address_id?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    image_url?: string;
  };
}

export const clerkWebhook = httpAction(async (ctx, request) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get the headers
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  // If there are no Svix headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await request.text();

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: ClerkWebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  switch (eventType) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;
      
      const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id);
      
      await ctx.runMutation(internal.users.internal.syncUser, {
        clerkId: id,
        email: primaryEmail?.email_address || "",
        name: [first_name, last_name].filter(Boolean).join(" ") || username || "",
        imageUrl: image_url || undefined,
      });
      break;
    }
    
    case "user.deleted": {
      if (evt.data.id) {
        await ctx.runMutation(internal.users.internal.deleteUserByClerkId, {
          clerkId: evt.data.id,
        });
      }
      break;
    }
    
    default:
      console.log(`Unhandled webhook event type: ${eventType}`);
  }

  return new Response("Webhook processed", { status: 200 });
});