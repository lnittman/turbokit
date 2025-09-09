import { Autumn } from "@useautumn/convex";
import { components } from "../_generated/api";
import { getAuthUser } from "../lib/auth";

export const autumn = new Autumn(components.autumn, {
  identify: async (ctx) => {
    try {
      const user = await getAuthUser(ctx as any);
      return {
        customerId: (user._id as any) as string,
        customerData: {
          email: user.email,
          name: user.name,
        },
      };
    } catch {
      return {
        customerId: "anonymous",
      } as any;
    }
  },
  secretKey: process.env.AUTUMN_SECRET_KEY || "",
});

// Back-compat thin wrappers to ease Polar -> Autumn migration
export const generateCheckoutLink = async (
  ctx: any,
  args: { productIds: string[]; successUrl?: string; cancelUrl?: string; metadata?: any }
) => {
  const result: any = await autumn.checkout(ctx, {
    productId: args.productIds?.[0],
    successUrl: args.successUrl,
    // Autumn doesn't use cancelUrl directly; include in metadata if needed
    customerData: undefined,
    entityId: undefined,
    options: undefined,
    invoice: undefined,
    checkoutSessionParams: undefined,
    reward: undefined,
  } as any);
  return result?.url || result?.checkoutUrl || result;
};

export const generateCustomerPortalUrl = async (ctx: any, _args?: {}) => {
  const result: any = await autumn.customers.billingPortal(ctx, {} as any);
  return result?.url || result?.billingPortalUrl || result;
};

export const getConfiguredProducts: any = async (ctx: any) => {
  return await autumn.products.list(ctx as any);
};

export const listAllProducts: any = async (ctx: any) => {
  return await autumn.products.list(ctx as any);
};

export const getCurrentSubscription: any = async (ctx: any, _args: { userId: any }) => {
  return await autumn.customers.get(ctx as any);
};

export const listUserSubscriptions = async (ctx: any, _args: { userId: any }) => {
  const customer: any = await autumn.customers.get(ctx as any);
  return customer?.subscriptions || [];
};
