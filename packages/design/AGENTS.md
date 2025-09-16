# Design Package - AI Agent Instructions

## Overview
This package provides TurboKit's design system with a token-first architecture, comprehensive component library, and dynamic icon system. It uses Tailwind CSS v4, OKLCH color space, and supports multiple aesthetic modes through CSS custom properties.

## Quick Start Checklist
- [ ] Import global styles in app layout
- [ ] Wrap app with IconProvider for icon system
- [ ] Configure theme provider for dark mode
- [ ] Review design tokens in globals.css
- [ ] Understand component organization structure
- [ ] Set up proper font loading

## Architecture Philosophy

### Token-First Design
All visual properties flow from CSS custom properties (design tokens) rather than hardcoded values. This enables:
- Global aesthetic changes without component modifications
- Consistent theming across all apps
- Easy dark mode implementation
- Predictable color manipulation with OKLCH

### Component Organization
```
packages/design/
├── components/
│   ├── ui/              # shadcn/ui components (60+ components)
│   ├── motion/          # Animation components
│   ├── kibo/            # Advanced UI components
│   ├── search/          # Search components
│   └── navigation/      # Navigation patterns
├── icons/               # Dynamic icon system
│   ├── packs/           # Icon pack implementations
│   └── registry.tsx     # Pack management
├── styles/
│   ├── globals.css      # Design tokens & CSS variables
│   └── cmdk.css         # Command palette styles
├── lib/
│   ├── utils.ts         # cn() utility & helpers
│   └── fonts.ts         # Font configuration
├── providers/
│   └── theme.tsx        # Theme provider
└── hooks/               # Utility hooks
```

## Design Token System

### OKLCH Color Space
OKLCH provides perceptually uniform color manipulation.

Format: `oklch(Lightness Chroma Hue)`
- **L**: 0-1 (0 = black, 1 = white)
- **C**: 0-0.4 (0 = grayscale, higher = more saturated)
- **H**: 0-360 (color wheel degrees)

### Core Tokens (CSS Variables)
```css
:root {
  /* Core Palette */
  --background: oklch(0.98 0.005 85);      /* Page background */
  --foreground: oklch(0.2 0.01 85);        /* Default text */
  --card: oklch(1 0.005 85);               /* Card backgrounds */
  --card-foreground: oklch(0.2 0.01 85);   /* Card text */

  /* Interactive States */
  --primary: oklch(0.22 0.01 85);          /* Primary actions */
  --primary-foreground: oklch(0.97 0.005 85);
  --secondary: oklch(0.94 0.01 85);        /* Secondary actions */
  --secondary-foreground: oklch(0.22 0.01 85);

  /* Semantic Colors */
  --destructive: oklch(0.577 0.08 27.325); /* Errors/danger */
  --muted: oklch(0.94 0.01 85);            /* Muted backgrounds */
  --accent: oklch(0.9 0.02 85);            /* Accent surfaces */

  /* UI Elements */
  --border: oklch(0.9 0.01 85);            /* Borders */
  --input: oklch(0.94 0.01 85);            /* Input borders */
  --ring: oklch(0.7 0.01 85);              /* Focus rings */

  /* Layout */
  --radius: 0.5rem;                        /* Border radius */

  /* Sidebar Tokens */
  --sidebar: oklch(0.97 0.005 85);
  --sidebar-foreground: oklch(0.2 0.01 85);
  --sidebar-primary: oklch(0.22 0.01 85);
  --sidebar-accent: oklch(0.94 0.01 85);
  --sidebar-border: oklch(0.9 0.01 85);

  /* Chart Colors */
  --chart-1: oklch(0.646 0.09 41.116);
  --chart-2: oklch(0.6 0.06 184.704);
  --chart-3: oklch(0.55 0.05 227.392);
  --chart-4: oklch(0.7 0.08 84.429);
  --chart-5: oklch(0.75 0.07 70.08);
}
```

### Dark Mode
```css
.dark {
  --background: oklch(0.2 0.02 240);      /* Cool dark */
  --foreground: oklch(0.94 0.01 60);      /* Warm white */
  /* All tokens automatically invert */
}
```

## Component Libraries

### shadcn/ui Components
Primary component library with 60+ components:
- Form components (input, select, checkbox, radio, etc.)
- Layout components (card, dialog, sheet, drawer)
- Navigation (tabs, menu, breadcrumb, sidebar)
- Data display (table, chart, badge, avatar)
- Feedback (toast, alert, progress, skeleton)

