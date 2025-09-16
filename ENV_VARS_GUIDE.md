# TurboKit Environment Variables Guide

## Important Note on NEXT_PUBLIC_APP_URL

**No, NEXT_PUBLIC_APP_URL is NOT necessary** in TurboKit projects. Here's why:

1. **Vercel provides it automatically**: `VERCEL_PROJECT_PRODUCTION_URL` is set by Vercel
2. **Next.js metadata API handles it**: The metadata system can detect the URL from headers
3. **Convex uses its own URL**: `NEXT_PUBLIC_CONVEX_URL` is separate from your app URL
4. **It creates maintenance burden**: One more thing to keep in sync between environments

If you need the app URL in your code, use:
```typescript
// For metadata (SEO)
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

// For runtime (client)
const url = window.location.origin;

// For server-side
const url = headers().get('host');
```

---

## Complete Environment Variables List

### 🎯 Core Requirements

#### Local Development (.env.local)

```bash
# ============================================
# CONVEX (Backend) - REQUIRED
# ============================================
NEXT_PUBLIC_CONVEX_URL=https://xxxxx.convex.cloud
CONVEX_DEPLOYMENT=dev:xxxxx  # or prod:xxxxx for production

# ============================================
# CLERK (Authentication) - REQUIRED
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx  # From Clerk Dashboard > Webhooks

# Optional Clerk URLs (defaults work fine)
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

### 📊 Analytics & Monitoring

```bash
# ============================================
# POSTHOG (Analytics) - OPTIONAL BUT RECOMMENDED
# ============================================
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com  # or https://eu.i.posthog.com for EU

# Server-side PostHog (for Convex actions)
# Set in Convex Dashboard > Settings > Environment Variables
POSTHOG_API_KEY=phk_xxxxx  # Different from client key!

# ============================================
# SENTRY (Error Tracking) - OPTIONAL
# ============================================
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=sntrys_xxxxx  # For source maps upload

# Automatically set by Vercel Sentry integration
# SENTRY_ORG, SENTRY_PROJECT, NEXT_PUBLIC_SENTRY_DSN
```

---

### 💳 Payments & Billing

```bash
# ============================================
# AUTUMN (Payments) - OPTIONAL
# ============================================
# Set in Convex Dashboard > Settings > Environment Variables
AUTUMN_SECRET_KEY=autumn_sk_xxxxx
AUTUMN_WEBHOOK_SECRET=autumn_whsec_xxxxx  # Optional, for webhook verification

# Optional Autumn config
AUTUMN_DEFAULT_CURRENCY=USD
AUTUMN_TAX_ENABLED=true
```

---

### 🤖 AI Services

```bash
# ============================================
# AI PROVIDERS - OPTIONAL
# ============================================
# Set in Convex Dashboard for backend AI features

# OpenRouter (recommended for multi-model)
OPENROUTER_API_KEY=sk-or-xxxxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1  # Optional, this is default
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3-opus  # Optional

# OR OpenAI directly
OPENAI_API_KEY=sk-xxxxx
OPENAI_ORGANIZATION=org-xxxxx  # Optional
OPENAI_BASE_URL=https://api.openai.com/v1  # Optional

# OR Anthropic directly
ANTHROPIC_API_KEY=sk-ant-xxxxx

# OR Groq
GROQ_API_KEY=gsk_xxxxx
```

---

### 📧 Email & Communication

```bash
# ============================================
# RESEND (Email) - OPTIONAL
# ============================================
# Set in Convex Dashboard > Settings > Environment Variables
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Your App Name

# Optional Resend config
RESEND_AUDIENCE_ID=xxxxx  # For newsletter signups
```

---

### 🗄️ Storage & Media

```bash
# ============================================
# CLOUDFLARE R2 (Object Storage) - OPTIONAL
# ============================================
# Set in Convex Dashboard if using R2 component
R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=your-bucket
R2_PUBLIC_URL=https://xxxxx.r2.dev  # Or custom domain

# ============================================
# UPLOADTHING (File Uploads) - OPTIONAL
# ============================================
UPLOADTHING_SECRET=sk_xxxxx
UPLOADTHING_APP_ID=xxxxx
```

---

### 🚀 Deployment & Infrastructure

```bash
# ============================================
# VERCEL - AUTOMATICALLY SET
# ============================================
# These are set automatically by Vercel, don't set manually
VERCEL=1
VERCEL_ENV=production|preview|development
VERCEL_URL=xxxxx.vercel.app
VERCEL_PROJECT_PRODUCTION_URL=your-app.vercel.app
VERCEL_REGION=iad1
VERCEL_GIT_COMMIT_SHA=xxxxx
VERCEL_GIT_COMMIT_REF=main

