# TurboKit Global Registry

> **⚠️ IMPORTANT**: This app is NOT included in the TurboKit template scaffold.
> It stays in the turbokit repo only and serves as the global preset registry.

## Purpose

This is the centralized preset registry that all TurboKit users access to browse and download design presets. When users run `npx turbokit create`, they do NOT get this code - it stays in the repo only.

## Architecture

```
┌──────────────────────────────────────────────┐
│  User's TurboKit App                         │
│  ├── Own Convex deployment (their data)      │
│  └── Fetches presets from registry via HTTP  │
└──────────────────────────────────────────────┘
                    ↓ HTTP
┌──────────────────────────────────────────────┐
│  TurboKit Registry (this app)                │
│  ├── Convex: turbokit-registry.convex.cloud  │
│  ├── API: https://registry.turbokit.dev      │
│  └── Stores all public/verified presets      │
└──────────────────────────────────────────────┘
```

## Development

```bash
# Install dependencies
pnpm install

# Initialize Convex (first time only)
cd apps/registry
npx convex init

# Start dev server
pnpm dev              # Next.js on port 3100
npx convex dev        # Convex backend
```

## Seeding Built-in Presets

After initializing Convex:

1. Open Convex dashboard
2. Go to Functions
3. Run `internal.registry.seedBuiltinPresets()`
4. Verify presets in Data → presets table

## API Endpoints

### GET /api/presets

List all public presets.

**Query Parameters:**
- `filter` - Filter presets: `all` (default), `builtin`, `verified`

**Example:**
```bash
curl https://registry.turbokit.dev/api/presets?filter=builtin
```

### GET /api/presets/:id

Get a single preset by ID. Automatically tracks download.

**Example:**
```bash
curl https://registry.turbokit.dev/api/presets/koto
```

### GET /api/stats

Get registry statistics.

**Example:**
```bash
curl https://registry.turbokit.dev/api/stats
```

## Deployment

```bash
# Deploy Convex backend
npx convex deploy --prod

# Deploy Next.js app (Vercel recommended)
vercel --prod
```

## Environment Variables

Create `.env.local`:

```bash
# Convex deployment URL (from convex dashboard)
CONVEX_DEPLOYMENT=prod:turbokit-registry-xxx
NEXT_PUBLIC_CONVEX_URL=https://turbokit-registry.convex.cloud
```

## Excluding from Template

The TurboKit CLI (`npx turbokit create`) is configured to exclude this app from scaffolding. Only `apps/app` and `apps/docs` are copied to users.

## Built-in Presets

The registry seeds three official TurboKit presets:

1. **koto** - Default preset (iOS-inspired, warm, minimal)
2. **sacred** - Terminal aesthetic (17 monospace fonts, OKLCH tinting)
3. **kumori** - iOS parity (exact iOS colors, glassmorphism)

## Future Features

- [ ] Community preset submissions
- [ ] Preset ratings & reviews
- [ ] Search & filtering UI
- [ ] Preset preview generation
- [ ] Usage analytics dashboard
- [ ] Automated preset validation
- [ ] Version management
- [ ] Preset collections/themes