All components follow the same pattern:
```typescript
import { Button } from '@repo/design/components/ui/button'

// Uses design tokens automatically
<Button variant="primary" size="default">
  Click me
</Button>
```

### Motion Components
Animation-enhanced components from motion-primitives:
```typescript
import { Accordion } from '@repo/design/components/motion'

// Smooth animated accordion
<Accordion items={items} />
```

### Kibo Components
Advanced UI components:
- ColorPicker - Full-featured color selection
- Dropzone - File upload with drag & drop

### Search Components
- GlobalSearch - Command palette with cmdk

### Navigation Components
- TabUnderline - Underlined tab navigation pattern

## Icon System

### Architecture
Dynamic icon adapter that switches icon packs at runtime without changing component code.

### Setup
```typescript
// apps/app/src/app/layout.tsx
import { IconProvider } from '@repo/design/icons'

export default function RootLayout({ children }) {
  return (
    <IconProvider settings={{ pack: 'phosphor', weight: 'duotone' }}>
      {children}
    </IconProvider>
  )
}
```

### Usage
```typescript
import { Icon, IconNames } from '@repo/design/icons'

// Type-safe icon names
<Icon name={IconNames.ChevronRight} className="h-4 w-4" />
<Icon name={IconNames.User} className="h-5 w-5" />
<Icon name={IconNames.Settings} className="h-6 w-6" />
```

### Available Packs
1. **Phosphor** (default) - 6 weights: thin, light, regular, bold, fill, duotone
2. **Streamline Plump** - Rounded aesthetic with inline SVGs

### Adding Custom Icon Packs
```typescript
import { registerIconPack, IconNames } from '@repo/design/icons'

registerIconPack('custom-pack', ({ name, className }) => {
  switch (name) {
    case IconNames.X:
      return <CustomXIcon className={className} />
    case IconNames.Check:
      return <CustomCheckIcon className={className} />
    default:
      return null
  }
})

// Use globally
<IconProvider settings={{ pack: 'custom-pack' }}>
```

### Adding New Icons
1. Add to `icons/names.ts`:
```typescript
export const IconNames = {
  // Existing icons...
  NewIcon: "new-icon" as const,
} as const
```

2. Implement in each pack:
```typescript
// icons/packs/phosphor.tsx
case IconNames.NewIcon:
  return <PhosphorNewIcon weight={weight} className={className} />

// icons/packs/streamline-plump.tsx
case IconNames.NewIcon:
  return <svg className={className}>...</svg>
```

## Styling Patterns

### Using the cn() Utility
```typescript
import { cn } from '@repo/design/lib/utils'

// Merge classes with proper precedence
<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className // User overrides
)} />
```

### Variant Pattern with CVA
```typescript
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        destructive: "destructive-classes",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Tailwind v4 Integration
```typescript
// Direct token usage in Tailwind
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />
<div className="border-border rounded-[var(--radius)]" />
```

## Font System

### Available Fonts
1. **Geist** - Default sans-serif (via next/font)
2. **Geist Mono** - Monospace font
3. **Highway Gothic** - Display font (3 weights + condensed/expanded)
4. **IosevkaTerm** - Technical monospace

### Font Loading
```typescript
// lib/fonts.ts
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export { GeistSans, GeistMono }
```

### Using Custom Fonts
```css
/* In globals.css */
@font-face {
  font-family: 'CustomFont';
  src: url('../fonts/custom.woff2') format('woff2');
  font-display: swap;
}

:root {
  --font-custom: 'CustomFont', sans-serif;
}
```

## Theme Provider

### Setup
```typescript
// apps/app/src/app/layout.tsx
import { ThemeProvider } from '@repo/design/providers/theme'

export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
```

### Using Theme
```typescript
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle theme
    </button>
  )
}
```

## Hooks

### useMediaQuery
```typescript
import { useMediaQuery } from '@repo/design/hooks/use-media-query'

const isDesktop = useMediaQuery("(min-width: 768px)")
```

### useIsMobile
```typescript
import { useIsMobile } from '@repo/design/hooks/use-is-mobile'

const isMobile = useIsMobile()
```

### useToast
```typescript
import { useToast } from '@repo/design/hooks/use-toast'

const { toast } = useToast()

toast({
  title: "Success",
  description: "Operation completed",
  variant: "default", // or "destructive"
})
```

## Form Integration

### React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design/components/ui/form'
import { Input } from '@repo/design/components/ui/input'

const formSchema = z.object({
  email: z.string().email(),
})

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
```

