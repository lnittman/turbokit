# Next Config Package - AI Agent Instructions

## Overview
This package provides shared Next.js configuration, environment variable validation with T3 Env, and diagnostic tooling for TurboKit applications. It centralizes Next.js settings, handles PostHog reverse proxy configuration, and provides helpful development diagnostics.

## Quick Start Checklist
- [ ] Import shared config in next.config.ts
- [ ] Set up environment validation with keys()
- [ ] Configure bundle analyzer if needed
- [ ] Review PostHog reverse proxy settings
- [ ] Use diagnostics for development feedback

## Architecture

### Package Structure
```
packages/next-config/
├── index.ts        # Main Next.js config export
├── keys.ts         # T3 Env validation schemas
├── diagnostics.ts  # Development diagnostics
└── package.json    # Dependencies
```

### Core Components

#### 1. Shared Next.js Configuration (`index.ts`)
Provides base Next.js settings that all apps inherit:
- Image optimization configuration
- PostHog reverse proxy rewrites
- Webpack configuration
- Bundle analyzer integration

#### 2. Environment Validation (`keys.ts`)
Uses T3 Env for type-safe environment variables:
- Runtime validation with Zod
- Build-time type checking
- Vercel preset integration
- Client/server variable separation

#### 3. Diagnostics (`diagnostics.ts`)
Development-time service status reporting:
- Shows which optional services are configured
- Provides setup instructions for disabled services
- Prevents duplicate banner printing across processes

## Using Shared Configuration

### Basic Setup in Apps

```typescript
// apps/app/next.config.ts
import { config, withAnalyzer } from '@repo/next-config';
import { env } from './src/env';

const nextConfig = {
  ...config,
  // App-specific overrides
  experimental: {
    // Your experimental features
  },
};

// Conditionally add bundle analyzer
export default process.env.ANALYZE === 'true'
  ? withAnalyzer(nextConfig)
  : nextConfig;
```

### Environment Validation Setup

```typescript
// apps/app/src/env.ts
import { keys } from '@repo/next-config/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [keys()],
  server: {
    // App-specific server variables
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url().optional(),
  },
  client: {
    // App-specific client variables
    NEXT_PUBLIC_APP_NAME: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
});
```

### Using Diagnostics

```typescript
// apps/app/next.config.ts
import { printEnvBanner } from '@repo/next-config/diagnostics';

// Print diagnostic banner during development
if (process.env.NODE_ENV === 'development') {
  printEnvBanner('app');
}
```

## Configuration Details

### Image Optimization
```typescript
images: {
  formats: ['image/avif', 'image/webp'],  // Modern formats
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'img.clerk.com',  // Clerk avatars
    },
  ],
}
```

Add more remote patterns as needed:
```typescript
// In your app's next.config.ts
const nextConfig = {
  ...config,
  images: {
    ...config.images,
    remotePatterns: [
      ...config.images.remotePatterns,
      {
        protocol: 'https',
        hostname: 'cdn.yourservice.com',
      },
    ],
  },
};
```

### PostHog Reverse Proxy
The configuration includes reverse proxy rewrites to prevent ad blockers:

```typescript
async rewrites() {
  return [
    {
      source: '/ingest/static/:path*',
      destination: 'https://us-assets.i.posthog.com/static/:path*',
    },
    {
      source: '/ingest/:path*',
      destination: 'https://us.i.posthog.com/:path*',
    },
    {
      source: '/ingest/decide',
      destination: 'https://us.i.posthog.com/decide',
    },
  ];
}
```

This allows PostHog to work through your domain (`/ingest/*`) instead of directly calling PostHog servers.

### Webpack Configuration
```typescript
webpack(config) {
  // Suppress OpenTelemetry warnings
  config.ignoreWarnings = [{ module: /@opentelemetry\/instrumentation/ }];
  return config;
}
```

Add app-specific Webpack config:
```typescript
// In your app's next.config.ts
const nextConfig = {
  ...config,
  webpack(webpackConfig, options) {
    // Apply base config
    const baseConfig = config.webpack?.(webpackConfig, options) ?? webpackConfig;

    // Add your customizations
    baseConfig.resolve.alias = {
      ...baseConfig.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };

    return baseConfig;
  },
};
```

