# Analytics Package - AI Agent Instructions

## Overview
This package provides PostHog analytics integration for TurboKit applications, supporting both client-side (user behavior) and server-side (business metrics) tracking.

## Quick Start Checklist
- [ ] Set PostHog API keys in environment variables
- [ ] Configure reverse proxy (production)
- [ ] Implement naming convention
- [ ] Set up internal user filtering
- [ ] Configure server-side tracking in Convex actions
- [ ] Enable error tracking
- [ ] Test feature flags

## Setup & Configuration

### Environment Variables

#### Client-Side (Next.js Apps)
```env
# Required for analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...  # PostHog project API key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com  # Or your self-hosted instance
```

#### Server-Side (Convex Actions)
```env
# Set in Convex Dashboard
POSTHOG_API_KEY=phk_...  # Server API key (different from client key!)
POSTHOG_HOST=https://app.posthog.com
```

### Installation
Package is pre-configured in TurboKit. No additional installation needed.

## Usage Patterns

### Client-Side Analytics (React/Next.js)

#### Basic Setup
```typescript
// Already configured in app/layout.tsx via PostHogProvider
import { PostHogProvider } from '@repo/analytics/posthog/client';

export default function RootLayout({ children }) {
  return (
    <PostHogProvider>
      {children}
    </PostHogProvider>
  );
}
```

#### Tracking Events
```typescript
import { usePostHog } from 'posthog-js/react';

function MyComponent() {
  const posthog = usePostHog();

  const handleClick = () => {
    posthog?.capture('button_clicked', {
      button_name: 'upgrade',
      plan: 'pro',
      $set: { upgraded_at: new Date().toISOString() }
    });
  };
}
```

#### Feature Flags
```typescript
import { useFeatureFlagEnabled } from 'posthog-js/react';

function MyComponent() {
  const newFeatureEnabled = useFeatureFlagEnabled('new-feature');

  if (newFeatureEnabled) {
    return <NewFeature />;
  }
  return <OldFeature />;
}
```

### Server-Side Analytics (Convex Actions)

#### Setup PostHog Client with Error Handling
```typescript
// packages/backend/convex/lib/posthog.ts
import { PostHog } from 'posthog-node';
import { ConvexError } from "convex/values";

// Initialize with serverless-optimized settings
const posthog = new PostHog(
  process.env.POSTHOG_API_KEY || '',
  {
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
    flushAt: 1,  // Critical: Send events immediately
    flushInterval: 0,  // Critical: No batching delay
    requestTimeout: 3000,  // Timeout after 3 seconds
  }
);

// Add error handler
posthog.on('error', (err) => {
  console.error('[PostHog Error]', err);
  // Don't throw - analytics shouldn't break your app
});

export { posthog };
```

#### Track Backend Events with Proper Error Handling
```typescript
// packages/backend/convex/app/billing/actions.ts
import { action } from "../../_generated/server";
import { posthog } from "../../lib/posthog";
import { ConvexError } from "convex/values";

export const processPayment = action({
  args: { userId: v.id("users"), amount: v.number() },
  handler: async (ctx, { userId, amount }) => {
    const startTime = Date.now();

    try {
      // Business logic
      const result = await processStripePayment(amount);

      // Track success (non-blocking)
      posthog.capture({
        distinctId: userId,
        event: 'billing:payment_process',
        properties: {
          amount,
          payment_method: result.paymentMethod,
          duration_ms: Date.now() - startTime,
          $revenue: amount / 100,  // Revenue tracking
        }
      });

      return result;
    } catch (error) {
      // Track failure (non-blocking)
      posthog.capture({
        distinctId: userId,
        event: 'billing:payment_fail',
        properties: {
          error_message: error.message,
          error_code: error.code,
          amount,
          duration_ms: Date.now() - startTime,
        }
      });

      // Re-throw for Convex error handling
      throw new ConvexError({
        code: "PAYMENT_FAILED",
        message: "Payment processing failed",
      });
    } finally {
      // CRITICAL: Always shutdown in serverless
      await posthog.shutdown();
    }
  },
});
```