# ============================================
# NODE & RUNTIME - OPTIONAL
# ============================================
NODE_ENV=development|production|test
NEXT_RUNTIME=nodejs|edge  # Set by Vercel
ANALYZE=true  # For bundle analyzer (build-time only)
```

---

## Environment Setup by Location

### 1. Local Development (.env.local)

```bash
# Minimum required for local development
NEXT_PUBLIC_CONVEX_URL=https://xxxxx.convex.cloud
CONVEX_DEPLOYMENT=dev:xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

### 2. Vercel Environment Variables (apps/app)

Set in Vercel Dashboard > Settings > Environment Variables:

#### Production + Preview + Development:
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`

#### Optional (if using):
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SENTRY_DSN` (auto-set by Sentry integration)

### 3. Convex Dashboard Environment Variables

Set in Convex Dashboard > Settings > Environment Variables:

#### Required:
- `CLERK_WEBHOOK_SECRET` (same as in Vercel)
- `CLERK_JWT_ISSUER_DOMAIN` (e.g., clerk.your-app.com)

#### Optional Services:
```bash
# Analytics (server-side)
POSTHOG_API_KEY=phk_xxxxx
POSTHOG_HOST=https://us.i.posthog.com

# AI
OPENROUTER_API_KEY=sk-or-xxxxx
OPENAI_API_KEY=sk-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Email
RESEND_API_KEY=re_xxxxx

# Payments
AUTUMN_SECRET_KEY=autumn_sk_xxxxx

# Storage
R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
```

---

## Quick Setup Commands

### 1. Initialize Convex
```bash
npx convex dev
# This will prompt you to create a project and set NEXT_PUBLIC_CONVEX_URL
```

### 2. Set Up Clerk
```bash
# 1. Create account at clerk.com
# 2. Create application
# 3. Copy keys from Clerk Dashboard > API Keys
# 4. Set up webhook endpoint: https://your-app.vercel.app/api/clerk/webhook
# 5. Copy webhook secret from Clerk Dashboard > Webhooks
```

### 3. Set Up PostHog (Optional)
```bash
# 1. Create account at posthog.com
# 2. Create project
# 3. Copy project API key
# 4. Choose region (US or EU)
```

### 4. Set Up Sentry (Optional)
```bash
# 1. Install Vercel integration: https://vercel.com/integrations/sentry
# 2. It will automatically set all required env vars
```

---

## Environment Variable Validation

TurboKit uses T3 Env to validate environment variables at build time:

```typescript
// apps/app/src/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.string().url(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    // Map to actual env vars
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
});
```

---

## Security Best Practices

1. **Never commit .env.local** - It's in .gitignore by default
2. **Use different keys for dev/prod** - Clerk provides test/live keys
3. **Rotate keys regularly** - Especially webhook secrets
4. **Use Vercel's env var UI** - Don't hardcode in code
5. **Scope variables properly** - Use preview/production scoping in Vercel
6. **Keep secrets in Convex** - Don't expose API keys to client

---

## Troubleshooting

### Clerk Authentication Not Working
- Verify `CLERK_JWT_ISSUER_DOMAIN` in Convex matches your Clerk instance
- Check webhook is configured in Clerk Dashboard
- Ensure `CLERK_WEBHOOK_SECRET` matches in both Vercel and Convex

### PostHog Not Tracking
- Check reverse proxy is configured (`/ingest/*` routes)
- Verify you're using correct key (client vs server)
- Server-side needs `await posthog.shutdown()` in Convex actions

### Convex Connection Issues
- Ensure `NEXT_PUBLIC_CONVEX_URL` starts with `https://`
- Check deployment name matches (dev: vs prod:)
- Verify Clerk integration in Convex Dashboard

### Sentry Not Capturing
- Check DSN is set correctly
- Verify source maps are uploading (needs `SENTRY_AUTH_TOKEN`)
- Ensure tunneling is configured to bypass ad blockers

---

## Summary

### Absolutely Required
1. `NEXT_PUBLIC_CONVEX_URL` - Your Convex backend
2. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Auth UI
3. `CLERK_SECRET_KEY` - Auth backend
4. `CLERK_WEBHOOK_SECRET` - User sync

### Highly Recommended
1. `NEXT_PUBLIC_POSTHOG_KEY` - Analytics
2. `NEXT_PUBLIC_SENTRY_DSN` - Error tracking

### Service-Specific
- Add only what you actually use
- Keep sensitive keys in Convex Dashboard
- Use Vercel integration where available (Sentry)

### NOT Needed
- `NEXT_PUBLIC_APP_URL` - Use Vercel's automatic vars
- `DATABASE_URL` - Convex is your database
- `REDIS_URL` - Convex handles caching/state
- `STRIPE_*` - Use Autumn for payments instead