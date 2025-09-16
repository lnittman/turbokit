# Observability Package - AI Agent Instructions

## Overview
This package provides comprehensive observability for TurboKit applications through Sentry integration. It handles error tracking, performance monitoring, session replay, and structured logging in a project-agnostic way with full type safety.

## Quick Start Checklist
- [ ] Set up Sentry environment variables
- [ ] Configure Sentry in Next.js apps
- [ ] Initialize client-side monitoring
- [ ] Set appropriate sampling rates
- [ ] Configure error filtering
- [ ] Test error boundaries

## Architecture Philosophy

### Project-Agnostic Design
- No hardcoded values or project-specific configuration
- All settings via environment variables
- Works with any Next.js application
- Optional features (can run without Sentry)
- Type-safe with runtime validation

### Separation of Concerns
```
Client (Browser)          Server (Next.js)         Backend (Convex)
├── Error tracking       ├── Error tracking       ├── Native integration
├── Session replay       ├── Performance          └── Dashboard config
├── Performance          └── Source maps
└── User context
```

## Package Structure
```
packages/observability/
├── client.ts          # Browser SDK initialization
├── error.ts           # Error parsing utilities
├── instrumentation.ts # Node.js instrumentation
├── keys.ts            # Environment validation
├── log.ts             # Structured logging
└── next-config.ts     # Next.js integration
```

## Environment Configuration

### Required Variables
```env
# Sentry Configuration (added by Vercel integration)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-organization
SENTRY_PROJECT=your-project

# Optional: Auth token for source maps
SENTRY_AUTH_TOKEN=sntrys_xxx
```

### Environment Validation
```typescript
// packages/observability/keys.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      SENTRY_ORG: z.string().optional(),
      SENTRY_PROJECT: z.string().optional(),
      SENTRY_AUTH_TOKEN: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    },
    runtimeEnv: {
      SENTRY_ORG: process.env.SENTRY_ORG,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
  });
```

## Next.js Integration

### 1. Configure Next.js
```typescript
// apps/app/next.config.ts
import { withSentry } from '@repo/observability/next-config';

const nextConfig = {
  // Your Next.js config
};

// Apply Sentry configuration
export default withSentry(nextConfig);
```

### 2. Create Sentry Config Files
```typescript
// apps/app/sentry.client.config.ts
import { initializeSentry } from '@repo/observability/client';

initializeSentry();
```

```typescript
// apps/app/sentry.server.config.ts
import { initializeSentry } from '@repo/observability/server';

initializeSentry();
```

```typescript
// apps/app/sentry.edge.config.ts
import { initializeSentry } from '@repo/observability/edge';

initializeSentry();
```

### 3. Add Instrumentation
```typescript
// apps/app/instrumentation.ts
export { register } from '@repo/observability/instrumentation';
```

## Client-Side Monitoring

### Initialization Options
```typescript
// packages/observability/client.ts
import { init, replayIntegration } from '@sentry/nextjs';

export const initializeSentry = () =>
  init({
    dsn: keys().NEXT_PUBLIC_SENTRY_DSN,

    // Sampling rates (adjust for production)
    tracesSampleRate: 1,              // 100% in dev, lower in prod
    replaysSessionSampleRate: 0.1,    // 10% of sessions
    replaysOnErrorSampleRate: 1,      // 100% when errors occur

    // Session replay configuration
    integrations: [
      replayIntegration({
        maskAllText: true,           // Privacy: mask text content
        blockAllMedia: true,         // Privacy: block media
        maskAllInputs: true,         // Privacy: mask form inputs

        // Network request/response recording
        networkDetailAllowUrls: [window.location.origin],
        networkCaptureBodies: true,
        networkRequestHeaders: ['X-Request-ID'],
        networkResponseHeaders: ['X-Response-ID'],
      }),
    ],

    // User identification
    beforeSend(event, hint) {
      // Add user context if available
      if (window.currentUser) {
        event.user = {
          id: window.currentUser.id,
          email: window.currentUser.email,
        };
      }
      return event;
    },

    // Filter noisy errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /extension\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });
```

### Custom Error Boundaries
```typescript
// apps/app/src/components/error-boundary.tsx
import * as Sentry from '@sentry/nextjs';
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry with additional context
    Sentry.withScope((scope) => {
      scope.setContext('errorBoundary', {
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Error Handling

### Error Parser Utility
```typescript
// packages/observability/error.ts
import * as Sentry from '@sentry/nextjs';

export function parseError(error: unknown): string {
  // Capture to Sentry
  Sentry.captureException(error);

  // Parse for display
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}
```

### Usage in Try-Catch
```typescript
import { parseError } from '@repo/observability/error';

