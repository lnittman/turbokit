# TurboKit

An ACP-native development platform for Convex applications.

## What's inside

### Apps
- **`apps/app`** — Main Next.js application with Clerk auth, real-time Convex queries, and a full design system
- **`docs`** — Documentation site built with Fumadocs for project guides and API docs

### Packages
- **`packages/backend`** — Complete Convex backend with database schema, functions, AI agents, workflows, and email templates
- **`packages/design`** — Design system with Tailwind CSS v4, shadcn/ui components, and theme variations (brutalist, minimal, playful)
- **`packages/auth`** — Clerk authentication wrapper with hooks and middleware for Next.js and Convex integration
- **`packages/testing`** — Testing utilities with Vitest, Playwright, and Convex-specific test helpers
- **`packages/typescript-config`** — Shared TypeScript configurations for different project types
- **`packages/analytics`** — PostHog integration for user analytics and feature tracking
- **`packages/observability`** — Monitoring setup with Sentry integration and status components

## Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Backend**: Convex (database, real-time queries, AI agents, workflows)
- **Auth**: Clerk
- **Design**: shadcn/ui, Radix UI, motion-primitives
- **Testing**: Vitest, Playwright
- **AI**: Convex Agent component with AI SDK v5
- **Email**: React Email with Resend

## Quick start

```bash
pnpm install
pnpm dev
```

The main app runs at `localhost:3000`, docs at `localhost:3002`.