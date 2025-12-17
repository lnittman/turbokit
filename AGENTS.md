# TurboKit - AI Agent Instructions

Complete instructions for AI agents working with TurboKit, a modern Convex-native turborepo template.

## Quick Start

**What you get out of the box:**
- `apps/app`: Next.js 15 + React 19 app shell
- `packages/backend/convex`: Convex backend (database, functions, workflows)
- `packages/design`: Design system (tokens, components, themes)
- `packages/media`: Multi-provider media generation library (images, video, audio via Fal.ai)
- `docs/`: Documentation starter

**First actions:**
```bash
pnpm install
npx convex init
pnpm dev
```

**Where to edit:**
- Backend: `packages/backend/convex/{schema.ts,app/,lib/,http.ts}`
- Frontend: `apps/app/src/app/*` and shared UI in `packages/design/components/`
- Design: tokens/themes in `packages/design/styles/*`
- Env: `.env.local` (copy from `.env.example`)

**Principles:**
- Token-first UI; prefer design tokens over forking components
- Typed Convex code; organize by domain
- Preserve accessibility and keyboard navigation
- Document architectural changes in this file

---

## Architecture Overview

### Key Technologies
- **Backend**: Convex (database, functions, workflows, file storage)
- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Auth**: Clerk with Convex integration
- **AI**: Convex Agent component (AI SDK v5)
- **Email**: Convex Resend component
- **Payments**: Autumn Convex component

### Philosophy
- **Single Backend Package**: All server logic in `packages/backend/convex`
- **Real-time by Default**: WebSocket subscriptions for live updates
- **Type Safety**: End-to-end TypeScript with generated types
- **Component-Based**: Leverage Convex components for common functionality

---

## Design System

Location: `packages/design/`

### Token-First Design

All visual properties flow from CSS custom properties in `packages/design/styles/globals.css`:

```css
:root {
  /* Core Palette */
  --background: oklch(0.98 0.005 85);  /* Warm off-white */
  --foreground: oklch(0.2 0.01 85);    /* Warm black */
  --primary: oklch(0.22 0.01 85);      /* Near black */

  /* Layout */
  --radius: 0.5rem;                    /* Border radius */
}
```

### OKLCH Color Space

Format: `oklch(Lightness Chroma Hue)`
- **L**: 0-1 (0 = black, 1 = white)
- **C**: 0-0.4 (0 = grayscale, higher = saturated)
- **H**: 0-360 (color wheel degrees)

**Quick Reference:**
- Grayscale: `oklch(0.5 0 0)`
- Warm tones: H around 60-90
- Cool tones: H around 200-240
- Vibrant: C > 0.15

### Component Organization

**Important**: Components specific to a single app live in that app's codebase. Only components shared between 2+ apps belong in the design package.

```
packages/design/components/
├── ui/                  # shadcn/ui components (60+ components)
├── motion/              # Animation components
├── kibo/                # Advanced UI components
└── apps/                # Shared cross-app components
```

### Styling Best Practices

1. **Always start with tokens**, not components
2. **Use OKLCH** for predictable color manipulation
3. **Test in both light and dark modes**
4. **Maintain semantic meaning** (primary = action, destructive = danger)
5. **Preserve accessibility** (WCAG AA contrast ratios)

See `packages/design/CLAUDE.md` for complete design system documentation.

---

## Convex Backend Layout

Location: `packages/backend/convex/`

### Top-level files

- `convex.config.ts` — registers Convex components via `app.use(...)`
- `schema.ts` — canonical DB schema (required for codegen)
- `http.ts` — HTTP router (`httpRouter`) and public endpoints
- `webhooks.ts` — optional shared handlers (imported/used by `http.ts`)
- `crons.ts` — defines scheduled jobs (exports `default crons`)

### Directories

```
convex/
├── lib/                # Cross-cutting helpers
│   ├── auth.ts         # Authentication helpers
│   ├── actionCache.ts  # Pre-configured cache instances
│   ├── workpool.ts     # Concurrency control pools
│   └── rag.ts          # RAG client and helpers
├── providers/          # Model providers (openai, openrouter, fal)
├── app/                # Domain-organized business logic
│   ├── notifications/  # Notification system
│   ├── images/         # Image generation
│   ├── users/          # User management
│   └── projects/       # Business entities
├── agents/             # AI agent definitions
├── workflows/          # Durable workflows
├── emails/             # Email templates
└── migrations/         # Database migrations
```

