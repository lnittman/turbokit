# Spots

AI-powered location discovery platform built with Next.js, Convex, and Clerk.

## What's inside

### Apps
- **`apps/app`** — Main Spots application with map visualization, AI-powered recommendations, and real-time features
- **`apps/docs`** — Documentation site (Fumadocs)

### Packages
- **`packages/backend`** — Convex backend with spots, interests, recommendations, AI agents, and workflows
- **`packages/design`** — Design system with Tailwind CSS v4, shadcn/ui components, and Spots brand colors
- **`packages/auth`** — Clerk authentication integration
- **`packages/analytics`** — PostHog analytics integration
- **`packages/observability`** — Sentry error tracking
- **`packages/testing`** — Testing utilities (Vitest, Playwright)
- **`packages/typescript-config`** — Shared TypeScript configurations

## Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Backend**: Convex (database, real-time queries, AI agents, workflows)
- **Auth**: Clerk
- **Maps**: Mapbox GL + React Leaflet
- **Design**: shadcn/ui, Radix UI, Framer Motion
- **AI**: Convex Agent component with multi-provider LLM support (OpenAI, Anthropic)
- **Email**: React Email with Resend

## Quick start

```bash
pnpm install
npx convex init
pnpm dev
```

The main app runs at `localhost:3000`.

## Features

- 🗺️ Interactive map-based spot discovery
- 🤖 AI-powered personalized recommendations
- 🏷️ Interest-based filtering and categorization
- 📍 Location-aware search
- 📚 Collections and trip planning
- ⭐ Check-ins and reviews
- 📧 Email notifications
- 🌙 Dark/light mode
- 📱 Mobile responsive

## Development

See `CLAUDE.md` for detailed architecture documentation and development guidelines.
