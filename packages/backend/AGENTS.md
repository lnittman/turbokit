# Backend Package - AI Agent Instructions

## Overview
This package provides the Convex backend for TurboKit applications, implementing a complete serverless backend with real-time subscriptions, durable workflows, AI agents, file storage, and integrated email. Follows Convex best practices for scalable, type-safe backend development.

## Quick Start Checklist
- [ ] Set up Convex project and deploy initial schema
- [ ] Configure environment variables in Convex Dashboard
- [ ] Set up indexes for all query patterns
- [ ] Implement argument validation for all public functions
- [ ] Add access control to all public functions
- [ ] Configure Convex components (Agent, Resend, Autumn, etc.)
- [ ] Set up webhook handlers for external services
- [ ] Test real-time subscriptions

## Architecture Overview

### Directory Structure (Domain-First)
```
packages/backend/convex/
├── _generated/              # Auto-generated Convex files (DO NOT EDIT)
├── convex.config.ts         # Component registration (app.use())
├── schema.ts                # Database schema definition
├── http.ts                  # HTTP routes and public endpoints
├── crons.ts                 # Scheduled jobs
├── auth.config.ts           # JWT validation config
│
├── lib/                     # Cross-cutting utilities
│   ├── auth.ts             # Auth helpers (requireAuth, optionalAuth)
│   ├── models.ts           # AI model configuration
│   ├── rateLimiter.ts      # Rate limiting utilities
│   └── actionCache.ts      # Action result caching
│
├── agents/                  # AI agent system
│   ├── definitions/        # Agent instances
│   └── actions.ts          # Agent entrypoints
│
├── app/                     # Domain modules
│   ├── billing/           # Autumn integration
│   ├── emails/            # Resend integration
│   ├── presence/          # Real-time presence
│   ├── uploads/           # R2 file storage
│   ├── users/             # User management
│   └── projects/          # Project management
│
└── workflows/              # Durable workflows
    └── manager.ts          # Workflow orchestration
```

## Schema Design Best Practices

### Define Comprehensive Schema
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    credits: v.number(),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
  // CRITICAL: Add indexes for ALL query patterns
  .index("by_clerk_id", ["clerkId"])
  .index("by_email", ["email"])
  .index("by_plan", ["plan", "createdAt"]),  // Compound index

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("draft")),
    settings: v.object({
      isPublic: v.boolean(),
      allowComments: v.boolean(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId", "createdAt"])  // Sort by creation
  .index("by_status", ["status"])
  .searchIndex("search_projects", {  // Full-text search
    searchField: "name",
    filterFields: ["userId", "status"],
  }),
});
```

### Index Best Practices
1. **Always use indexes** - Never use `.filter()` on queries
2. **Avoid redundant indexes** - `by_user` covers `by_user_and_status` prefix
3. **Compound indexes** - Order matters! Most selective field first
4. **Search indexes** - For full-text search requirements

## Function Organization

### Layer Architecture
```typescript
// 1. Public API Layer (thin wrappers)
// convex/projects.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import * as Projects from "./app/projects/model";

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    return Projects.listForCurrentUser(ctx, args);
  },
});

// 2. Model Layer (business logic)
// convex/app/projects/model.ts
import { QueryCtx } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";

export async function listForCurrentUser(
  ctx: QueryCtx,
  { status }: { status?: "active" | "archived" }
) {
  const { user } = await requireAuth(ctx);

  const query = ctx.db
    .query("projects")
    .withIndex("by_user", (q) => q.eq("userId", user._id));

  if (status) {
    // Filter in code, not with .filter()
    const all = await query.collect();
    return all.filter(p => p.status === status);
  }

  return query.collect();
}

// 3. Internal Functions (for scheduling/webhooks)
// convex/projects.ts
export const syncProject = internalMutation({
  args: { externalId: v.string(), data: v.any() },
  handler: async (ctx, args) => {
    // No auth checks needed - internal only
    return Projects.syncFromExternal(ctx, args);
  },
});
```

## Query Performance Optimization

### ❌ Anti-Patterns to Avoid
```typescript
// 1. Never use .filter() on database queries
const badQuery = await ctx.db
  .query("messages")
  .filter((q) => q.eq(q.field("author"), "Tom"))  // ❌ Inefficient
  .collect();

// 2. Never collect unbounded results
const allUsers = await ctx.db
  .query("users")
  .collect();  // ❌ Could be millions!

// 3. Never use multiple sequential queries in actions
const user = await ctx.runQuery(internal.users.get, { id });
const projects = await ctx.runQuery(internal.projects.list, { userId });  // ❌ Inconsistent
```

### ✅ Correct Patterns
```typescript
// 1. Always use indexes
const goodQuery = await ctx.db
  .query("messages")
  .withIndex("by_author", (q) => q.eq("author", "Tom"))  // ✅ Efficient
  .collect();

