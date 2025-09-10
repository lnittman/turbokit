import { action } from "../_generated/server";
import { v } from "convex/values";
import { requireAuthAction } from "../lib/auth";
import { autumn, generateCheckoutLink as autumnGenerateCheckoutLink, generateCustomerPortalUrl as autumnGeneratePortalUrl } from "./autumn";

export const generateCheckoutLink = action({
  args: { productIds: v.array(v.string()), successUrl: v.optional(v.string()), cancelUrl: v.optional(v.string()), metadata: v.optional(v.any()) },
  handler: async (ctx, args) => {
    await requireAuthAction(ctx);
    return await autumnGenerateCheckoutLink(ctx, args as any);
  },
});

export const generateCustomerPortalUrl = action({
  handler: async (ctx) => {
    await requireAuthAction(ctx);
    return await autumnGeneratePortalUrl(ctx);
  },
});

export const changeCurrentSubscription = action({
  args: { productId: v.string(), immediateChange: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAuthAction(ctx);
    // Attach will create/replace current subscription as needed
    return await autumn.attach(ctx as any, { productId: args.productId } as any);
  },
});

export const cancelCurrentSubscription = action({
  args: { productId: v.string(), revokeImmediately: v.optional(v.boolean()), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAuthAction(ctx);
    const res = await (autumn as any).cancel(ctx as any, {
      productId: args.productId,
      cancelImmediately: args.revokeImmediately ?? false,
    } as any);
    return res as any;
  },
});
