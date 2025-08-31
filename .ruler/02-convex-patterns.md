# Convex Development Patterns

## Function Types
- **Queries**: Read-only database operations (automatically reactive)
- **Mutations**: Database writes (transactional)
- **Actions**: External API calls, file operations, AI calls
- **Internal Functions**: Called from other functions, not exposed to client

## Database Schema
- Define tables in `packages/backend/convex/schema.ts`
- Always add indexes for fields you query by
- Use `v.id("tableName")` for foreign keys
- Include `createdAt` and `updatedAt` timestamps

## Authentication Pattern
```typescript
import { requireAuth } from "../components/auth";

export const myFunction = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);
    // Function logic with authenticated user
  },
});
```

## Error Handling
- Use `ConvexError` for user-facing errors
- Include error codes for client handling
- Let Convex handle retries for transient failures

## Real-time Subscriptions
- Queries automatically subscribe to changes
- No need for manual polling or WebSocket management
- Updates propagate instantly to all clients

## File Storage
- Use Convex's built-in file storage
- Upload files in actions, store URLs in database
- Automatic CDN distribution