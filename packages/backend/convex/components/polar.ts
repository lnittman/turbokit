import { Polar } from "@convex-dev/polar";
import { api, components } from "../_generated/api";

export const polar = new Polar(components.polar, {
  // Map the current Convex user to Polar customer identity
  getUserInfo: async (ctx) => {
    const me = await ctx.runQuery(api.functions.queries.users.getMe, {} as any);
    return {
      userId: me._id as any,
      email: me.email as string,
    };
  },
  // Optional: set static product keys here or use listAllProducts from UI
  // products: {
  //   proMonthly: process.env.POLAR_PRODUCT_PRO_MONTHLY as string,
  //   proYearly: process.env.POLAR_PRODUCT_PRO_YEARLY as string,
  // },
});

// Re-export convenient API functions for UI and backend usage
export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getConfiguredProducts,
  listAllProducts,
  listProducts,
  getCurrentSubscription,
  listUserSubscriptions,
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();

