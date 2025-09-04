# TurboKit Design System Components Guide

This document provides comprehensive instructions for AI agents to work with TurboKit's multi-library component system.

## Component Library Architecture

```
packages/design/components/
├── ui/           # shadcn/ui base components (already present)
├── motion/       # Motion-primitives animated components
├── kibo/         # Kibo UI advanced components
├── apps/         # Shared app-specific components
└── index.ts      # Central export point
```

## Library Integration Strategy

### 1. shadcn/ui (Base Layer)
- **Purpose**: Core primitives and building blocks
- **Location**: `components/ui/`
- **Examples**: Button, Card, Dialog, Input
- **Usage**: Direct imports, foundational for all other libraries

### 2. Motion Primitives
- **Purpose**: Animated, interactive components
- **Location**: `components/motion/`
- **Key Components**:
  - Accordion (collapsible sections)
  - Carousel (image/content slider)
  - InfiniteSlider (continuous scroll)
  - TextEffects (scramble, shimmer, morph)
  - TransitionPanel (smooth transitions)
  - Dock (macOS-style dock)
  - Spotlight (focus effects)

### 3. Kibo UI
- **Purpose**: Complex, application-ready components
- **Location**: `components/kibo/`
- **Key Components**:
  - ColorPicker (Figma-style)
  - CodeBlock (syntax highlighting)
  - Dropzone (file upload)
  - QRCode (generation)
  - Gantt (project timeline)
  - Kanban (board view)
  - Marquee (scrolling content)
  - ImageZoom (magnification)

## Component Implementation Patterns

### Motion Primitives Pattern
```tsx
// components/motion/[component].tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@repo/design/lib/utils';

export function MotionComponent({ 
  className,
  children,
  ...props 
}: ComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('base-styles', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### Kibo UI Pattern
```tsx
// components/kibo/[component].tsx
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@repo/design/lib/utils';
// Use shadcn primitives as base
import { Card, Button } from '../ui';

export function KiboComponent({ 
  className,
  ...props 
}: ComponentProps) {
  const [state, setState] = useState();
  
  return (
    <Card className={cn('kibo-component', className)}>
      {/* Complex functionality here */}
    </Card>
  );
}
```

## Adding New Components

### From Motion Primitives
1. Check documentation at motion-primitives.com
2. Install if needed: `pnpm add framer-motion`
3. Create in `components/motion/[name].tsx`
4. Export from `components/motion/index.ts`
5. Add to main `components/index.ts`

### From Kibo UI
1. Check documentation at kiboui.com
2. Install dependencies as needed
3. Create in `components/kibo/[name].tsx`
4. Export from `components/kibo/index.ts`
5. Add to main `components/index.ts`

## Component Categories

### Animation Components (Motion)
- **Text Animations**: TextScramble, TextShimmer, TextMorph
- **Layout Animations**: TransitionPanel, AnimatedGroup
- **Interactive**: Magnetic, Tilt, Cursor
- **Visual Effects**: BorderTrail, GlowEffect, ProgressiveBlur

### Data Components (Kibo)
- **Visualization**: Gantt, Kanban, Timeline
- **Input**: ColorPicker, Dropzone, Editor
- **Display**: CodeBlock, ImageComparison, QRCode
- **Feedback**: Marquee, AnimatedNumber

### Hybrid Components
Some components combine both libraries:
```tsx
// Using motion for Kibo components
import { motion } from 'framer-motion';
import { ColorPicker as BaseColorPicker } from './base';

export function AnimatedColorPicker(props) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <BaseColorPicker {...props} />
    </motion.div>
  );
}
```

## Usage in Apps

### In apps/app (Main Application)
```tsx
import { 
  // Base UI
  Button, Card,
  // Motion components
  TextScramble, Dock,
  // Kibo components
  ColorPicker, Kanban
} from '@repo/design/components';
```


## Component Documentation Structure

Each component library folder should have:
```
components/[library]/
├── README.md           # Library overview
├── CLAUDE.md          # AI instructions
├── index.ts           # Exports
└── [component].tsx    # Component files
```

## Testing Components

### Visual Testing
```tsx
// Create a story file for each component
// components/motion/accordion.stories.tsx
export default {
  title: 'Motion/Accordion',
  component: Accordion,
};

export const Default = () => <Accordion {...defaultProps} />;
export const CustomAnimation = () => <Accordion {...animatedProps} />;
```

### Integration Testing
```tsx
// Ensure components work with Convex
import { useQuery } from 'convex/react';

function DataDrivenComponent() {
  const data = useQuery(api.functions.queries.getData);
  return <KiboGantt tasks={data} />;
}
```

## Performance Considerations

### Motion Components
- Use `lazy` imports for heavy animations
- Disable animations on `prefers-reduced-motion`
- Optimize with `will-change` CSS property

### Kibo Components
- Virtualize long lists (Gantt, Kanban)
- Lazy load heavy dependencies (QRCode, CodeBlock)
- Use React.memo for expensive renders

## Accessibility

### Motion Components
```tsx
// Always respect user preferences
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<motion.div
  animate={prefersReducedMotion ? {} : { x: 100 }}
/>
```

### Kibo Components
```tsx
// Ensure keyboard navigation
<ColorPicker
  aria-label="Choose color"
  onKeyDown={handleKeyboard}
/>
```

## Common Patterns

### Composition Pattern
```tsx
// Combine multiple libraries
export function SuperComponent() {
  return (
    <Card> {/* shadcn */}
      <motion.div> {/* framer-motion */}
        <ColorPicker /> {/* kibo */}
      </motion.div>
    </Card>
  );
}
```

### Wrapper Pattern
```tsx
// Enhance existing components
export function EnhancedButton(props) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button {...props} />
    </motion.div>
  );
}
```

## Quick Reference

### Most Used Motion Components
1. Accordion - Collapsible content
2. TextScramble - Typewriter effect
3. InfiniteSlider - Auto-scrolling content
4. TransitionPanel - Page transitions
5. Dock - Navigation dock

### Most Used Kibo Components
1. ColorPicker - Color selection
2. Dropzone - File uploads
3. CodeBlock - Code display
4. Kanban - Task boards
5. QRCode - QR generation

## AI Agent Instructions

When asked to add a component:
1. Check if it exists in shadcn/ui first
2. Look for motion-primitives version for animations
3. Consider kibo-ui for complex functionality
4. Combine libraries when beneficial
5. Always maintain consistent patterns
6. Export from central index
7. Document usage in CLAUDE.md

When modifying components:
1. Preserve existing API
2. Maintain TypeScript types
3. Keep accessibility features
4. Test with both themes (light/dark)
5. Ensure Tailwind classes work
6. Update documentation

## Resources

- shadcn/ui: https://ui.shadcn.com
- Motion Primitives: https://motion-primitives.com
- Kibo UI: https://kiboui.com
- Framer Motion: https://www.framer.com/motion
- TurboKit Docs: Internal documentation