### Function Types

- **Queries**: Read-only database operations (automatically reactive)
- **Mutations**: Database writes (transactional)
- **Actions**: External API calls, file operations, AI calls
- **Internal Functions**: Called from other functions, not exposed to client

### Database Schema

- Define tables in `packages/backend/convex/schema.ts`
- Always add indexes for fields you query by
- Use `v.id("tableName")` for foreign keys
- Include `createdAt` and `updatedAt` timestamps

### Authentication Pattern

```typescript
import { requireAuth } from "../lib/auth";

export const myFunction = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);
    // Function logic with authenticated user
  },
});
```

### Function Organization

- Keep `query/mutation/action` wrappers thin; put core logic in helpers
- Only call `internal.*` from `ctx.run*` and `crons` (avoid `api.*` internally)
- Prefer indexes + pagination over `.filter().collect()`
- Validate all arguments and return values

---

## Convex Components & Patterns

### ActionCache

Location: `packages/backend/convex/lib/actionCache.ts`

Pre-configured cache instances:

```typescript
import { imageGenerationCache, llmResponseCache, apiCallCache } from "../lib/actionCache";

// Cache image generation (24h TTL)
const result = await imageGenerationCache.fetch(ctx, { prompt }, async () => {
  return await generateImage(...);
});

// Cache LLM responses (1h TTL)
const response = await llmResponseCache.fetch(ctx, { model, prompt }, async () => {
  return await callLLM(...);
});

// Cache API calls (5min TTL)
const data = await apiCallCache.fetch(ctx, { endpoint }, async () => {
  return await fetch(...);
});
```

**Configuration:**
- `imageGenerationCache`: 24h TTL, 1000 items max
- `llmResponseCache`: 1h TTL, 5000 items max
- `apiCallCache`: 5min TTL, 10000 items max

### Workpool

Location: `packages/backend/convex/lib/workpool.ts`

Pre-configured concurrency pools:

```typescript
import { imageGenPool, llmPool, apiPool } from "../lib/workpool";

// Limit concurrent image generations (max 5)
await imageGenPool.executeWithConcurrencyLimit(ctx, async () => {
  return await generateImage(...);
});

// Limit concurrent LLM calls (max 10)
await llmPool.executeWithConcurrencyLimit(ctx, async () => {
  return await callLLM(...);
});
```

**Configuration:**
- `imageGenPool`: Max 5 concurrent operations
- `llmPool`: Max 10 concurrent operations
- `apiPool`: Max 20 concurrent operations

### RAG

Location: `packages/backend/convex/lib/rag.ts`

Generic RAG client with helper functions:

```typescript
import { ingestDocument, searchDocuments } from "../lib/rag";

// Ingest a document
await ingestDocument(ctx, {
  documentId: "doc_123",
  content: "Long document text...",
  metadata: { title: "Guide", author: "Alice" },
});

// Search documents
const results = await searchDocuments(ctx, "user query", {
  limit: 5,
  source: "user_docs",
});
```

### Crons

Location: `packages/backend/convex/crons.ts`

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Daily at 02:00 UTC
crons.cron(
  "daily.analytics-aggregation",
  { hourUTC: 2, minuteUTC: 0 },
  internal.analytics.internal.aggregateDaily,
  {}
);

// Every 6 hours
crons.interval(
  "cache.cleanup",
  { hours: 6 },
  internal.cache.internal.cleanupExpired,
  {}
);

export default crons;
```

**Best practices:**
- Only schedule internal functions (`internal.*`)
- Keep crons short; real logic lives in domain helpers
- Use correlation IDs for tracing

### Migrations

Location: `packages/backend/convex/migrations/`

```typescript
import { internalMutation } from "../_generated/server";

