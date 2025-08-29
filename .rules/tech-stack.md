# turbokit tech stack rules

these rules define the default technology stack and architecture patterns for all turbokit-generated projects. they ensure consistency across all projects while allowing flexibility where needed.

## monorepo structure

### repository organization
```
[product]-xyz/              # turborepo monorepo
├── apps/
│   ├── app/               # next.js web application (rsc-first)
│   ├── api/               # cloudflare worker (optional)
│   ├── mastra/            # ai service (mastra cloud)
│   └── docs/              # documentation (mintlify)
├── packages/
│   ├── auth/              # clerk authentication wrapper
│   ├── database/          # drizzle + drizzle-zod schemas
│   ├── design/            # ui components (radix + shadcn)
│   ├── orpc/              # type-safe rpc layer
│   ├── services/          # business logic layer
│   ├── mastra/            # mastra client wrapper
│   └── typescript-config/ # shared typescript configs
```

### key principles
- **no packages/api** - use packages/orpc + packages/services instead
- **services own database** - only services package talks to database
- **rsc-first** - server components fetch data, pass props to client
- **type safety** - drizzle-zod generates types from schemas

## technology choices

### core stack
```yaml
runtime: node.js 20+
package_manager: pnpm
build_system: turborepo
framework: next.js 15+ (app router)
language: typescript (strict mode)
```

### frontend stack
```yaml
ui_framework: react 19+
rendering: rsc (react server components)
styling: tailwind css v4
components: radix ui + shadcn/ui
state_management:
  server_state: swr (with rsc hydration)
  ui_state: jotai
routing: next.js app router
```

### backend stack
```yaml
api_layer: orpc (zod-typed procedures)
edge_api: cloudflare workers + hono
business_logic: packages/services
database:
  orm: drizzle
  validation: drizzle-zod
  client: single instance in packages/database
authentication: clerk
```

### ai/ml stack
```yaml
framework: mastra
deployment: mastra cloud
structure:
  agents: src/mastra/agents/
  tools: src/mastra/tools/
  workflows: src/mastra/workflows/
  lib: src/mastra/lib/
memory: "@mastra/pg" (postgresql + pgvector)
model_loading: lazy getModel() factory
```

### infrastructure
```yaml
hosting:
  web: vercel
  api: cloudflare workers
  ai: mastra cloud
  database: neon/supabase (postgresql)
monitoring: posthog + sentry
ci_cd: github actions
```

## data flow patterns

### web application flow
```
1. user interaction → client component
2. client component → swr hook
3. swr → orpc client (type-safe)
4. orpc → service layer
5. service → database (via drizzle)
6. response flows back through layers
```

### rsc data flow
```
1. server component → orpc server
2. orpc → service layer  
3. service → database
4. server component → props to client
5. client hydrates with swr fallbackData
```

### api endpoint flow (cloudflare workers)
```
1. external request → hono route
2. route handler → validate input
3. handler → service layer
4. service → business logic + database
5. response with proper headers/status
```

## architectural patterns

### service layer rules
```typescript
// packages/services/[domain].service.ts
export class DomainService {
  constructor(private db: DatabaseClient) {}
  
  // all database operations here
  // business logic encapsulated
  // returns plain objects/primitives
  // handles transactions
}
```

### orpc patterns
```typescript
// packages/orpc/[domain].router.ts
export const domainRouter = orpc
  .input(z.object({ /* zod schema */ }))
  .output(z.object({ /* zod schema */ }))
  .mutation(async ({ input, ctx }) => {
    // only delegates to services
    // no business logic here
    return ctx.services.domain.operation(input)
  })
```

### database patterns
```typescript
// packages/database/schema/[domain].ts
export const domainTable = table('domain', {
  id: text('id').primaryKey(),
  // fields
})

// packages/database/types/[domain].ts
export const domainSchema = createSelectSchema(domainTable)
export type Domain = z.infer<typeof domainSchema>
```

## state management rules

### server state (swr)
```typescript
// apps/app/src/hooks/use-[resource].ts
export function useResource(id: string) {
  return useSWR(
    ['resource', id],
    () => orpc.resource.get({ id }),
    {
      fallbackData: initialData, // from rsc
      revalidateOnFocus: false,
    }
  )
}
```

### ui state (jotai)
```typescript
// apps/app/src/atoms/[feature].ts
export const modalOpenAtom = atom(false)
export const selectedItemAtom = atom<string | null>(null)

// usage in components
const [isOpen, setIsOpen] = useAtom(modalOpenAtom)
```

## file organization

### feature-based structure
```
apps/app/src/
├── app/                    # routes
│   ├── (authenticated)/
│   └── (unauthenticated)/
├── components/
│   ├── features/          # feature-specific
│   └── ui/                # shared ui
├── hooks/                 # swr hooks
├── atoms/                 # jotai atoms
└── lib/                   # utilities
```

### service organization
```
packages/services/
├── chat/
│   ├── chat.service.ts
│   ├── chat.types.ts
│   └── chat.test.ts
├── project/
│   ├── project.service.ts
│   ├── project.types.ts
│   └── project.test.ts
└── index.ts               # barrel export
```

## documentation requirements

### required documentation files
```
[project]-xyz/
├── CLAUDE.md              # ai codebase map
├── AGENTS.md              # multi-agent coordination
├── apps/
│   ├── app/CLAUDE.md     # app-specific guide
│   ├── mastra/
│   │   └── src/mastra/
│   │       └── agents/AGENTS.md
│   └── docs/             # mintlify documentation
└── packages/
    ├── services/CLAUDE.md
    ├── orpc/CLAUDE.md
    └── database/CLAUDE.md
```

### agent documentation format
```xml
<agent>
  <purpose>clear description of agent role</purpose>
  <capabilities>
    <capability>specific task 1</capability>
    <capability>specific task 2</capability>
  </capabilities>
  <methodology>
    <step>step-by-step approach</step>
  </methodology>
  <guidelines>
    <guideline>important rule</guideline>
  </guidelines>
  <response_examples>
    <example>sample interaction</example>
  </response_examples>
</agent>
```

## naming conventions

### imports
```typescript
// always use @repo/* scope
import { Button } from '@repo/design'
import { userService } from '@repo/services'
import { api } from '@repo/orpc/client'
```

### file naming
```
kebab-case.ts              # files
PascalCase.tsx             # react components
[feature].service.ts       # services
[feature].router.ts        # orpc routers
[table].schema.ts          # database schemas
```

## testing requirements

### test coverage targets
- services: 80% minimum
- orpc procedures: 70% minimum  
- critical paths: 100%
- ui components: 60% minimum

### test organization
```
__tests__/                 # adjacent to code
├── unit/                  # isolated tests
├── integration/           # cross-boundary
└── e2e/                   # user flows
```

## deployment configuration

### environment variables
```env
# authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# database
DATABASE_URL=postgresql://

# cloudflare (if using workers)
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=

# monitoring
POSTHOG_KEY=
SENTRY_DSN=

# ai/ml
MASTRA_API_KEY=
OPENAI_API_KEY=
```

### build scripts
```json
{
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "db:push": "pnpm -F database push",
    "db:generate": "pnpm -F database generate"
  }
}
```

## migration notes

when auditing existing projects:
- remove packages/api if present
- add packages/orpc and packages/services
- ensure services are only database consumers
- migrate api routes to cloudflare workers where needed
- verify rsc → orpc → services → database flow
- update documentation to match patterns

---

*these rules define the default turbokit tech stack. they can be overridden per project but should be followed unless there's a specific reason to deviate.*