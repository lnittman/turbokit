import { query } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../../lib/auth";
import { polar } from "../../components/polar";

/**
 * Get the current user's subscription
 * Returns null if no active subscription exists
 */
export const getCurrentSubscription = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);
    
    try {
      const subscription = await polar.getCurrentSubscription(ctx, {
        userId,
      });
      
      return subscription;
    } catch (error) {
      // No subscription found
      return null;
    }
  },
});

/**
 * List all subscriptions for a user (useful if supporting multiple subscriptions)
 */
export const listUserSubscriptions = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { userId: currentUserId } = await requireAuth(ctx);
    const targetUserId = args.userId || currentUserId;
    
    // Check if user is querying their own data or is an admin
    if (targetUserId !== currentUserId) {
      const { user } = await requireAuth(ctx);
      if (user.role !== "admin") {
        throw new Error("Unauthorized");
      }
    }
    
    return await polar.listUserSubscriptions(ctx, {
      userId: targetUserId,
    });
  },
});

/**
 * Get available products configured in Polar
 * Returns products with their static keys if configured
 */
export const getConfiguredProducts = query({
  handler: async (ctx) => {
    return await polar.getConfiguredProducts(ctx);
  },
});

/**
 * List all available products from Polar
 * Useful for dynamic pricing pages
 */
export const listAllProducts = query({
  handler: async (ctx) => {
    return await polar.listAllProducts(ctx);
  },
});

/**
 * Get user profile with subscription status
 * Enriches user data with subscription information
 */
export const getUserWithSubscription = query({
  handler: async (ctx) => {
    const { user, userId } = await requireAuth(ctx);
    
    let subscription = null;
    try {
      subscription = await polar.getCurrentSubscription(ctx, { userId });
    } catch {
      // No subscription
    }
    
    return {
      ...user,
      subscription,
      hasActiveSubscription: !!subscription && subscription.status === "active",
      subscriptionTier: subscription?.productKey || "free",
    };
  },
});