## Bundle Analysis

### Setup
```typescript
// apps/app/next.config.ts
import { withAnalyzer } from '@repo/next-config';

export default process.env.ANALYZE === 'true'
  ? withAnalyzer(nextConfig)
  : nextConfig;
```

### Running Analysis
```bash
# Analyze bundle size
ANALYZE=true pnpm build

# Opens interactive bundle visualization
```

### Interpreting Results
- Look for large dependencies that could be lazy loaded
- Identify duplicate modules across chunks
- Check for unnecessary polyfills
- Monitor bundle size over time

## Environment Variables with T3 Env

### Schema Definition
```typescript
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    // Server-only variables (never exposed to client)
    SECRET_KEY: z.string().min(32),
    DATABASE_URL: z.string().url(),
  },
  client: {
    // Client-exposed variables (must start with NEXT_PUBLIC_)
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_ENABLE_ANALYTICS: z.boolean().default(false),
  },
  runtimeEnv: {
    // Map actual env vars to schema
    SECRET_KEY: process.env.SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  },
});
```

### Using Vercel Preset
```typescript
import { vercel } from '@t3-oss/env-core/presets-zod';

export const env = createEnv({
  extends: [vercel()],  // Includes VERCEL_ENV, VERCEL_URL, etc.
  // Your additional variables...
});
```

### Validation Features
- **Build-time validation**: Fails build if required vars missing
- **Runtime validation**: Validates env vars when accessed
- **Type safety**: Full TypeScript support
- **Transform support**: Parse and validate complex values

### Advanced Validation
```typescript
// Complex validation examples
export const env = createEnv({
  server: {
    // URL with specific domain
    API_URL: z.string().url().refine(
      url => url.startsWith('https://api.example.com'),
      'API_URL must point to production API'
    ),

    // Enum values
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),

    // Numeric with range
    PORT: z.coerce.number().int().min(1000).max(65535),

    // JSON parsing
    FEATURE_FLAGS: z.string().transform(str => JSON.parse(str)),

    // Optional with default
    TIMEOUT_MS: z.coerce.number().default(30000),
  },
});
```

## Diagnostics System

### How It Works
The diagnostics system checks for configured services and provides setup guidance:

```typescript
const sections: Section[] = [
  {
    label: 'Auth (Clerk)',
    enabled: bool('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
    details: 'User auth UI and session',
    howToEnable: 'Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY',
  },
  // ... other services
];
```

### Adding Custom Checks
```typescript
// Extend diagnostics for your app
import { printEnvBanner } from '@repo/next-config/diagnostics';

function printAppDiagnostics() {
  printEnvBanner('app');

  // Add custom checks
  if (!process.env.CUSTOM_SERVICE_KEY) {
    console.warn('⚠️  Custom Service not configured');
    console.warn('   Set CUSTOM_SERVICE_KEY to enable');
  }
}
```

### Banner Output Example
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TurboKit app — Optional Services Configuration

- Auth (Clerk): enabled — User auth UI and session
- Analytics (PostHog): disabled — Product analytics
  Enable: Set NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST
- Backend (Convex): enabled — Realtime data + server functions

Files: .env.example (full list), .env.local.example (local template)
Tip: copy .env.example → .env.local and fill the values you need.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Best Practices

### Configuration Management
1. **Keep base config minimal** - Only include universally needed settings
2. **Allow overrides** - Apps should be able to extend/override settings
3. **Document all options** - Clear comments for each configuration
4. **Version compatibility** - Handle Next.js version differences gracefully

### Environment Variables
1. **Validate early** - Catch missing vars at build time
2. **Provide defaults** - Use sensible defaults for optional vars
3. **Clear naming** - Follow NEXT_PUBLIC_ convention consistently
4. **Group related vars** - Organize by service/feature

