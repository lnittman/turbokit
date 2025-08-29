# TurboKit - Convex Native Template

TurboKit is a modern, Convex-native turborepo template that demonstrates the power of Convex as a complete backend solution. It features real-time subscriptions, durable workflows, AI agents, and integrated email - all in a single backend package.

## Architecture Overview

TurboKit uses Convex as the single source of truth for all backend operations:
- **Single Backend Package**: All server logic in `packages/backend/convex`
- **Real-time by Default**: WebSocket subscriptions for live updates
- **AI Agents**: Built-in AI SDK v5 integration via Convex Agent component
- **Email System**: Resend component with tracking and webhooks
- **Durable Workflows**: Long-running processes with automatic retries
- **Type Safety**: End-to-end TypeScript with generated types

## Project Structure

```
turbokit/
├── apps/
│   ├── app/                    # Next.js 15 client application
│   └── docs/                   # Documentation (optional)
│
├── packages/
│   ├── backend/                # 🔥 Convex backend (all server logic)
│   │   ├── convex/
│   │   │   ├── _generated/     # Auto-generated types
│   │   │   ├── agents/         # AI agents
│   │   │   ├── components/     # Shared utilities
│   │   │   ├── emails/         # Email templates (React Email)
│   │   │   ├── functions/      # Convex functions
│   │   │   │   ├── actions/    # External API calls (incl. email sending)
│   │   │   │   ├── mutations/  # Database writes
│   │   │   │   ├── queries/    # Database reads
│   │   │   │   └── internal/   # Internal functions (incl. webhooks)
│   │   │   ├── workflows/      # Durable workflows
│   │   │   ├── http.ts         # HTTP routes & webhooks
│   │   │   └── schema.ts       # Database schema
│   │   └── convex.config.ts    # Component configuration
│   │
│   ├── auth/                   # Client auth utilities
│   ├── design/                 # UI component library
│   └── analytics/              # Analytics utilities
│
├── turbo.json                  # Turborepo config
├── package.json                # Root package
└── CLAUDE.md                   # This file
```

## Key Features

### 1. Convex Backend
- **Database**: Relational tables with indexes and vector search
- **Real-time**: WebSocket subscriptions for live data
- **Functions**: Type-safe queries, mutations, and actions
- **HTTP Routes**: Built-in webhook handling
- **File Storage**: Native file upload/download support

### 2. AI Integration
- **Convex Agent Component**: AI SDK v5 integration
- **Multiple Providers**: OpenAI, Anthropic, Google
- **Vector Search**: Built-in embeddings support
- **Conversation Memory**: Thread-based chat history
- **Custom Tools**: Extensible agent capabilities

### 3. Email System
- **Convex Resend Component**: Durable email sending
- **React Email Templates**: Component-based emails
- **Webhook Events**: Delivery tracking and bounces
- **Rate Limiting**: Built-in spam protection

### 4. Durable Workflows
- **Long-Running Processes**: Survive server restarts
- **Automatic Retries**: Configurable retry policies
- **Step Functions**: Sequential and parallel execution
- **Delays**: Built-in sleep and scheduling

## Development Guide

### Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start development
pnpm dev
```

### Environment Variables

```bash
# packages/backend/.env.local
CONVEX_DEPLOYMENT=development
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
RESEND_WEBHOOK_SECRET=whsec_...
CLERK_WEBHOOK_SECRET=whsec_...
APP_URL=http://localhost:3000

# apps/app/.env.local
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```

## Working with Convex

### Adding a New Feature

#### 1. Define Database Schema
```typescript
// packages/backend/convex/schema.ts
export default defineSchema({
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_published", ["published"]),
});
```

#### 2. Create Query Function
```typescript
// packages/backend/convex/functions/queries/posts.ts
import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 10 }) => {
    const { user } = await requireAuth(ctx);
    return await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", user._id))
      .order("desc")
      .take(limit);
  },
});
```

#### 3. Create Mutation Function
```typescript
// packages/backend/convex/functions/mutations/posts.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);
    return await ctx.db.insert("posts", {
      ...args,
      authorId: user._id,
      published: args.published ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

#### 4. Use in Client
```typescript
// apps/app/src/hooks/use-posts.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/api";

export function usePosts(limit?: number) {
  const posts = useQuery(api.functions.queries.posts.getPosts, { limit });
  const createPost = useMutation(api.functions.mutations.posts.createPost);
  
  return { posts, createPost };
}
```

### Working with AI Agents

```typescript
// packages/backend/convex/agents/my-agent.ts
import { Agent } from "@convex-dev/agent";
import { components } from "../_generated/api";

export const myAgent = new Agent(components.agent, {
  name: "my-agent",
  instructions: "You are a helpful assistant...",
  model: getChatModel(),
  tools: {
    // Add custom tools
  },
});

// Use in an action
export const chat = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const { thread } = await myAgent.continueThread(ctx, { threadId });
    const result = await thread.generateText(prompt);
    return result.text;
  },
});
```

### Working with Workflows

```typescript
// packages/backend/convex/workflows/my-workflow.ts
import { workflow } from "./manager";

export const myWorkflow = workflow.define({
  args: { userId: v.id("users") },
  handler: async (step, { userId }) => {
    // Step 1: Do something
    const result = await step.runMutation(
      api.functions.mutations.doSomething,
      { userId }
    );
    
    // Step 2: Wait
    await step.sleep(5000);
    
    // Step 3: Send email
    await step.runAction(
      api.emails.sendEmails.sendNotification,
      { userId, result }
    );
  },
});
```

## Common Patterns

### Authentication
- All auth flows through Clerk
- User sync via webhooks
- Auth utilities in `packages/backend/convex/components/auth.ts`

### Real-time Updates
- Queries automatically subscribe to changes
- No need for manual polling or refresh
- Updates propagate instantly to all clients

### Error Handling
- Use `ConvexError` for user-facing errors
- Convex handles retries for transient failures
- Workflows provide durable execution

### Rate Limiting
```typescript
await checkRateLimit(ctx, "apiCall", userId);
```

### Email Sending
```typescript
// In an action (packages/backend/convex/functions/actions/emails.ts)
import { render } from "@react-email/render";
import WelcomeEmail from "../../emails/welcome";

await resend.sendEmail(ctx, {
  from: "noreply@app.com",
  to: user.email,
  subject: "Welcome!",
  html: await render(<WelcomeEmail name={userName} />),
});
```

## Deployment

```bash
# Deploy backend
cd packages/backend
npx convex deploy --prod

# Deploy frontend
cd apps/app
vercel --prod
```

## Best Practices

1. **Keep functions small**: Break complex logic into multiple functions
2. **Use indexes**: Always index fields you query by
3. **Leverage workflows**: For multi-step processes
4. **Type everything**: Convex generates types automatically
5. **Use components**: For reusable functionality

## Migration from Multi-Service Architecture

This template replaces:
- `apps/api` → Convex functions
- `apps/ai` → Convex Agent component
- `apps/email` → Convex Resend component
- `packages/database` → Convex database
- `packages/api` → Convex functions
- `packages/webhooks` → Convex HTTP routes

All backend logic now lives in `packages/backend/convex` with superior:
- Type safety
- Real-time capabilities
- Durability
- Simplicity

## Support

For questions or issues, refer to:
- [Convex Documentation](https://docs.convex.dev)
- [TurboKit GitHub](https://github.com/your-org/turbokit)
- [Discord Community](https://convex.dev/community)