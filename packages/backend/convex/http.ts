import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { resend } from "./components/email";
import { polar } from "./components/polar";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    return new Response(
      JSON.stringify({ 
        status: "ok",
        timestamp: Date.now(),
        service: "turbokit-backend",
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

// Resend webhook endpoint
http.route({
  path: "/webhooks/resend",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    // Let the Resend component handle the webhook
    return await resend.handleResendWebhook(ctx, req);
  }),
});

// Polar webhook registration with optional callbacks
polar.registerRoutes(http as any, {
  // Default path is "/polar/events", but can be customized
  path: "/webhooks/polar",
  
  // Optional callbacks for specific events
  onSubscriptionCreated: async (ctx, event) => {
    // Log new subscription
    console.log("New subscription created:", event.data);
    // You can add custom logic here, e.g., send welcome email
    try {
      await ctx.runMutation(internal.functions.internal.users.logActivity, {
        userId: event.data.customerId as any,
        action: "subscription.created",
        resourceType: "subscription",
        resourceId: event.data.id,
        metadata: {
          productId: event.data.productId,
          status: event.data.status,
        },
      });
    } catch (error) {
      console.error("Failed to log subscription creation:", error);
    }
  },
  
  onSubscriptionUpdated: async (ctx, event) => {
    // Handle subscription updates (including cancellations)
    console.log("Subscription updated:", event.data);
    if (event.data.customerCancellationReason) {
      console.log("Cancellation reason:", event.data.customerCancellationReason);
    }
  },
  
  onProductCreated: async (ctx, event) => {
    console.log("New product created:", event.data);
  },
  
  onProductUpdated: async (ctx, event) => {
    console.log("Product updated:", event.data);
  },
});

// Clerk webhook endpoint
http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    // Verify webhook signature
    const signature = req.headers.get("svix-signature");
    const svixId = req.headers.get("svix-id");
    const timestamp = req.headers.get("svix-timestamp");
    
    if (!signature || !svixId || !timestamp) {
      return new Response("Missing svix headers", { status: 401 });
    }
    
    const body = await req.text();
    
    // TODO: Verify signature with Clerk webhook secret
    // For now, parse and process the event
    const event = JSON.parse(body);
    
    switch (event.type) {
      case "user.created":
        await ctx.runMutation(api.functions.internal.users.createUser, {
          clerkId: event.data.id,
          email: event.data.email_addresses[0].email_address,
          name: event.data.first_name 
            ? `${event.data.first_name} ${event.data.last_name || ""}`.trim()
            : undefined,
          imageUrl: event.data.image_url,
        });
        break;
        
      case "user.updated":
        await ctx.runMutation(api.functions.internal.users.updateUser, {
          clerkId: event.data.id,
          email: event.data.email_addresses[0].email_address,
          name: event.data.first_name 
            ? `${event.data.first_name} ${event.data.last_name || ""}`.trim()
            : undefined,
          imageUrl: event.data.image_url,
        });
        break;
        
      case "user.deleted":
        await ctx.runMutation(api.functions.internal.users.deleteUser, {
          clerkId: event.data.id,
        });
        break;
    }
    
    return new Response("OK", { status: 200 });
  }),
});


// Generic webhook endpoint for other services
http.route({
  path: "/webhooks/{service}",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const { service } = req.params;
    const body = await req.json();
    
    // Log the webhook for debugging
    console.log(`Webhook received from ${service}:`, body);
    
    // Store in activities for audit
    await ctx.runMutation(api.functions.internal.users.logActivity, {
      userId: "system" as any,
      action: "webhook.received",
      resourceType: "webhook",
      resourceId: service,
      metadata: { 
        service,
        timestamp: Date.now(),
      },
    });
    
    return new Response("OK", { status: 200 });
  }),
});

export default http;
