# Design Icons – Adapter Architecture

This package provides a library‑independent Icon component that switches icon packs dynamically. It gives you:

- A single Icon API for apps and components
- Runtime selection of the active icon pack via IconProvider
- A small registry API to register custom packs (no app code changes)
- Strong typing with IconNames to avoid magic strings

## Quick Start

1) Wrap your app once

```tsx
// e.g. apps/app/src/app/layout.tsx
import { IconProvider } from '@repo/design/icons'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <IconProvider settings={{ pack: 'phosphor', weight: 'duotone' }}>
      {children}
    </IconProvider>
  )
}
```

2) Use icons anywhere

```tsx
import { Icon, IconNames } from '@repo/design/icons'

<Icon name={IconNames.ChevronRight} className="h-4 w-4" />
```

Switch to Streamline plump style globally:

```tsx
<IconProvider settings={{ pack: 'streamline' }}>{children}</IconProvider>
```

## Packages and Files

- `icons/context.tsx`: IconProvider and useIconSettings. Controls the active pack and optional weight (for Phosphor).
- `icons/names.ts`: Central list of supported icon names as `IconNames` + type `IconName` (prevents magic strings).
- `icons/registry.tsx`: Pack registry + helpers (`registerIconPack`, `getIconRenderer`).
- `icons/packs/phosphor.tsx`: Phosphor renderer (uses `@phosphor-icons/react`).
- `icons/packs/streamline-plump.tsx`: Streamline‑style renderer (inline SVGs for a curated set).
- `icons/index.tsx`: Public API (Icon, IconProvider, IconNames, registerIconPack).

## Add/Extend a Pack

Register custom packs at runtime, e.g. adding a bespoke Streamline wrapper or any other icon set.

```tsx
import { registerIconPack, IconNames, type IconName } from '@repo/design/icons'

registerIconPack('my-pack', ({ name, className }) => {
  switch (name as IconName) {
    case IconNames.X:
      return <svg className={className} /* ... */ />
    case IconNames.Check:
      return <svg className={className} /* ... */ />
    default:
      return null
  }
})
```

Then opt‑in globally:

```tsx
<IconProvider settings={{ pack: 'my-pack' }}>{children}</IconProvider>
```

Notes:
- Phosphor pack supports `weight` (thin/light/regular/bold/fill/duotone). Other packs can ignore or implement as desired.
- If a pack is not found, the system falls back to Phosphor.

## Add New Icon Names

To add a new icon name:

1) Add the constant in `icons/names.ts` (e.g., `Star: "star"`).
2) Implement rendering for each pack you want to support:
   - `icons/packs/phosphor.tsx`: map `"star"` to the corresponding Phosphor component
   - `icons/packs/streamline-plump.tsx`: add inline SVG for the same name

All consumers can now use `IconNames.Star` without changing call sites.

## Migrating Existing Components

Replace direct imports from icon libs with the adapter:

```tsx
// Before (example with a third-party icon lib)
import { ChevronDownIcon } from 'example-icon-lib'
<ChevronDownIcon className="size-4" />

// After
import { Icon, IconNames } from '@repo/design/icons'
<Icon name={IconNames.ChevronDown} className="size-4" />
```

## Phosphor vs. Streamline

- Phosphor: excellent React support, multiple weights, broad coverage. Default pack.
- Streamline Plump (free): inline SVGs emulate a rounder aesthetic. Extend as needed.

For a plumper look with Phosphor, set `weight: 'duotone'` or `weight: 'bold'` in IconProvider.

## Best Practices

- Always use `IconNames` instead of magic strings.
- Switch packs globally with `IconProvider` for consistent look & feel.
- Register new packs via `registerIconPack` to avoid touching component call sites.
- Keep packs cohesive: if introducing a new icon name, add it to all packs you intend to support.

## Troubleshooting

- Missing icons in a custom pack: the renderer can return `null`; the UI should still render without crashing.
- If you want a fallback icon per name, implement it inside the pack renderer.