async function riskyOperation() {
  try {
    const result = await fetchData();
    return result;
  } catch (error) {
    const message = parseError(error); // Automatically sent to Sentry

    // Additional context
    Sentry.withScope((scope) => {
      scope.setContext('operation', {
        type: 'data_fetch',
        endpoint: '/api/data',
      });
      Sentry.captureException(error);
    });

    throw new Error(message);
  }
}
```

## Performance Monitoring

### Automatic Instrumentation
The package automatically instruments:
- Page loads and navigation
- API routes and server actions
- Database queries (when using Sentry-compatible ORMs)
- External HTTP requests

### Custom Transactions
```typescript
import * as Sentry from '@sentry/nextjs';

export async function complexOperation() {
  // Start a transaction
  const transaction = Sentry.startTransaction({
    op: 'task',
    name: 'Complex Operation',
  });

  // Set as active transaction
  Sentry.getCurrentHub().configureScope(scope => scope.setSpan(transaction));

  try {
    // Create child spans
    const dbSpan = transaction.startChild({
      op: 'db',
      description: 'Database Query',
    });

    await databaseQuery();
    dbSpan.finish();

    const apiSpan = transaction.startChild({
      op: 'http',
      description: 'External API Call',
    });

    await externalApiCall();
    apiSpan.finish();

    // Finish transaction
    transaction.setStatus('ok');
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}
```

## Structured Logging

### Log Utility
```typescript
// packages/observability/log.ts
import * as Sentry from '@sentry/nextjs';

export const log = {
  info: (message: string, extra?: Record<string, any>) => {
    console.info(message, extra);
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      data: extra,
    });
  },

  warn: (message: string, extra?: Record<string, any>) => {
    console.warn(message, extra);
    Sentry.addBreadcrumb({
      message,
      level: 'warning',
      data: extra,
    });
  },

  error: (message: string, error?: unknown, extra?: Record<string, any>) => {
    console.error(message, error, extra);
    Sentry.withScope((scope) => {
      if (extra) {
        scope.setContext('extra', extra);
      }
      Sentry.captureException(error ?? new Error(message));
    });
  },

  debug: (message: string, extra?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(message, extra);
    }
    Sentry.addBreadcrumb({
      message,
      level: 'debug',
      data: extra,
    });
  },
};
```

### Usage Examples
```typescript
import { log } from '@repo/observability/log';

// Info logging with context
log.info('User action', {
  userId: user.id,
  action: 'checkout',
  items: cart.length,
});

// Warning with details
log.warn('Rate limit approaching', {
  current: 950,
  limit: 1000,
  endpoint: '/api/generate',
});

// Error with exception
try {
  await riskyOperation();
} catch (error) {
  log.error('Operation failed', error, {
    userId: user.id,
    operation: 'payment_process',
  });
}
```

## Session Replay

### Privacy Configuration
```typescript
// Fine-grained privacy controls
replayIntegration({
  // Text masking
  maskAllText: false,
  mask: ['.sensitive'],          // CSS selectors to mask
  unmask: ['.public'],           // CSS selectors to never mask

  // Block specific elements
  block: ['.private-content'],    // CSS selectors to block
  blockAllMedia: false,           // Block images/video

  // Input masking
  maskAllInputs: true,
  unmaskTextSelectors: ['.search-input'], // Inputs to not mask

  // Sampling
  sessionSampleRate: 0.1,        // 10% of all sessions
  errorSampleRate: 1.0,          // 100% of error sessions
});
```

### Triggering Manual Replays
```typescript
import * as Sentry from '@sentry/nextjs';

// Start replay for important user journeys
function startCheckoutProcess() {
  const replay = Sentry.getCurrentHub().getIntegration(Sentry.replayIntegration);
  replay?.start();

  // Track the journey
  Sentry.addBreadcrumb({
    message: 'Checkout started',
    category: 'user-journey',
  });
}
```

## Sentry Configuration

### Next.js Plugin Options
```typescript
// packages/observability/next-config.ts
export const sentryConfig = {
  // Organization settings
  org: keys().SENTRY_ORG,
  project: keys().SENTRY_PROJECT,

  // Source maps
  widenClientFileUpload: true,     // Better stack traces
  hideSourceMaps: true,            // Don't expose source in production

  // Tunneling (bypass ad blockers)
  tunnelRoute: '/monitoring',       // Proxy through your domain

  // Performance
  disableLogger: true,              // Remove console statements

  // Vercel integration
  automaticVercelMonitors: true,   // Monitor cron jobs

  // Build settings
  silent: !process.env.CI,         // Only verbose in CI

  // Tree shaking
  excludeServerRoutes: [
    '/api/health',                 // Don't monitor health checks
    '/api/internal/*',             // Skip internal endpoints
  ],
};
```

## Convex Backend Integration

### Important Note
Convex has its own Sentry integration that doesn't use this package:

1. **Configure in Convex Dashboard**:
   - Go to Settings → Environment Variables
   - Add `SENTRY_DSN` with your project DSN
   - Configure environment (development/production)

2. **Automatic Features**:
   - Function execution errors
   - Query/mutation/action tracing
   - Automatic source maps
   - Environment separation

3. **Manual Error Capture**:
```typescript
// packages/backend/convex/functions/example.ts
import { ConvexError } from 'convex/values';

