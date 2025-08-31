# AI and Components

## AI Integration (Convex Agent Component)
- Use `@convex-dev/agent` for AI capabilities
- Configure models in environment variables
- Create agents in `packages/backend/convex/agents/`
- Use threads for conversation memory
- Implement custom tools as Convex functions

## Email System (Convex Resend Component)
- Use `@convex-dev/resend` for email sending
- Create React Email templates in `packages/backend/convex/emails/`
- Send emails only from actions (not mutations)
- Handle webhooks for delivery tracking

## Payments (Convex Polar Component)
- Use `@convex-dev/polar` for subscriptions
- Configure products in Polar dashboard
- Handle webhooks in `packages/backend/convex/http.ts`
- Use React components for checkout flow

## Workflows (Durable Execution)
- Use `@convex-dev/workflow` for multi-step processes
- Define workflows in `packages/backend/convex/workflows/`
- Use steps for sequential/parallel execution
- Handle failures with automatic retries

## Other Essential Components
- **Migrations**: `@convex-dev/migrations` for schema changes
- **Aggregate**: `@convex-dev/aggregate` for analytics
- **Action Retrier**: `@convex-dev/action-retrier` for resilient API calls
- **Crons**: `@convex-dev/crons` for scheduled jobs