// 2. Use pagination or limits
const recentUsers = await ctx.db
  .query("users")
  .withIndex("by_created", (q) => q.gte("createdAt", Date.now() - 86400000))
  .take(100);  // ✅ Bounded

// Or use pagination
const page = await ctx.db
  .query("users")
  .paginate(paginationOpts);  // ✅ Paginated

// 3. Batch queries in single transaction
export const getUserWithProjects = internalQuery({
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return { user, projects };  // ✅ Consistent snapshot
  },
});
```

## Authentication & Authorization

### Always Validate Access
```typescript
// convex/lib/auth.ts
import { ConvexError } from "convex/values";

export async function requireAuth(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Authentication required");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new ConvexError("User not found");
  }

  return { identity, user };
}

// convex/app/projects/mutations.ts
export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const { user } = await requireAuth(ctx);

    const project = await ctx.db.get(id);
    if (!project) {
      throw new ConvexError("Project not found");
    }

    // Verify ownership
    if (project.userId !== user._id) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
```

## Argument Validation (Required!)

### Always Validate All Arguments
```typescript
import { v } from "convex/values";

// ❌ BAD: No validation - security risk!
export const updateUser = mutation({
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.update);  // Could update ANY document!
  },
});

// ✅ GOOD: Full validation
export const updateUser = mutation({
  args: {
    id: v.id("users"),  // Ensures it's a user ID
    update: v.object({
      name: v.optional(v.string()),
      bio: v.optional(v.string()),
      // Explicitly list allowed fields
    }),
  },
  handler: async (ctx, { id, update }) => {
    const { user } = await requireAuth(ctx);
    if (user._id !== id) {
      throw new ConvexError("Can only update own profile");
    }
    await ctx.db.patch(id, update);
  },
});
```

## Actions & External Services

### Proper Action Patterns
```typescript
// convex/app/ai/actions.ts
import { action } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";

export const generateSummary = action({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    // 1. Get data in single query
    const data = await ctx.runQuery(internal.projects.getWithMessages, {
      projectId,
    });

    // 2. Call external service
    const summary = await callOpenAI(data.messages);

    // 3. Store result in single mutation
    await ctx.runMutation(internal.projects.updateSummary, {
      projectId,
      summary,
    });

    return summary;
  },
});

// NEVER use ctx.runAction from actions - use helper functions
async function callOpenAI(messages: any[]) {
  // Direct function call, not ctx.runAction
}
```

## Component Integration

### Convex Agent (AI)
```typescript
// convex/agents/definitions/assistant.ts
import { Agent } from "@convex-dev/agent";

export const assistant = new Agent({
  model: "gpt-4",
  instructions: "You are a helpful assistant.",
  tools: {
    searchProjects: {
      description: "Search user's projects",
      handler: async (ctx, args) => {
        return ctx.runQuery(internal.projects.search, args);
      },
    },
  },
});

// convex/agents/actions.ts
export const chat = action({
  args: {
    threadId: v.id("threads"),
    message: v.string(),
  },
  handler: async (ctx, { threadId, message }) => {
    const { user } = await requireAuth(ctx);

    const response = await assistant.run(ctx, {
      threadId,
      message,
    });

    // Track usage for billing
    await ctx.runMutation(internal.billing.trackUsage, {
      userId: user._id,
      tokens: response.usage.totalTokens,
    });

    return response;
  },
});
```

### Resend (Email)
```typescript
// convex/app/emails/resend.ts
import Resend from "@convex-dev/resend";

export const resend = new Resend({
  apiKey: process.env.RESEND_API_KEY,
});

