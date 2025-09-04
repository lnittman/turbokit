# Polar Subscription Billing Integration

This document explains how to use the Polar component for subscription billing in TurboKit.

## Setup

### 1. Environment Variables

Add the following to your `.env.local`:

```bash
# Required: Get from https://polar.sh/dashboard
POLAR_ORGANIZATION_TOKEN=your_org_token
POLAR_WEBHOOK_SECRET=your_webhook_secret

# Optional: Product IDs for static configuration
POLAR_PRODUCT_STARTER_ID=prod_xxx
POLAR_PRODUCT_PRO_ID=prod_xxx
POLAR_PRODUCT_ENTERPRISE_ID=prod_xxx

# Optional: Server environment (defaults to "production")
POLAR_SERVER=production  # or "sandbox" for testing
```

Set these in Convex:

```bash
npx convex env set POLAR_ORGANIZATION_TOKEN your_token
npx convex env set POLAR_WEBHOOK_SECRET your_secret
```

### 2. Configure Webhook in Polar Dashboard

1. Go to your [Polar Dashboard](https://polar.sh/dashboard)
2. Navigate to Settings → Webhooks
3. Add a new webhook endpoint:
   - URL: `https://your-convex-app.convex.site/webhooks/polar`
   - Events: Select all subscription and product events
4. Copy the webhook secret and add it to your environment

## Usage

### Client-Side (React)

```tsx
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react";

function SubscriptionManager() {
  const subscription = useQuery(api.functions.queries.subscriptions.getCurrentSubscription);
  const products = useQuery(api.functions.queries.subscriptions.listAllProducts);
  const generateCheckout = useAction(api.functions.actions.subscriptions.generateCheckoutLink);
  const generatePortal = useAction(api.functions.actions.subscriptions.generateCustomerPortalUrl);
  
  if (subscription) {
    return (
      <div>
        <h3>Current Plan: {subscription.productKey}</h3>
        <p>Status: {subscription.status}</p>
        <p>Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
        
        {/* Option 1: Using Polar's React component */}
        <CustomerPortalLink
          polarApi={{
            generateCustomerPortalUrl: api.functions.actions.subscriptions.generateCustomerPortalUrl,
          }}
        >
          Manage Subscription
        </CustomerPortalLink>
        
        {/* Option 2: Using custom button */}
        <button onClick={async () => {
          const url = await generatePortal();
          window.open(url, '_blank');
        }}>
          Manage Billing
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <h3>Choose a Plan</h3>
      
      {/* Option 1: Using Polar's React component */}
      <CheckoutLink
        polarApi={api.functions.actions.subscriptions}
        productIds={products?.map(p => p.id) || []}
        embed={true}
      >
        Upgrade Now
      </CheckoutLink>
      
      {/* Option 2: Dynamic pricing cards */}
      {products?.map(product => (
        <div key={product.id}>
          <h4>{product.name}</h4>
          <p>{product.description}</p>
          <p>${(product.prices[0].priceAmount ?? 0) / 100}/{product.prices[0].recurringInterval}</p>
          <button onClick={async () => {
            const url = await generateCheckout({
              productIds: [product.id],
              successUrl: window.location.origin + '/dashboard',
              cancelUrl: window.location.origin + '/pricing',
            });
            window.location.href = url;
          }}>
            Subscribe
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Server-Side (Convex Functions)

```typescript
// Check subscription status in queries/mutations
import { polar } from "@/convex/components/polar";

export const premiumFeature = mutation({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);
    
    // Check if user has active subscription
    const subscription = await polar.getCurrentSubscription(ctx, { userId });
    
    if (!subscription || subscription.status !== "active") {
      throw new Error("Premium subscription required");
    }
    
    // Check specific tier
    if (subscription.productKey !== "pro" && subscription.productKey !== "enterprise") {
      throw new Error("Pro or Enterprise plan required");
    }
    
    // Proceed with premium feature...
  },
});
```

### Subscription Tiers

You can implement feature gating based on subscription tiers:

```typescript
// Define your tiers
enum SubscriptionTier {
  FREE = "free",
  STARTER = "starter",
  PRO = "pro", 
  ENTERPRISE = "enterprise",
}

// Helper to get user's tier
async function getUserTier(ctx: QueryCtx, userId: Id<"users">): Promise<SubscriptionTier> {
  try {
    const subscription = await polar.getCurrentSubscription(ctx, { userId });
    return subscription?.productKey as SubscriptionTier || SubscriptionTier.FREE;
  } catch {
    return SubscriptionTier.FREE;
  }
}

// Use in feature checks
export const createProject = mutation({
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);
    const tier = await getUserTier(ctx, userId);
    
    // Check project limits by tier
    const existingProjects = await ctx.db
      .query("projects")
      .withIndex("by_owner", q => q.eq("ownerId", userId))
      .collect();
    
    const limits = {
      [SubscriptionTier.FREE]: 1,
      [SubscriptionTier.STARTER]: 5,
      [SubscriptionTier.PRO]: 20,
      [SubscriptionTier.ENTERPRISE]: Infinity,
    };
    
    if (existingProjects.length >= limits[tier]) {
      throw new Error(`Upgrade your plan to create more projects`);
    }
    
    // Create project...
  },
});
```

## Webhook Events

The Polar component automatically handles these webhook events:

- **subscription.created** - New subscription purchased
- **subscription.updated** - Subscription changed (upgrade/downgrade/renewal)
- **subscription.cancelled** - Subscription cancelled (may still be active until period end)
- **subscription.revoked** - Subscription immediately terminated
- **product.created** - New product added in Polar
- **product.updated** - Product details changed

You can add custom logic for these events in `convex/http.ts` webhook callbacks.

## Testing

### Sandbox Mode

For development, use Polar's sandbox environment:

1. Create a sandbox organization at https://sandbox.polar.sh
2. Use sandbox tokens in development
3. Set `POLAR_SERVER=sandbox` in environment

### Test Cards

In sandbox mode, use these test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Common Patterns

### 1. Free Trial

Configure products with trial periods in Polar dashboard, then:

```typescript
const subscription = await polar.getCurrentSubscription(ctx, { userId });
const isInTrial = subscription?.status === "trialing";
const trialEndsAt = subscription?.trialEnd;
```

### 2. Metered Billing

Track usage and report to Polar:

```typescript
// Track API calls, storage, etc.
await polar.reportUsage(ctx, {
  subscriptionId: subscription.id,
  quantity: apiCallCount,
  timestamp: Date.now(),
});
```

### 3. One-Time Purchases

Create non-recurring products in Polar and check purchase history:

```typescript
const purchases = await polar.listUserSubscriptions(ctx, { userId });
const hasPurchased = purchases.some(p => 
  p.productId === "one_time_product" && p.status === "completed"
);
```

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct in Polar dashboard
2. Verify webhook secret matches environment variable
3. Check Convex logs for errors
4. Test with Polar's webhook tester

### Subscription Not Found

- Ensure user ID is consistent between Convex and Polar
- Check if subscription exists in Polar dashboard
- Verify webhook events are being processed

### Price Display Issues

- Prices are in cents, divide by 100 for dollars
- Use `Intl.NumberFormat` for currency formatting
- Check currency settings in Polar product configuration

## Support

- [Polar Documentation](https://docs.polar.sh)
- [Convex Polar Component](https://github.com/get-convex/polar)
- [TurboKit Issues](https://github.com/your-org/turbokit/issues)