export const migrate = internalMutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.patch(user._id, { newField: "default value" });
    }
    console.log(`Migrated ${users.length} users`);
  },
});
```

See `packages/backend/convex/migrations/README.md` for full guide.

---

## Notifications System

Location: `packages/backend/convex/app/notifications/`

### Architecture

Convex-native real-time notification system. No external services required.

**Tables:**
- `notifications` - In-app notifications with read/archived states
- `deviceTokens` - Push notification device tokens (FCM/APNs/Web)
- `notificationPreferences` - User preferences per channel and type

**Functions:**
- `queries.ts` - Real-time notification feeds, counts, preferences
- `mutations.ts` - CRUD operations, mark read, update preferences
- `internal.ts` - Push notification delivery (FCM/APNs), workflow examples

### Creating Notifications

```typescript
// From client
await ctx.runMutation(api.app.notifications.mutations.create, {
  userId: user._id,
  type: "user.welcome",
  title: "Welcome to TurboKit!",
  body: "Let's get you started with your first project.",
  link: "/getting-started",
  icon: "welcome",
});

// From backend (workflow, cron, webhook)
await ctx.runMutation(internal.app.notifications.mutations.create, {
  userId: user._id,
  type: "billing.renewal",
  title: "Subscription Renewal",
  body: "Your subscription will renew tomorrow.",
  link: "/settings/billing",
});
```

### Client Components

Location: `apps/app/src/components/notifications/`

```tsx
import { NotificationBell, NotificationPreferences } from "@/components/notifications";

// In header/navigation
<NotificationBell />

// In settings page
<NotificationPreferences />
```

**Components:**
- `NotificationBell` - Bell icon with unread badge, opens popover feed
- `NotificationsFeed` - List of notifications with real-time updates
- `NotificationPreferences` - Settings panel for notification preferences

### Push Notifications

Configure environment variables:

```env
# FCM (Firebase Cloud Messaging)
FCM_SERVER_KEY=your_server_key

# APNs (Apple Push Notifications)
APNS_KEY_ID=your_key_id
APNS_TEAM_ID=your_team_id
APNS_KEY_PATH=/path/to/AuthKey_XXX.p8

# Web Push (VAPID)
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

Send push notifications:

```typescript
await ctx.runAction(internal.app.notifications.internal.sendPush, {
  userId: user._id,
  title: "New Message",
  body: "You have a new message from Alice.",
  data: { messageId: "msg_123" },
  link: "/messages/msg_123",
});
```

### Best Practices

1. **Use type constants** - Define notification types as constants for consistency
2. **Provide links** - Always include a `link` for navigation context
3. **Check preferences** - System auto-checks, notifications won't be created if disabled
4. **Use icons** - Add visual context with icon names/URLs
5. **Batch operations** - Use `bulkCreate` for notifying multiple users

See `packages/backend/convex/app/notifications/CLAUDE.md` for full documentation.

---

## Media Generation

Location: `packages/media/` (client library) + `packages/backend/convex/app/images/` (backend)

### Architecture

Framework-agnostic media generation library with multi-provider support.

**Supported Providers:**
1. **OpenAI gpt-image-1** - Via Responses API, high quality image generation, supports input images
2. **Fal.ai** - Images (Flux, SDXL), video (Runway, Luma), audio (MusicGen), 3D, and more
3. **OpenRouter** - Access to multiple image generation models via unified API

### Client Usage

```typescript
import { ImagesClient } from "@repo/media";

const client = new ImagesClient({
  openAIApiKey: process.env.OPENAI_API_KEY,
  falApiKey: process.env.FAL_KEY,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
});

// OpenAI gpt-image-1
const result = await client.generateWithOpenAIImageGen1({
  prompt: "A serene mountain landscape at sunset",
  quality: "high",
  size: "1024x1024",
});

// Fal.ai (Flux)
const result = await client.generateWithFal({
  prompt: "A futuristic city with flying cars",
  model: "flux/dev",
});

// OpenRouter
const result = await client.generateWithOpenRouter({
  prompt: "An abstract painting in the style of Kandinsky",
  model: "openai/dall-e-3",
});
```

### React Hooks