### Performance Optimization
1. **Use bundle analyzer** - Regular checks for bundle size
2. **Configure images** - Optimize formats and lazy loading
3. **Enable caching** - Proper cache headers for static assets
4. **Monitor metrics** - Track Core Web Vitals

## Common Issues & Solutions

### Environment Variable Not Found
```typescript
// Problem: Variable undefined at runtime
// Solution: Add to runtimeEnv mapping
runtimeEnv: {
  MY_VAR: process.env.MY_VAR,  // Must be explicitly mapped
}
```

### Type Errors with Next.js Config
```typescript
// Problem: Type mismatch between versions
// Solution: Use type assertion
// @ts-ignore - Version mismatch
export default withAnalyzer(nextConfig) as NextConfig;
```

### Bundle Analyzer Not Opening
```bash
# Ensure ANALYZE is set correctly
ANALYZE=true pnpm build  # Not ANALYZE=1 or analyze=true
```

### PostHog Reverse Proxy Not Working
```typescript
// Check skipTrailingSlashRedirect is enabled
skipTrailingSlashRedirect: true,  // Required for PostHog API
```

### Duplicate Diagnostic Banners
The diagnostics system uses both in-process and file-based locks to prevent duplicates:
- In-process: `__turbokit_banner_printed__` flag
- Cross-process: Lock file in `.next` directory

## Extending the Package

### Adding New Shared Config
```typescript
// packages/next-config/index.ts
export const config: NextConfig = {
  // ... existing config

  // Add new shared settings
  headers: async () => [{
    source: '/(.*)',
    headers: [{
      key: 'X-Frame-Options',
      value: 'DENY',
    }],
  }],
};
```

### Adding Service Checks
```typescript
// packages/next-config/diagnostics.ts
const sections: Section[] = [
  // ... existing sections
  {
    label: 'New Service',
    enabled: bool('NEW_SERVICE_KEY'),
    details: 'Service description',
    howToEnable: 'Set NEW_SERVICE_KEY',
  },
];
```

### Creating Config Presets
```typescript
// packages/next-config/presets.ts
export const staticExportConfig: NextConfig = {
  ...config,
  output: 'export',
  images: { unoptimized: true },
};

export const edgeConfig: NextConfig = {
  ...config,
  runtime: 'edge',
};
```

## Migration Guide

### From Inline Config to Shared
```typescript
// Before: apps/app/next.config.ts
const nextConfig = {
  images: { formats: ['image/avif', 'image/webp'] },
  // ... lots of config
};

// After: apps/app/next.config.ts
import { config } from '@repo/next-config';

const nextConfig = {
  ...config,
  // Only app-specific overrides
};
```

### From process.env to T3 Env
```typescript
// Before: Direct env access
const apiUrl = process.env.NEXT_PUBLIC_API_URL;  // No validation

// After: Validated env
import { env } from './src/env';
const apiUrl = env.NEXT_PUBLIC_API_URL;  // Type-safe & validated
```

## Testing

### Testing Environment Validation
```typescript
// __tests__/env.test.ts
import { createEnv } from '@t3-oss/env-nextjs';

describe('Environment validation', () => {
  it('validates required variables', () => {
    expect(() => createEnv({
      server: { REQUIRED: z.string() },
      runtimeEnv: { REQUIRED: undefined },
    })).toThrow();
  });
});
```

### Testing Config Application
```typescript
// __tests__/config.test.ts
import { config } from '@repo/next-config';

describe('Next.js config', () => {
  it('includes PostHog rewrites', async () => {
    const rewrites = await config.rewrites();
    expect(rewrites).toContainEqual(
      expect.objectContaining({
        source: '/ingest/:path*',
      })
    );
  });
});
```

## Key Files
- `index.ts` - Main Next.js configuration export
- `keys.ts` - T3 Env validation schema
- `diagnostics.ts` - Development diagnostics system
- `package.json` - Dependencies and scripts

## TurboKit Conventions
- Shared config reduces duplication across apps
- T3 Env provides type-safe environment variables
- Diagnostics help developers understand setup
- PostHog reverse proxy prevents tracking blocks
- Bundle analyzer helps monitor app size
- All apps inherit sensible defaults