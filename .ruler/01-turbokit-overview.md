# TurboKit - Convex Native Template

## Overview
TurboKit is a modern, Convex-native turborepo template that uses Convex as a complete backend solution with real-time subscriptions, durable workflows, AI agents, and integrated email.

## Architecture Philosophy
- **Single Backend Package**: All server logic in `packages/backend/convex`
- **Real-time by Default**: WebSocket subscriptions for live updates
- **Type Safety**: End-to-end TypeScript with generated types
- **Component-Based**: Leverage Convex components for common functionality

## Key Technologies
- **Backend**: Convex (database, functions, workflows, file storage)
- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Auth**: Clerk with Convex integration
- **AI**: Convex Agent component (AI SDK v5)
- **Email**: Convex Resend component
- **Payments**: Convex Polar component

## Development Workflow
1. Define schema in `packages/backend/convex/schema.ts`
2. Create functions in `packages/backend/convex/functions/`
3. Use generated API in client with `useQuery` and `useMutation`
4. Real-time updates happen automatically

### Environment Diagnostics

TurboKit prints an env diagnostics banner on `dev` and `build` that lists optional services and how to enable them. See `packages/next-config/diagnostics.ts`.

- Copy `.env.example` → `.env.local` to enable services locally.
- The apps must build and run without any env vars.
- Agents should use banner status to decide whether to call external services or use fallbacks.
