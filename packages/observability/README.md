# Observability Package

Project-agnostic observability package for Sentry and logging integration.

## Features

- **Sentry Integration**: Error tracking, performance monitoring, session replay
- **Type-safe Configuration**: Environment variables with Zod validation
- **Next.js Optimized**: Automatic source maps, tunneling, Vercel monitoring

## Installation

This package is already included in TurboKit. To use in your apps:

```typescript
// apps/app/sentry.client.config.ts
import { initializeSentry } from '@repo/observability/client';

initializeSentry();
```

## Configuration

### Client Apps (Next.js)

1. Add Sentry to your Next.js config:

```typescript
// apps/app/next.config.ts
import { withSentry } from '@repo/observability/next-config';

export default withSentry({
  // your next config
});
```

2. Set environment variables:

```env
# Sentry (added by Vercel integration)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### Backend (Convex)

Convex has its own Sentry integration configured through the dashboard:

1. Go to Convex Dashboard → Settings → Integrations
2. Enable Sentry integration
3. Configure DSN and environment

**Note**: Convex doesn't use this observability package directly. Backend errors are sent to Sentry through Convex's built-in integration.

## Project-Agnostic Design

This package is **completely project-agnostic**:

- ✅ No hardcoded values
- ✅ All configuration via environment variables
- ✅ Works with any Next.js app
- ✅ Optional features (Sentry/Logtail can be disabled)
- ✅ Type-safe with runtime validation

## Usage

### Error Handling

```typescript
import { parseError } from '@repo/observability/error';

try {
  // your code
} catch (error) {
  const message = parseError(error); // Automatically logs to Sentry
  console.error(message);
}
```

### Logging

```typescript
import { log } from '@repo/observability/log';

log.info('User action', { userId, action });
log.error('Operation failed', { error });
```

## Architecture

```
Client Apps (Next.js)
├── Sentry Browser SDK
├── Session Replay
├── Performance Monitoring
└── Error Boundaries

Backend (Convex)
└── Convex Dashboard Integration
    └── Sentry Backend SDK

Observability Services
└── Sentry.io (errors, performance)
```

## Best Practices

1. **Don't log sensitive data**: No passwords, tokens, or PII
2. **Use structured logging**: Pass objects with context
3. **Set appropriate sample rates**: Balance data vs. cost
4. **Filter noisy errors**: Use Sentry's ignore patterns
5. **Monitor performance**: Track key user journeys

## Differences from Next Forge

This package is derived from Next Forge's observability package with these modifications:

- Updated for React 19 and Next.js 15
- Simplified configuration
- Better TypeScript types
- Cleaner exports

The core functionality remains the same - it's a thin, project-agnostic wrapper around Sentry and logging services.