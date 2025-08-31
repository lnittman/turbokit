# Coding Standards

## TypeScript Requirements
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for functions
- Use `z` schemas for runtime validation

## File Organization
```
packages/backend/convex/
├── functions/
│   ├── queries/     # Read operations
│   ├── mutations/   # Write operations
│   ├── actions/     # External calls
│   └── internal/    # Internal functions
├── agents/          # AI agents
├── workflows/       # Durable workflows
├── emails/          # Email templates
├── components/      # Shared utilities
├── schema.ts        # Database schema
└── http.ts          # HTTP routes & webhooks
```

## Naming Conventions
- Tables: plural, lowercase (e.g., `users`, `posts`)
- Functions: camelCase verbs (e.g., `createPost`, `getUser`)
- Components: PascalCase (e.g., `UserProfile`)
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case for components, camelCase for functions

## Performance Best Practices
- Use indexes for all query fields
- Paginate large result sets
- Cache expensive computations
- Use `ctx.scheduler` for background jobs
- Batch database operations when possible

## Security
- Always validate inputs with schemas
- Sanitize user-generated content
- Use environment variables for secrets
- Implement rate limiting for public endpoints
- Never expose internal functions to client

## Environment & Build Guarantees

- All env vars are optional; builds must succeed with none set.
- Use refined optional zod schemas for env validation.
- Provide graceful fallbacks (no-op clients, guards, disabled UI) when services are not configured.
- Emit clear guidance in logs via the diagnostics banner (see `packages/next-config/diagnostics.ts`).