## Charts with Recharts

```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip } from '@repo/design/components/ui/chart'

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
]

function MyChart() {
  return (
    <ChartContainer config={chartConfig}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip />
        <Line
          dataKey="value"
          stroke="var(--chart-1)"
          strokeWidth={2}
        />
      </LineChart>
    </ChartContainer>
  )
}
```

## Command Palette

```typescript
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/design/components/ui/command'

function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

## Aesthetic Modes

### Brutalist/Bauhaus (Default)
- Warm, paper-like backgrounds
- Minimal color saturation
- Highway Gothic typography
- Sharp corners (small radius)

### Minimal/Corporate
```css
:root {
  --background: oklch(1 0 0);        /* Pure white */
  --foreground: oklch(0.145 0 0);    /* Pure black */
  --primary: oklch(0.205 0 0);       /* Dark gray */
  --radius: 0.625rem;                /* Softer corners */
}
```

### Playful/Modern
```css
:root {
  --background: oklch(0.98 0.02 270);  /* Purple tint */
  --foreground: oklch(0.2 0.03 270);   /* Purple-black */
  --primary: oklch(0.7 0.25 270);      /* Vibrant purple */
  --radius: 1rem;                      /* Rounded */
}
```

## Best Practices

### Component Usage
- Always use design tokens, never hardcode colors
- Import components from their specific paths for better tree-shaking
- Use the cn() utility for class merging
- Prefer composition over customization

### Performance
- Components are optimized for SSR
- Use dynamic imports for heavy components
- Toast/Dialog portals prevent layout shift
- CSS variables enable instant theme switching

### Accessibility
- All components follow WCAG 2.1 AA standards
- Keyboard navigation supported throughout
- ARIA attributes properly implemented
- Focus management handled correctly

### Token Modifications
1. **Always modify tokens in globals.css**, not components
2. **Test in both light and dark modes**
3. **Maintain semantic meaning** (primary = action, destructive = danger)
4. **Check contrast ratios** for accessibility

## Common Issues & Solutions

### Components Not Reflecting Token Changes
```bash
# Clear Next.js cache
rm -rf apps/app/.next
pnpm dev
```

### Dark Mode Not Working
Ensure ThemeProvider wraps your app and `attribute="class"` is set.

### Tailwind Not Picking Up Custom Colors
Use CSS variables in Tailwind config:
```typescript
colors: {
  primary: "oklch(var(--primary) / <alpha-value>)"
}
```

### Icons Not Rendering
Check IconProvider is at app root and icon name exists in IconNames.

## Package Exports

```typescript
// Main components
import { Button, Card, Input } from '@repo/design/components/ui/[component]'

// Icons
import { Icon, IconNames, IconProvider } from '@repo/design/icons'

// Utilities
import { cn } from '@repo/design/lib/utils'

// Hooks
import { useToast } from '@repo/design/hooks/use-toast'

// Providers
import { ThemeProvider } from '@repo/design/providers/theme'

// Styles (in layout.tsx)
import '@repo/design/styles/globals.css'
```

## Environment Variables
No environment variables required. All configuration is done through CSS variables and provider props.

## Testing Components

### Component Testing
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@repo/design/components/ui/button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button')).toHaveTextContent('Click me')
})
```

### Visual Regression Testing
Use Storybook or similar for visual testing of component variants.

## Migration Guide

### From Other Component Libraries
1. Replace component imports with @repo/design equivalents
2. Update variant props to match shadcn patterns
3. Replace color classes with design token classes
4. Update icon imports to use Icon component

### Upgrading Tailwind
The package uses Tailwind v4. Ensure your app's PostCSS config imports from the design package:
```javascript
// apps/app/postcss.config.mjs
export { default } from '@repo/design/postcss.config.mjs'
```

## Key Files
- `styles/globals.css` - Design tokens and CSS variables
- `components/ui/*` - shadcn/ui components
- `icons/names.ts` - Icon name constants
- `lib/utils.ts` - cn() utility
- `providers/theme.tsx` - Theme provider
- `index.tsx` - Main exports

## TurboKit Conventions
- Design tokens control all visual properties
- OKLCH color space for predictable manipulation
- Type-safe icon system with runtime switching
- Components adapt to tokens, not the reverse
- Accessibility is non-negotiable
- Performance through SSR optimization