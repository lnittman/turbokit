import { query } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../../lib/auth";
import { getCurrentSubscription as autumnGetCurrentSubscription, listUserSubscriptions as autumnListUserSubs, getConfiguredProducts as autumnGetConfiguredProducts, listAllProducts as autumnListAllProducts } from "./autumn";

export const getCurrentSubscription = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);
    try {
      return await autumnGetCurrentSubscription(ctx, { userId });
    } catch {
      return null;
    }
  },
});

export const listUserSubscriptions = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const { userId: currentUserId, user } = await requireAuth(ctx);
    const target = args.userId || currentUserId;
    if (target !== currentUserId && user.role !== "admin") throw new Error("Unauthorized");
    return await autumnListUserSubs(ctx, { userId: target });
  },
});

export const getConfiguredProducts = query({
  handler: async (ctx) => autumnGetConfiguredProducts(ctx),
});

export const listAllProducts = query({
  handler: async (ctx) => autumnListAllProducts(ctx),
});

export const getUserWithSubscription = query({
  handler: async (ctx) => {
    const { user, userId } = await requireAuth(ctx);
    let subscription: any = null;
    try { subscription = await autumnGetCurrentSubscription(ctx, { userId }); } catch {}
    return { ...user, subscription, hasActiveSubscription: !!subscription && subscription.status === "active", subscriptionTier: subscription?.productKey || "free" };
  },
});