```tsx
import { useImageGen1 } from "@repo/media/react";

function ImageGenerator() {
  const { generate, data, loading, error } = useImageGen1({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });

  return (
    <div>
      <button onClick={() => generate({ prompt: "..." })} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>
      {data && <img src={data} alt="Generated" />}
    </div>
  );
}
```

### Backend Integration (Convex)

**Mutation-Schedules-Action Pattern:**

```typescript
// 1. Client calls mutation
const { jobId } = await ctx.runMutation(
  api.app.images.mutations.startGeneration,
  {
    provider: "openai",
    prompt: "A serene mountain landscape",
    quality: "high",
  }
);

// 2. Client subscribes to job status
const job = useQuery(api.app.images.queries.getJob, { jobId });
```

**Features:**
- Job tracking with status (queued → processing → completed/failed)
- Automatic retries with exponential backoff (max 3 attempts)
- Idempotency checks to prevent duplicate jobs
- Correlation IDs for tracing
- Integration with Workpool for concurrency control

### XML-Based Prompts

```typescript
import { applyAnimeFilter } from "@repo/media/prompts/anime";

const prompt = applyAnimeFilter({
  subject: "a girl with long flowing hair",
  output: "sticker", // or "scene", "wallpaper"
});

const result = await client.generateWithOpenAIImageGen1({ prompt });
```

See `packages/media/AGENTS.md` for creating custom prompt templates.

### Environment Variables

```env
OPENAI_API_KEY=sk-...
FAL_KEY=...
OPENROUTER_API_KEY=or_...
```

### Best Practices

1. **Use backend for production** - Client-side generation exposes API keys
2. **Implement job tracking** - Use mutation-action pattern for reliability
3. **Cache results** - Use ActionCache (24h TTL for images)
4. **Handle errors gracefully** - Retry logic is built-in
5. **Respect rate limits** - Use Workpool to control concurrency
6. **Store results** - Save generated images to database or file storage
7. **Use correlation IDs** - Track jobs across logs and callbacks

See `packages/media/CLAUDE.md` for full documentation.

---

## Development Patterns

### Mutation-Schedules-Action Pattern

**Problem:** Operations that call external services (AI, payments, image generation) should not run directly in mutations.

**Solution:** Mutation creates a job record, immediately schedules an internal action.

**Benefits:**
- Single round-trip from client (no polling)
- Robust to navigation/reload
- Idempotency and retries are server-controlled
- Clear separation: mutation writes state, action hits network

**Implementation:**

```typescript
// mutations.ts
export const startJob = mutation({
  args: { input: v.string() },
  handler: async (ctx, { input }) => {
    const { user } = await requireAuth(ctx);

    // Idempotency check
    const existing = await ctx.db
      .query("jobs")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "queued")
      )
      .first();
    if (existing) return { jobId: existing._id };

    // Create job
    const jobId = await ctx.db.insert("jobs", {
      userId: user._id,
      input,
      status: "queued",
      attempts: 0,
      correlationId: crypto.randomUUID(),
      createdAt: Date.now(),
    });

    // Schedule action immediately
    await ctx.scheduler.runAfter(0, internal.domain.internal.processJob, { jobId });
    return { jobId };
  },
});

// internal.ts
export const processJob = internalAction({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.runQuery(internal.domain.internal.getJob, { jobId });
    if (!job || job.status === "completed") return;

    await ctx.runMutation(internal.domain.internal.updateJobStatus, {
      jobId,
      status: "processing",
      attempts: job.attempts + 1,
    });

    try {
      const result = await externalAPI(job.input);
      await ctx.runMutation(internal.domain.internal.completeJob, { jobId, result });
    } catch (error) {
      const backoffMs = Math.min(60_000, 2 ** job.attempts * 1000);
      await ctx.scheduler.runAfter(backoffMs, internal.domain.internal.processJob, { jobId });
      await ctx.runMutation(internal.domain.internal.updateJobStatus, { jobId, status: "queued" });
    }
  },
});
```

**Client usage:**

