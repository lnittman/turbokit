import { Polar } from "@convex-dev/polar";
import { components, api } from "../_generated/api";
import { getAuthUser } from "../lib/auth";

export const polar = new Polar(components.polar, {
  // Required: provide a function the component can use to get the current user's ID and email
  getUserInfo: async (ctx) => {
    try {
      const user = await getAuthUser(ctx);
      return {
        userId: user._id,
        email: user.email,
      };
    } catch {
      // Return null if user is not authenticated
      throw new Error("User not authenticated");
    }
  },
  
  // Optional: Configure static keys for referencing your products
  // These should be configured based on your actual Polar products
  // You can also fetch them dynamically using listAllProducts
  products: {
    // Example product keys - replace with your actual product IDs from Polar
    // These IDs come from your Polar dashboard
    starter: process.env.POLAR_PRODUCT_STARTER_ID || "product_starter_id",
    pro: process.env.POLAR_PRODUCT_PRO_ID || "product_pro_id", 
    enterprise: process.env.POLAR_PRODUCT_ENTERPRISE_ID || "product_enterprise_id",
  },
  
  // Configuration will use environment variables by default:
  // - POLAR_ORGANIZATION_TOKEN
  // - POLAR_WEBHOOK_SECRET  
  // - POLAR_SERVER (optional, defaults to "production")
});

// Export all the Polar API functions for use in queries/mutations/actions
export const {
  // Subscription management
  getCurrentSubscription,
  listUserSubscriptions,
  changeCurrentSubscription,
  cancelCurrentSubscription,
  
  // Product management
  getConfiguredProducts,
  listAllProducts,
  
  // Checkout and portal
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();

// Type exports for better type safety
export type PolarSubscription = Awaited<ReturnType<typeof getCurrentSubscription>>;
export type PolarProduct = Awaited<ReturnType<typeof listAllProducts>>[0];