#### Tracking with Retry Logic (for Critical Events)
```typescript
// For critical analytics that must be captured
import { action } from "../../_generated/server";
import { api } from "../../_generated/api";

export const trackCriticalEvent = action({
  args: {
    userId: v.id("users"),
    event: v.string(),
    properties: v.any()
  },
  handler: async (ctx, { userId, event, properties }) => {
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        posthog.capture({
          distinctId: userId,
          event,
          properties,
        });

        await posthog.shutdown();
        return { success: true };
      } catch (error) {
        lastError = error;
        retries--;

        if (retries > 0) {
          // Exponential backoff
          await new Promise(r => setTimeout(r, 1000 * (4 - retries)));
        }
      }
    }

    // Log to Convex for later processing
    await ctx.runMutation(api.analytics.internal.logFailedEvent, {
      userId,
      event,
      properties,
      error: lastError.message,
    });

    // Don't throw - degrade gracefully
    return { success: false, queued: true };
  },
});
```

## What to Track

### Client-Side Events
- User interactions (clicks, form submissions)
- Page views and navigation
- Feature usage
- Client errors
- Performance metrics (Core Web Vitals)
- Session recordings
- A/B test exposures

### Server-Side Events (Preferred for Critical Metrics)
- Payment processing
- Subscription changes
- AI/LLM token usage and costs
- Background job completions
- API rate limits
- Security events
- Business KPIs
- User lifecycle events (signup, activation, churn)

### Why Backend > Frontend Tracking
Per PostHog best practices:
1. **More reliable**: No ad blockers or tracking prevention
2. **Complete control**: Your backend execution is guaranteed
3. **Accurate data**: Essential for business-critical metrics
4. **No JS failures**: Network issues, CORS, browser settings can't interfere

## Feature Flags

### Client-Side Evaluation
```typescript
// React component
const showNewDashboard = useFeatureFlagEnabled('new-dashboard');
```

### Server-Side Evaluation
```typescript
// Convex action
const useNewAlgorithm = await posthog.isFeatureEnabled(
  'new-algorithm',
  userId
);
```

## Best Practices

### 1. Event Naming Convention (PostHog Standards)

#### Event Names: `category:object_action`
- **category**: Context (e.g., `signup_flow`, `billing`)
- **object**: Component/location (e.g., `pricing_page`, `upgrade_button`)
- **action**: Verb (e.g., `view`, `click`, `submit`)

Examples:
- ✅ `signup_flow:pricing_page_view`
- ✅ `billing:upgrade_button_click`
- ✅ `dashboard:report_generate`
- ❌ `click`
- ❌ `UserSignedUp` (use snake_case)

#### Property Names: `object_adjective`
- Regular: `user_id`, `plan_type`, `invoice_amount`
- Booleans: `is_subscribed`, `has_onboarded`
- Dates: `created_date`, `last_login_timestamp`

#### Allowed Verbs (maintain consistency):
```
click, submit, create, view, add, invite,
update, delete, remove, start, end, cancel,
fail, generate, send, complete, process
```

### 2. User Identification
```typescript
// Client-side
posthog.identify(userId, {
  email: user.email,
  name: user.name,
  plan: user.subscription.tier
});

// Server-side
posthog.capture({
  distinctId: userId,
  event: 'api_called',
  properties: { endpoint: '/api/generate' }
});
```

### 3. Revenue Tracking
```typescript
posthog.capture({
  distinctId: userId,
  event: 'subscription_upgraded',
  properties: {
    $revenue: 99.00,  // Always in base currency (USD)
    plan: 'pro',
    billing_period: 'monthly'
  }
});
```

### 4. Filter Internal Users (Critical for Accurate Metrics)

```typescript
// Client-side filtering
posthog.capture('signup_flow:account_create', {
  email: user.email,
  // Mark internal users
  is_internal: user.email.endsWith('@yourcompany.com'),
  is_test_user: process.env.NODE_ENV !== 'production',
});

// Server-side filtering
const isInternalUser = (email: string) => {
  return email.endsWith('@yourcompany.com') ||
         email.includes('+test@') ||
         email.startsWith('test-');
};

if (!isInternalUser(user.email)) {
  posthog.capture({
    distinctId: userId,
    event: 'billing:subscription_create',
    properties: { plan: 'pro' }
  });
}

// In PostHog Dashboard:
// Create cohort: "Internal Users" where is_internal = true
// Exclude from insights and dashboards
```