// convex/app/emails/actions.ts
export const sendWelcome = action({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.runQuery(internal.users.get, { userId });

    await resend.sendEmail({
      from: "team@example.com",
      to: user.email,
      subject: "Welcome to TurboKit!",
      react: <WelcomeEmail name={user.name} />,
    });

    await ctx.runMutation(internal.users.markWelcomed, { userId });
  },
});
```

## Webhook Handling

### Secure Webhook Pattern
```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Stripe webhook
http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Verify signature
    const signature = request.headers.get("stripe-signature");
    const body = await request.text();

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // 2. Process with internal mutation
    switch (event.type) {
      case "checkout.session.completed":
        await ctx.runMutation(internal.billing.handleCheckout, {
          sessionId: event.data.object.id,
          customerId: event.data.object.customer,
        });
        break;
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
```

## Scheduled Jobs (Crons)

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every 2 hours
crons.interval(
  "cleanup-expired-sessions",
  { hours: 2 },
  internal.sessions.cleanupExpired,
  {}  // args
);

// Run daily at 5:30 UTC
crons.daily(
  "send-digest-emails",
  { hourUTC: 5, minuteUTC: 30 },
  internal.emails.sendDailyDigest,
  {}
);

export default crons;
```

## Error Handling

### Use ConvexError for Structured Errors
```typescript
import { ConvexError } from "convex/values";

// Throw structured errors
throw new ConvexError({
  code: "INSUFFICIENT_CREDITS",
  message: "Not enough credits for this operation",
  required: 100,
  available: user.credits,
});

// Handle in client
try {
  await api.ai.generate({ prompt });
} catch (error) {
  if (error.data?.code === "INSUFFICIENT_CREDITS") {
    showUpgradeModal(error.data.required);
  }
}
```

## Testing Patterns

### Test Helpers
```typescript
// convex/test/helpers.ts
import { ConvexTestingHelper } from "@convex-dev/testing";

export async function createTestUser(t: ConvexTestingHelper) {
  return t.mutation(internal.users.create, {
    clerkId: "test_" + Math.random(),
    email: "test@example.com",
    name: "Test User",
  });
}

// In tests
import { convexTest } from "@convex-dev/testing";
import { createTestUser } from "./helpers";

test("user can create project", async () => {
  const t = convexTest(schema);
  const userId = await createTestUser(t);

  const projectId = await t.mutation(api.projects.create, {
    name: "Test Project",
  });

  const project = await t.query(api.projects.get, { id: projectId });
  expect(project.userId).toBe(userId);
});
```

## Performance Monitoring

### Track Slow Queries
```typescript
// convex/lib/monitoring.ts
export async function trackQueryPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn(`Slow query: ${name} took ${duration}ms`);
    }

    return result;
  } catch (error) {
    console.error(`Query failed: ${name}`, error);
    throw error;
  }
}
```

## Production Checklist

### Before Going Live
- [ ] All public functions have argument validation
- [ ] All public functions have access control
- [ ] All queries use indexes (no .filter())
- [ ] No unbounded .collect() calls
- [ ] All scheduled functions use internal.*
- [ ] Webhook signatures are verified
- [ ] Rate limiting on expensive operations
- [ ] Error handling with ConvexError
- [ ] Monitoring for slow queries
- [ ] Backup strategy for critical data

## Common Pitfalls to Avoid

1. **Never trust client input** - Always validate and authorize
2. **Never use .filter()** - Use indexes instead
3. **Never collect unbounded data** - Use pagination or limits
4. **Never expose internal functions** - Mark them as internal*
5. **Never skip webhook verification** - Always verify signatures
6. **Never use api.* in server** - Use internal.* for scheduling
7. **Never chain queries in actions** - Batch in single query
8. **Never use runAction unnecessarily** - Use helper functions

## Environment Variables

### Required in Convex Dashboard
```env
# Authentication
CLERK_JWT_ISSUER_DOMAIN=https://...
CLERK_WEBHOOK_SECRET=whsec_...

# AI (if using)
OPENROUTER_API_KEY=or_...
OPENROUTER_MODEL=openai/gpt-4

# Email (if using)
RESEND_API_KEY=re_...

# Payments (if using)
AUTUMN_SECRET_KEY=autm_...

# Storage (if using)
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...

# Analytics (optional)
POSTHOG_API_KEY=phk_...
```

## Type Exports

### Use the types.ts Pattern
```typescript
// packages/backend/types.ts
export type { Doc, Id, DataModel } from "./convex/_generated/dataModel";

// Document aliases
export type User = Doc<"users">;
export type Project = Doc<"projects">;
export type Message = Doc<"messages">;

// ID aliases
export type UserId = Id<"users">;
export type ProjectId = Id<"projects">;

// Enums
export type ProjectStatus = "active" | "archived" | "draft";
export type UserPlan = "free" | "pro" | "enterprise";

// In app code
import type { User, ProjectId } from "@repo/backend/types";
```

## Key Files
- `schema.ts` - Database schema and indexes
- `http.ts` - HTTP routes and webhooks
- `crons.ts` - Scheduled jobs
- `auth.config.ts` - JWT validation
- `convex.config.ts` - Component registration
- `lib/auth.ts` - Authentication helpers
- `types.ts` - Type exports for apps

## TurboKit Conventions
- Domain-first directory structure
- Helper functions for business logic
- Internal functions for scheduling
- Comprehensive argument validation
- ConvexError for structured errors
- Indexes for all query patterns
- Type exports via types.ts

## When to Use Backend Functions
- ✅ Database operations (queries, mutations)
- ✅ External API calls (actions)
- ✅ Real-time subscriptions
- ✅ File storage operations
- ✅ Background jobs and workflows
- ✅ Webhook processing
- ❌ Not for static content
- ❌ Not for client-only logic
- ❌ Not for UI state management