```tsx
const { mutate } = useMutation(api.domain.mutations.startJob);
const [jobId, setJobId] = useState(null);
const job = useQuery(api.domain.queries.getJob, jobId ? { jobId } : "skip");

const handleStart = async () => {
  const { jobId } = await mutate({ input: "..." });
  setJobId(jobId);
};

// Job status updates in real-time via Convex subscription
{job?.status === "completed" && <p>Result: {job.result}</p>}
{job?.status === "failed" && <p>Error: {job.error}</p>}
```

**Use this pattern for:**
- Image generation
- AI/LLM calls
- Payment processing
- Email sending
- File uploads
- External API calls

### Idempotency & De-duplication

- Maintain a jobs table keyed by domain entity with a status field
- On `startJob`, if a job exists in `{queued, processing}`, return that record
- Store `correlationId` for end-to-end tracing

### Real-time Subscriptions

- Queries automatically subscribe to changes
- No need for manual polling or WebSocket management
- Updates propagate instantly to all clients

### Error Handling

- Use `ConvexError` for user-facing errors
- Include error codes for client handling
- Let Convex handle retries for transient failures

---

## Coding Standards

### TypeScript Requirements

- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for functions
- Use Convex schemas (`v.*`) for runtime validation

### Naming Conventions

- Tables: plural, lowercase (e.g., `users`, `posts`)
- Functions: camelCase verbs (e.g., `createPost`, `getUser`)
- Components: PascalCase (e.g., `UserProfile`)
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case for components, camelCase for functions

### Performance Best Practices

- Use indexes for all query fields
- Paginate large result sets
- Cache expensive computations (use ActionCache)
- Use `ctx.scheduler` for background jobs
- Batch database operations when possible

### Security

- Always validate inputs with schemas
- Sanitize user-generated content
- Use environment variables for secrets (Convex dashboard for backend)
- Implement rate limiting for public endpoints
- Never expose internal functions to client

### Observability & Logging

- Use a centralized activity log (e.g., `app/users/internal.logActivity`)
- Add consistent tags (e.g., `[BILLING]`, `[UPLOADS]`, `[AGENTS]`)
- Include `correlationId` in metadata for tracing
- Log execution results for monitoring

### Environment Variables

- Keep secrets in Convex dashboard (not `.env.local`)
- Read `process.env` once at module scope in actions
- Avoid env reads in queries/mutations unless required
- Use `NEXT_PUBLIC_` prefix for client-side variables in Next.js

---

## AI and Components

### AI Integration (Convex Agent Component)

- Use `@convex-dev/agent` for AI capabilities
- Configure models in environment variables
- Create agents in `packages/backend/convex/agents/`
- Use threads for conversation memory
- Implement custom tools as Convex functions

### Email System (Convex Resend Component)

- Use `@convex-dev/resend` for email sending
- Create React Email templates in `packages/backend/convex/emails/`
- Send emails only from actions (not mutations)
- Handle webhooks for delivery tracking

### Payments (Autumn)

- Use `@useautumn/convex` for subscriptions/billing
- Configure billing/products in the Autumn dashboard
- No webhooks required: Autumn handles them
- Use `check`, `track`, `checkout` from `convex/autumn.ts`

### Workflows (Durable Execution)

- Use `@convex-dev/workflow` for multi-step processes
- Define workflows in `packages/backend/convex/workflows/`
- Use steps for sequential/parallel execution
- Handle failures with automatic retries

---

## Development Workflow

1. **Define schema** in `packages/backend/convex/schema.ts`
2. **Create domain functions** under `packages/backend/convex/app/{domain}/`
3. **Use generated API** in client with `useQuery` and `useMutation`
4. **Real-time updates** happen automatically via subscriptions
5. **Test locally** with `pnpm dev`
6. **Deploy** with `npx convex deploy` (backend) and Vercel/other (frontend)

---

## Troubleshooting

### Components not reflecting token changes
```bash
rm -rf apps/app/.next && pnpm dev
```

### Dark mode not working
Ensure ThemeProvider wraps app with `attribute="class"`

### Convex function not updating
```bash
npx convex dev  # Ensure dev server is running
```

### Type errors after schema changes
```bash
npx convex dev  # Regenerates types
```

---

**This is the authoritative documentation for AI agents working with TurboKit. Update this file when the architecture changes.**