### 5. Event Versioning

```typescript
// Version events when making breaking changes
posthog.capture({
  distinctId: userId,
  event: 'onboarding_v2:flow_complete',  // v2 indicates new flow
  properties: {
    version: 2,
    steps_completed: 5,
    time_taken_seconds: 120,
  }
});
```

### 6. Group Analytics
```typescript
// Track organization-level events
posthog.groupIdentify({
  groupType: 'organization',
  groupKey: orgId,
  properties: {
    name: org.name,
    plan: org.plan,
    users_count: org.userCount
  }
});

posthog.capture({
  distinctId: userId,
  event: 'feature_used',
  groups: { organization: orgId }
});
```

## Debugging

### Enable Debug Mode
```typescript
// Client-side
posthog.debug();

// Server-side
const posthog = new PostHog(key, {
  host: 'https://app.posthog.com',
  flushAt: 1,
  flushInterval: 0,
  // Add debug flag
  requestTimeout: 10000
});

posthog.on('error', (err) => {
  console.error('PostHog error:', err);
});
```

### Check if Working
1. Open PostHog dashboard
2. Go to "Events" tab
3. Look for your events in real-time
4. Check "Feature Flags" for flag evaluations

## Common Issues & Solutions

### Events Not Showing Up
- Check API keys are correct
- Verify `posthog.shutdown()` is called in actions
- Check network tab for failed requests
- Ensure events are being flushed

### Feature Flags Not Working
- Verify personal API key is set for local evaluation
- Check flag is enabled in PostHog dashboard
- Ensure user properties match flag conditions

### Server-Side Not Tracking
- Must use in Convex actions (not queries/mutations)
- Always call `await posthog.shutdown()`
- Set `flushAt: 1` and `flushInterval: 0`

## Testing

### Mock PostHog in Tests
```typescript
// packages/testing/utils/mock-posthog.ts
export const mockPostHog = {
  capture: jest.fn(),
  identify: jest.fn(),
  isFeatureEnabled: jest.fn().mockResolvedValue(false),
  shutdown: jest.fn().mockResolvedValue(undefined)
};

// In tests
jest.mock('@repo/analytics/posthog/client', () => ({
  usePostHog: () => mockPostHog
}));
```

## Key Files
- `posthog/client.tsx` - Client-side provider and hooks
- `posthog/server.ts` - Server-side initialization
- `keys.ts` - Environment variable validation
- `index.tsx` - Main exports

## TurboKit Conventions
- Always validate env vars with Zod schemas
- Use optional chaining for PostHog calls
- Export typed hooks for client usage
- Track meaningful business events, not vanity metrics
- Keep sensitive data out of event properties

## Production Configuration

### 1. Reverse Proxy Setup (Prevent Ad Blockers)
```typescript
// next.config.ts
async rewrites() {
  return [
    {
      source: '/ingest/:path*',
      destination: 'https://app.posthog.com/:path*',
    },
  ];
}

// Then use in client:
const posthog = new PostHog(key, {
  api_host: '/ingest',  // Use your domain
});
```

### 2. Project Structure
Per PostHog best practices:
- Use **same project** for marketing site + app
- Enables complete user journey tracking
- Track from first visit → signup → activation → revenue

### 3. Performance Monitoring
```typescript
// Track Core Web Vitals
posthog.capture('performance:web_vitals', {
  lcp: metrics.lcp,  // Largest Contentful Paint
  fid: metrics.fid,  // First Input Delay
  cls: metrics.cls,  // Cumulative Layout Shift
  ttfb: metrics.ttfb,  // Time to First Byte
});
```

### 4. Deployment Checklist
- [ ] Configure reverse proxy in production
- [ ] Set up internal user filtering
- [ ] Enable session recording (if needed)
- [ ] Configure feature flag polling interval
- [ ] Set up error tracking integration
- [ ] Test events in staging environment
- [ ] Verify revenue tracking accuracy

## When to Use Analytics
- ✅ After user completes significant action
- ✅ When tracking business KPIs
- ✅ For A/B testing features
- ✅ Monitoring API usage
- ❌ Not for debugging (use logs)
- ❌ Not for real-time notifications (use webhooks)
- ❌ Not for storing user data (use database)