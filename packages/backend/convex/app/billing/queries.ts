import { query as convexQuery } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../../lib/auth";
import { query as autumnQuery, check as autumnCheck, listProducts as autumnListProducts } from "./autumn";

export const getCurrentSubscription = convexQuery({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);
    try {
      // Use Autumn check to get current subscription status
      const result = await autumnCheck(ctx as any, {} as any);
      return result;
    } catch {
      return null;
    }
  },
});

export const listUserSubscriptions = convexQuery({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const { userId: currentUserId, user } = await requireAuth(ctx);
    const target = args.userId || currentUserId;
    if (target !== currentUserId && user.role !== "admin") throw new Error("Unauthorized");
    // Use Autumn query to list subscriptions
    try {
      const result = await autumnQuery(ctx as any, {} as any);
      return result;
    } catch {
      return [];
    }
  },
});

export const getConfiguredProducts = convexQuery({
  handler: async (ctx) => {
    try {
      return await autumnListProducts(ctx as any);
    } catch {
      return [];
    }
  },
});

export const listAllProducts = convexQuery({
  handler: async (ctx) => {
    try {
      return await autumnListProducts(ctx as any);
    } catch {
      return [];
    }
  },
});

export const getUserWithSubscription = convexQuery({
  handler: async (ctx) => {
    const { user, userId } = await requireAuth(ctx);
    let subscription: any = null;
    try {
      subscription = await autumnCheck(ctx as any, {} as any);
    } catch {}
    return {
      ...user,
      subscription,
      hasActiveSubscription: !!subscription && subscription?.status === "active",
      subscriptionTier: subscription?.productKey || "free",
    };
  },
});