export const riskyAction = action({
  handler: async (ctx) => {
    try {
      // Your logic
    } catch (error) {
      // Convex automatically captures to Sentry
      throw new ConvexError({
        message: 'Operation failed',
        code: 'OPERATION_ERROR',
        details: { error: String(error) },
      });
    }
  },
});
```

## Best Practices

### 1. Sampling Strategies
```typescript
// Production configuration
const prodConfig = {
  // Lower trace sampling in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Dynamic sampling based on transaction
  tracesSampler: (samplingContext) => {
    // Always sample errors
    if (samplingContext.parentSampled) {
      return 1.0;
    }

    // Sample based on route
    if (samplingContext.transactionContext.name === '/api/critical') {
      return 1.0; // 100% for critical endpoints
    }

    return 0.1; // 10% for everything else
  },
};
```

### 2. User Context
```typescript
// Set user context after authentication
import * as Sentry from '@sentry/nextjs';

export function setUserContext(user: User) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    // Don't include sensitive data
  });
}

// Clear on logout
export function clearUserContext() {
  Sentry.setUser(null);
}
```

### 3. Environment Separation
```typescript
// Configure per environment
init({
  environment: process.env.VERCEL_ENV ?? 'development',

  // Different settings per environment
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development' && !process.env.FORCE_SENTRY) {
      return null;
    }
    return event;
  },
});
```

### 4. Sensitive Data Filtering
```typescript
// Filter sensitive data from errors
beforeSend(event, hint) {
  // Remove sensitive headers
  if (event.request?.headers) {
    delete event.request.headers['authorization'];
    delete event.request.headers['cookie'];
  }

  // Scrub sensitive data from URLs
  if (event.request?.url) {
    event.request.url = event.request.url.replace(/token=[^&]+/, 'token=***');
  }

  // Remove sensitive extra data
  if (event.extra?.password) {
    delete event.extra.password;
  }

  return event;
}
```

## Common Issues & Solutions

### Sentry Not Capturing Errors
```typescript
// Check DSN is set
if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
  console.warn('Sentry DSN not configured');
}

// Verify initialization
import * as Sentry from '@sentry/nextjs';
console.log('Sentry enabled:', Sentry.getCurrentHub().getClient() !== undefined);
```

### Source Maps Not Uploading
```bash
# Ensure auth token is set
SENTRY_AUTH_TOKEN=xxx pnpm build

# Check org and project match
SENTRY_ORG=your-org SENTRY_PROJECT=your-project pnpm build
```

### Ad Blockers Blocking Sentry
```typescript
// Use tunnel configuration
export default withSentry({
  // ... config
  sentry: {
    tunnelRoute: '/monitoring', // Routes through your domain
  },
});
```

### High Sentry Costs
```typescript
// Reduce sampling rates
tracesSampleRate: 0.01,            // 1% traces
replaysSessionSampleRate: 0.001,   // 0.1% replays

// Filter noisy errors
ignoreErrors: [
  'Network request failed',
  'Load failed',
  'AbortError',
],
```

## Testing

### Mock Sentry in Tests
```typescript
// __tests__/setup.ts
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn(callback => callback({
    setContext: jest.fn(),
    setUser: jest.fn(),
  })),
}));
```

### Test Error Boundaries
```typescript
import { render } from '@testing-library/react';
import { ErrorBoundary } from '@/components/error-boundary';

test('catches and displays errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  const { getByText } = render(
    <ErrorBoundary fallback={<div>Error caught</div>}>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(getByText('Error caught')).toBeInTheDocument();
});
```

## Migration from Other Solutions

### From LogRocket/FullStory
```typescript
// Replace session recording
- LogRocket.init('app-id');
+ import { init, replayIntegration } from '@sentry/nextjs';
+ init({ integrations: [replayIntegration()] });
```

### From Custom Error Handling
```typescript
// Before: Custom error handler
window.onerror = (message, source, lineno, colno, error) => {
  logToCustomService(error);
};

// After: Sentry handles automatically
import { initializeSentry } from '@repo/observability/client';
initializeSentry();
```

## Key Files
- `client.ts` - Browser SDK initialization
- `error.ts` - Error parsing and capture utilities
- `instrumentation.ts` - Node.js instrumentation setup
- `keys.ts` - Environment variable validation
- `log.ts` - Structured logging utilities
- `next-config.ts` - Next.js Sentry plugin configuration

## TurboKit Conventions
- Project-agnostic: no hardcoded values
- Type-safe environment variables with T3 Env
- Comprehensive error tracking and performance monitoring
- Privacy-focused session replay configuration
- Automatic Vercel and Next.js integration
- Structured logging with contextual breadcrumbs