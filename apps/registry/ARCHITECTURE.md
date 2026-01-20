# TurboKit Registry Architecture

## The Problem

TurboKit is a **template** that users clone. Each user runs `npx convex init` which creates their OWN isolated Convex deployment. But we need a **shared global preset registry** accessible to all TurboKit users.

## The Solution: Hidden Registry App

The `apps/registry` app:
- ✅ Lives in the turbokit repo (easy development)
- ✅ Has its own Convex deployment (global, shared)
- ❌ Is NOT included when users scaffold (CLI excludes it)
- ✅ Serves presets via public HTTP API

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│  TurboKit Repo (GitHub)                             │
│                                                     │
│  apps/                                              │
│  ├── app/         ✅ → Scaffolded to users          │
│  ├── docs/        ✅ → Scaffolded to users          │
│  └── registry/    ❌ → NEVER scaffolded             │
│      └── convex/  → Global registry deployment     │
└─────────────────────────────────────────────────────┘
                         │
                         │ npx turbokit create my-app
                         ↓
┌─────────────────────────────────────────────────────┐
│  User's Project                                     │
│                                                     │
│  apps/app/        ← User's main app                 │
│  apps/docs/       ← User's docs                     │
│  packages/        ← Shared packages                 │
│                                                     │
│  User runs: npx convex init                         │
│  Gets: their-app.convex.cloud (isolated)            │
└─────────────────────────────────────────────────────┘
                         │
                         │ HTTP fetch
                         ↓
┌─────────────────────────────────────────────────────┐
│  Global TurboKit Registry                           │
│                                                     │
│  URL: https://registry.turbokit.dev                 │
│  Convex: turbokit-registry.convex.cloud             │
│                                                     │
│  Stores: All public/verified presets                │
│  Serves: HTTP API (read-only for users)             │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### User Browses Presets

```typescript
// In user's app (apps/app/src/app/presets/page.tsx)

// 1. Load local built-in presets (always available)
const localPresets = loadLocalPresets() // From .turbokit/presets/*.json

// 2. Fetch from global registry
const registryPresets = await fetch(
  'https://registry.turbokit.dev/api/presets?filter=verified'
).then(r => r.json())

// 3. Load user's custom presets (if Convex initialized)
const customPresets = useQuery(api.presets.queries.list)

// 4. Merge all sources
const allPresets = [...localPresets, ...registryPresets, ...customPresets]
```

### User Applies Preset

```typescript
// User clicks "Apply" on a preset from registry

// 1. Fetch full preset JSON
const preset = await fetch(
  `https://registry.turbokit.dev/api/presets/koto`
).then(r => r.json())

// 2. Apply to app (CSS injection)
applyPreset(preset)

// 3. Optionally save to user's Convex (if they want to customize it)
await saveMutation({ presetId: 'koto', ...preset })
```

## CLI Scaffolding Logic

The TurboKit CLI needs to exclude `apps/registry` when scaffolding:

```typescript
// packages/cli/src/scaffold.ts (pseudocode)

const SCAFFOLD_APPS = ['app', 'docs'] // Explicitly list what to copy
const SCAFFOLD_PACKAGES = [
  'backend',
  'design',
  'analytics',
  // ... all except registry-specific packages
]

function scaffoldProject(targetDir: string) {
  // Copy only specified apps
  for (const app of SCAFFOLD_APPS) {
    copyDir(`apps/${app}`, `${targetDir}/apps/${app}`)
  }

  // Copy only specified packages
  for (const pkg of SCAFFOLD_PACKAGES) {
    copyDir(`packages/${pkg}`, `${targetDir}/packages/${pkg}`)
  }

  // apps/registry is never copied!
}
```

## Development Workflow

### For TurboKit Maintainers

```bash
# Main template development
pnpm dev                    # Runs app + docs

# Registry development (separate)
cd apps/registry
pnpm dev                    # Next.js on port 3100
npx convex dev              # Convex backend

# Deploy registry
npx convex deploy --prod    # Deploy Convex
vercel --prod               # Deploy Next.js
```

### For TurboKit Users

```bash
# User scaffolds project
npx turbokit create my-app
cd my-app

# Gets: apps/app, apps/docs, packages/*
# Does NOT get: apps/registry

# User initializes their own Convex
npx convex init             # Creates their-app.convex.cloud

# User's app fetches presets from registry
pnpm dev                    # Automatically fetches from registry.turbokit.dev
```

## Security & Access Control

### Registry (Global)
- **Public HTTP API** - Read-only
- **CORS enabled** - Allow all TurboKit apps
- **Rate limiting** - Prevent abuse
- **No authentication** - Public preset browsing

### User's Convex (Private)
- **User-specific data** - Their custom presets
- **Authentication required** - Clerk integration
- **Full CRUD** - Users can create/edit/delete their presets

## Preset Sources Priority

Users see presets from 3 sources (in order):

1. **Local Built-in** (highest priority)
   - Always available (no network required)
   - Ships with template
   - Can't be deleted

2. **Global Registry**
   - Fetched via HTTP
   - Cached locally
   - Read-only for users

3. **User's Custom**
   - Stored in their Convex
   - Full control (CRUD)
   - Private by default

## Deployment URLs

### Production
- Registry UI: `https://registry.turbokit.dev`
- Registry API: `https://registry.turbokit.dev/api/presets`
- Convex: `https://turbokit-registry.convex.cloud`

### Development
- Registry UI: `http://localhost:3100`
- Convex: Local dev deployment

## Environment Variables

### Registry App (.env.local)
```bash
# Convex deployment
CONVEX_DEPLOYMENT=prod:turbokit-registry-xxx
NEXT_PUBLIC_CONVEX_URL=https://turbokit-registry.convex.cloud
```

### User's App (NOT needed)
```bash
# Users don't need registry credentials!
# They just fetch via HTTP from public API

# Only their own Convex
NEXT_PUBLIC_CONVEX_URL=https://their-app.convex.cloud
```

## Benefits of This Architecture

✅ **Simple for users** - Just HTTP fetch, no extra Convex connection
✅ **Centralized registry** - One source of truth for public presets
✅ **Easy development** - All code in one repo
✅ **Clean separation** - Registry never scaffolded to users
✅ **Scalable** - Can add authentication, submissions, etc. later
✅ **Offline-first** - Local presets work without network
✅ **No vendor lock-in** - Users can ignore registry and use local presets only

## Future Enhancements

- [ ] Community preset submissions (with approval workflow)
- [ ] Preset ratings & reviews
- [ ] Search & filtering UI
- [ ] Preset collections (curated themes)
- [ ] Analytics dashboard (download stats, popular presets)
- [ ] Automated validation (ensure presets work)
- [ ] Version management (preset upgrades)
- [ ] CDN caching (faster delivery)
