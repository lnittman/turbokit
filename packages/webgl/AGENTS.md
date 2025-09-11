@repo/webgl — Client-side Unicorn JSON helper

Purpose
- Minimal, client-only API to embed Unicorn Studio JSON scenes in `apps/*`.
- Project-agnostic: this package does NOT bundle or serve JSON assets.
- One small hook returns everything UnicornScene needs (json + perf).

What this package is
- Hooks first, no server code. Also includes an optional client component wrapper.
- Aligned with Unicorn Studio SDK embed patterns (Context7 docs).

What this package is NOT
- It doesn’t host JSON (Next serves only from app `public/`).
- It doesn’t theme scenes. Export transparent-background scenes from Unicorn.

API
- Hook: `useUnicornJson({ jsonPath, version?, scale?, dpi?, fps?, lazyLoad?, keyPrefix? })`
  - Returns `{ key, jsonFilePath, scale, dpi, fps, lazyLoad }` with auto-tuned perf defaults.
  - Pass `jsonPath` as an absolute path under the app’s `public/` (e.g., `/webgl/scene.json`).
- Component: `UnicornViewport(props)`
  - Source: one of `{ jsonPath }` (self-hosted JSON) or `{ projectId }` (CDN embed id)
  - Perf/behavior: `{ scale?, dpi?, fps?, lazyLoad?, production?, fixed?, interactivity? }`
  - SDK: `{ sdkVersion? = '1.4.30', sdkSrc?, cspNonce?, respectReducedMotion? = true }`
  - Accessibility: `{ altText?, ariaLabel? }`
  - Lifecycle: `{ onReady?(scene) }` (scene exposes `destroy()`, `resize()`, `paused`)
  - Automatically cleans up only its own scene, observes container resizes, and pauses when tab is hidden.

Utils
- `jsonPath(nameOrPath, { base = '/webgl', ensureExt = true })` → normalized absolute path to JSON
- `withVersion(url, version)` → appends/sets `?v=` cache-buster
- `withCdnUpdate(projectId, update)` → appends/sets `?update=` for CDN cache-busting
- `joinPath(...parts)` → safe path joining without duplicate slashes
- `getPerfDefaults()` → returns `{ scale, dpi, fps }` heuristics used by the hook

Usage (Next.js App Router)
### Option A — Hook + unicornstudio-react
```
'use client'
import UnicornScene from 'unicornstudio-react/next'
import { useUnicornJson } from '@repo/webgl'

export default function Scene() {
  const scene = useUnicornJson({
    jsonPath: '/webgl/scene.json',
    version: 1,         // optional cache-busting
    keyPrefix: 'hero',  // optional if multiple scenes on a page
  })

  return (
    <UnicornScene
      key={scene.key}
      jsonFilePath={scene.jsonFilePath}
      width="100%"
      height="100%"
      scale={scene.scale}
      dpi={scene.dpi}
      fps={scene.fps}
      lazyLoad={scene.lazyLoad}
      altText="WebGL Scene"
      ariaLabel="WebGL Scene"
    />
  )
}
```

### Option B — Viewport component
```
'use client'
import { UnicornViewport } from '@repo/webgl'

export default function Scene() {
  return (
    <UnicornViewport
      jsonPath="/webgl/scene.json"
      version={1}
      width="100%"
      height="100%"
      className="w-full h-full"
      altText="WebGL Scene"
      ariaLabel="WebGL Scene"
    />
  )
}
```

Asset Placement
- Place Unicorn JSON in the app’s `public/` directory (recommended `apps/<app>/public/webgl/…`).
- Reference them with absolute paths (`/webgl/…`).
- Export scenes with transparent background in Unicorn Studio to avoid theme hacks.

Best Practices (2025)
- Follow Unicorn’s embed interface (Context7 /georgehastings/embed-unicornstudio):
  - Use either `projectId` or a JSON `filePath` (this package expects the JSON path).
  - Keep `lazyLoad: true` for offscreen scenes.
  - Clean up via `scene.destroy()` when unmounting (handled by unicornstudio-react component internally).
- Transparency & composition:
  - Prefer authoring the scene with transparent background in Unicorn Studio.
  - Avoid DOM/CSS hacks for canvas transparency; rely on exported transparency.
- Performance:
  - Auto heuristics set `{ scale, dpi, fps }` by device memory and pointer type.
  - Override per scene if you need stricter limits.
- Hosting:
  - If you self-host JSON, remember to re-export/re-upload when scenes change.
  - Prefer predictable paths via `jsonPath('hero')` → `/webgl/hero.json` and `withVersion` for cache busting.
  - For CDN projectId embeds, use `withCdnUpdate(id, '1.0.1')` to invalidate cache without changing code.

Dependencies
- Peer: `react`, `unicornstudio-react`.
- App uses Next.js App Router and hosts JSON under `public/`.

Types
- Scene instances expose: `destroy()`, `resize()`, and `paused`.
- Exported types: `UnicornSceneInstance`, `UnicornSDK`, `UnicornAddSceneOptions`, `UnicornInteractivity`.

Changelog
- v0.1.0: Single-hook API `useUnicornJson` (perf + json path). Optional `UnicornViewport` component.

Scope: packages/webgl/**
AI Authors: Use this AGENTS.md as the single source of truth for this package. CLAUDE.md mirrors it for tool compatibility.
