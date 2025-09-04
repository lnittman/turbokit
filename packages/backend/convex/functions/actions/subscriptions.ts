import { action } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuthAction } from "../../lib/auth";
import { polar } from "../../components/polar";

/**
 * Generate a checkout link for purchasing a subscription
 * Returns a URL that the user can visit to complete the purchase
 */
export const generateCheckoutLink = action({
  args: {
    productIds: v.array(v.string()),
    successUrl: v.optional(v.string()),
    cancelUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireAuthAction(ctx);
    
    const checkoutUrl = await polar.generateCheckoutLink(ctx, {
      productIds: args.productIds,
      customerId: userId,
      customerEmail: user.email,
      successUrl: args.successUrl,
      cancelUrl: args.cancelUrl,
      metadata: {
        ...args.metadata,
        userId,
        userName: user.name,
      },
    });
    
    return checkoutUrl;
  },
});

/**
 * Generate a customer portal URL for managing subscription
 * Returns a URL where users can update payment methods, cancel, etc.
 */
export const generateCustomerPortalUrl = action({
  handler: async (ctx) => {
    const { userId } = await requireAuthAction(ctx);
    
    const portalUrl = await polar.generateCustomerPortalUrl(ctx, {
      customerId: userId,
    });
    
    return portalUrl;
  },
});

/**
 * Change the current subscription to a different product
 * Handles upgrades and downgrades
 */
export const changeCurrentSubscription = action({
  args: {
    productId: v.string(),
    immediateChange: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuthAction(ctx);
    
    // Get current subscription to ensure user has one
    const currentSubscription = await polar.getCurrentSubscription(ctx, {
      userId,
    });
    
    if (!currentSubscription) {
      throw new Error("No active subscription to change");
    }
    
    const result = await polar.changeCurrentSubscription(ctx, {
      subscriptionId: currentSubscription.id,
      productId: args.productId,
      immediateChange: args.immediateChange,
    });
    
    return result;
  },
});

/**
 * Cancel the current subscription
 * Can be immediate or at end of billing period
 */
export const cancelCurrentSubscription = action({
  args: {
    revokeImmediately: v.optional(v.boolean()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuthAction(ctx);
    
    // Get current subscription
    const currentSubscription = await polar.getCurrentSubscription(ctx, {
      userId,
    });
    
    if (!currentSubscription) {
      throw new Error("No active subscription to cancel");
    }
    
    const result = await polar.cancelCurrentSubscription(ctx, {
      subscriptionId: currentSubscription.id,
      revokeImmediately: args.revokeImmediately || false,
    });
    
    // Optionally log the cancellation reason
    if (args.reason) {
      console.log(`Subscription cancelled by user ${userId}. Reason: ${args.reason}`);
    }
    
    return result;
  },
});