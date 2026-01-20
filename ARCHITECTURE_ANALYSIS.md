# TurboKit Architecture Analysis

## Current Pattern Analysis (Your Existing Projects)

### Projects Examined:
- `kumori-xyz` - iOS parity aesthetic
- `logs-xyz` - Brutalist/minimalist
- `next-forge` - Reference template

### Common Structure Pattern:
```
project/
├── apps/
│   └── app/               # Single product app
└── packages/
    ├── backend/           # Convex functions
    │   └── convex/
    │       ├── agents/
    │       ├── billing/
    │       ├── auth.ts
    │       ├── http.ts
    │       └── ...
    ├── design/            # Design system
    │   ├── components/
    │   ├── styles/
    │   │   └── globals.css  # CSS custom properties
    │   ├── fonts/
    │   └── hooks/
    ├── auth/
    ├── analytics/
    └── typescript-config/
```

### Key Observations:

1. **Single App Pattern** - You use ONE `apps/app` per project, not multiple apps
2. **Design Tokens** - Each project has unique `globals.css` with OKLCH colors
3. **Convex Backend** - Organized by domain (agents/, billing/, etc.)
4. **Shared Packages** - Common patterns across projects:
   - design (UI)
   - backend (Convex)
   - auth
   - typescript-config
5. **Project-Specific Packages** - Domain logic (webgl, ascii, github, etc.)

### Current Pain Point:
Starting new projects = Copy existing repo → Modify design tokens → Adjust domain packages

## Proposed TurboKit Architecture

### Option A: Three Apps (Initial Proposal)
```
turbokit/
├── apps/
│   ├── web/          # Marketing site
│   ├── kit/          # TurboKit UI (preset gallery, composer)
│   └── app/          # Clean starter
```

**Analysis:**
- ❌ Doesn't match your pattern (you use single app)
- ❌ Confusing - when do users use `kit` vs `app`?
- ❌ Adds complexity for no gain

### Option B: Embedded Tooling (RECOMMENDED)
```
turbokit/ (THE TEMPLATE)
├── apps/
│   ├── app/                    # Single app with built-in tooling
│   │   ├── /                   # User's product pages
│   │   ├── /presets            # ✨ Browse/apply registry presets
│   │   └── /admin/presets      # ✨ Manage custom presets
│   └── registry/               # Hidden backend (NOT scaffolded)
│       └── convex/             # Global preset database
└── packages/
    ├── design/                 # Design system + preset engine
    │   ├── presets/            # Preset system code
    │   └── styles/             # Base styles
    ├── backend/                # Convex template
    │   └── convex/
    │       ├── agents/         # AI agent patterns
    │       ├── billing/        # Autumn integration
    │       ├── auth.config.ts  # Clerk setup
    │       └── ...
    ├── auth/                   # Auth package
    ├── analytics/              # PostHog/Sentry
    └── ...                     # More "Lego pieces"
```

**Why This Works:**
✅ Matches your single-app pattern
✅ Preset UI embedded in main app (like admin panel)
✅ Clear separation: user code vs tooling pages
✅ Registry hidden infrastructure
✅ Scales to your vision

## The "Lego Pieces" Model

### 1. Design Presets (Registry-Backed)
```bash
# Available presets in registry:
- koto        # Your current default (warm, minimal)
- sacred      # Terminal aesthetic
- kumori      # iOS parity
- arbor       # Brutalist (to be extracted)
- logs        # Minimalist
- future...   # Community submissions
```

**Access via:**
- UI: `localhost:3000/presets` → Browse → Preview → Apply
- CLI: `npx turbokit presets apply arbor`

### 2. Backend Modules (Convex Patterns)
```typescript
// Pre-configured Convex patterns:
packages/backend/convex/
├── agents/          # AI agent setup (Convex Agent component)
├── billing/         # Autumn billing integration
├── auth.config.ts   # Clerk + Convex setup
├── uploads/         # File storage patterns
├── emails/          # Resend integration
└── workflows/       # Durable execution examples
```

**Usage:**
```bash
npx turbokit add billing  # Configures Autumn
npx turbokit add ai       # Sets up agents
```

### 3. Frontend Packages
```typescript
packages/
├── design/       # Shadcn + presets
├── analytics/    # PostHog/Sentry
├── seo/          # Next SEO
├── webgl/        # 3D graphics (optional)
├── ascii/        # ASCII art (optional)
└── github/       # GitHub API (optional)
```

## CLI Workflow

### Creating New Project:
```bash
npx turbokit create my-saas

# Scaffolds:
my-saas/
├── apps/app/           # FROM turbokit/apps/app
└── packages/           # FROM turbokit/packages/* (minus registry)
```

### Working with Presets:
```bash
cd my-saas
pnpm dev                # Opens localhost:3000

# In browser:
# → Go to /presets
# → Browse registry presets
# → Preview live
# → Apply to project
```

### CLI Commands:
```bash
npx turbokit presets list           # Show available presets
npx turbokit presets apply arbor    # Apply preset
npx turbokit presets sync           # Update from registry
npx turbokit presets create         # Start preset composer
npx turbokit add [module]           # Add backend module
```

## AI-Native Development

### Prompt-Based Composition:
```bash
npx turbokit ai "make it look like arbor.xyz"
# → Analyzes arbor
# → Extracts design tokens
# → Applies to project

npx turbokit ai "add stripe billing"
# → Configures Autumn
# → Sets up billing UI
# → Adds webhook handlers
```

### Agent-Assisted Customization:
```typescript
// Built into apps/app:
/presets → AI Assistant tab
"Make the colors warmer"
"Copy the layout from logs.xyz"
"Add glassmorphism effects"
```

## Why This is Optimal

### Matches Your Current Workflow:
- ✅ Single app structure
- ✅ Shared packages pattern
- ✅ Convex-native backend
- ✅ Design token customization

### Enables Your Vision:
- ✅ **Fast project creation** - `npx turbokit create` + preset
- ✅ **Modular composition** - Mix/match packages
- ✅ **Live style switching** - `/presets` UI
- ✅ **Registry-backed** - Central source of truth
- ✅ **AI-native** - Prompting layer on top

### Scales to "Lego" Model:
- **Design pieces** = Presets (koto, arbor, etc.)
- **Backend pieces** = Convex modules (agents, billing, etc.)
- **Frontend pieces** = Packages (analytics, seo, etc.)
- **Composition** = Pick preset + add modules + customize

## Implementation Plan

### Phase 1: Core Architecture ✅
- [x] Preset system implementation
- [x] Registry Convex deployment
- [x] Preset gallery UI (`/presets`)
- [ ] Remove apps/web, apps/kit concept
- [ ] Keep single apps/app with embedded tooling

### Phase 2: Lego Pieces
- [ ] Extract arbor preset
- [ ] Document all backend modules
- [ ] Create CLI commands for modules
- [ ] Package catalog system

### Phase 3: AI Layer
- [ ] AI preset assistant
- [ ] Screenshot → preset extraction
- [ ] Natural language preset editing
- [ ] Agent-powered composition

## Recommendation

**DO NOT create `apps/kit` as separate app.**

**Instead:**
1. Keep `apps/app` as the single product app
2. Embed tooling pages within it (`/presets`, `/admin`)
3. These pages are part of the template, users can keep or remove them
4. Registry stays hidden (`apps/registry`)
5. Focus on making packages the "Lego pieces"

This matches your actual development pattern and enables the modular composition vision without artificial complexity.
