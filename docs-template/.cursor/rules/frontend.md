# frontend development rules

specific rules for frontend code in `apps/app/` directory.

## component architecture

### file organization
```
components/
├── ui/                # base ui components (shadcn)
│   ├── button.tsx
│   └── card.tsx
├── features/          # feature-specific components
│   ├── dashboard/
│   │   ├── dashboard-header.tsx
│   │   ├── dashboard-stats.tsx
│   │   └── index.tsx
│   └── profile/
│       ├── profile-form.tsx
│       └── index.tsx
├── layouts/           # page layouts
│   ├── auth-layout.tsx
│   └── main-layout.tsx
└── providers/         # context providers
    ├── theme-provider.tsx
    └── modal-provider.tsx
```

### component rules
```typescript
// always export as named export
export function ComponentName() {}

// props interface above component
interface ComponentNameProps {
  required: string
  optional?: number
  children?: React.ReactNode
}

// use function components only
// no class components

// memo only when necessary
export const ExpensiveComponent = memo(function ExpensiveComponent() {
  // implementation
})
```

## state management patterns

### jotai for ui state
```typescript
// atoms in separate file
// atoms/ui.ts
import { atom } from 'jotai'

export const modalOpenAtom = atom(false)
export const sidebarCollapsedAtom = atom(false)
export const selectedItemAtom = atom<string | null>(null)

// usage in components
import { useAtom } from 'jotai'
import { modalOpenAtom } from '@/atoms/ui'

function Component() {
  const [isOpen, setIsOpen] = useAtom(modalOpenAtom)
}
```

### swr for server state
```typescript
// hooks/use-user.ts
import useSWR from 'swr'

export function useUser(id: string) {
  return useSWR(
    `/api/users/${id}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )
}

// usage
function Profile({ userId }: Props) {
  const { data, error, isLoading } = useUser(userId)
  
  if (isLoading) return <Skeleton />
  if (error) return <Error />
  
  return <div>{data.name}</div>
}
```

### url state for navigation
```typescript
// use searchParams for filters/pagination
import { useSearchParams } from 'next/navigation'

function List() {
  const searchParams = useSearchParams()
  const page = searchParams.get('page') || '1'
  const filter = searchParams.get('filter') || 'all'
  
  // update url without navigation
  const updateFilter = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('filter', value)
    router.push(`?${params.toString()}`)
  }
}
```

## ui/ux guidelines

### loading states
```typescript
// always show loading state
if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}
```

### error states
```typescript
// informative error messages
if (error) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>error loading data</AlertTitle>
      <AlertDescription>
        {error.message || 'something went wrong'}
        <Button onClick={retry} size="sm" className="mt-2">
          try again
        </Button>
      </AlertDescription>
    </Alert>
  )
}
```

### empty states
```typescript
// helpful empty states
if (!data || data.length === 0) {
  return (
    <Card className="p-8 text-center">
      <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 font-semibold">no items found</h3>
      <p className="mt-2 text-muted-foreground">
        get started by creating your first item
      </p>
      <Button className="mt-4">
        <Plus className="mr-2 h-4 w-4" />
        create item
      </Button>
    </Card>
  )
}
```

## accessibility standards

### semantic html
```typescript
// use correct elements
<nav> {/* navigation */}
<main> {/* main content */}
<aside> {/* sidebar */}
<footer> {/* footer */}

// headings hierarchy
<h1>page title</h1>
  <h2>section title</h2>
    <h3>subsection</h3>
```

### aria attributes
```typescript
// loading states
<div aria-busy="true" aria-label="loading content">
  <Spinner />
</div>

// interactive elements
<button
  aria-label="close dialog"
  aria-pressed={isPressed}
  aria-expanded={isOpen}
>

// live regions
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### keyboard navigation
```typescript
// all interactive elements keyboard accessible
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
```

## styling patterns

### tailwind css usage
```typescript
// component variants with cn()
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function Component({ variant = 'primary', size = 'md', className }: Props) {
  return (
    <div
      className={cn(
        // base styles
        'rounded-lg border transition-colors',
        // variant styles
        {
          'bg-primary text-primary-foreground': variant === 'primary',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
        },
        // size styles
        {
          'p-2 text-sm': size === 'sm',
          'p-4 text-base': size === 'md',
          'p-6 text-lg': size === 'lg',
        },
        // custom styles
        className
      )}
    >
      content
    </div>
  )
}
```

### responsive design
```typescript
// mobile-first approach
<div className="
  grid grid-cols-1      // mobile
  sm:grid-cols-2        // tablet
  lg:grid-cols-3        // desktop
  xl:grid-cols-4        // wide
  gap-4
">
```

### dark mode support
```typescript
// use css variables
<div className="
  bg-background        // adapts to theme
  text-foreground      // adapts to theme
  border-border        // adapts to theme
">
```

## performance optimization

### image optimization
```typescript
import Image from 'next/image'

// always use next/image
<Image
  src="/image.jpg"
  alt="description"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL={blurUrl}
/>
```

### code splitting
```typescript
// lazy load heavy components
const Chart = dynamic(() => import('./chart'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false,
})

// conditional imports
if (needsFeature) {
  const { Feature } = await import('./feature')
}
```

### memoization
```typescript
// memo expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensive(data)
}, [data])

// memo callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

## form handling

### validation
```typescript
// use zod for schema validation
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('invalid email'),
  password: z.string().min(8, 'minimum 8 characters'),
})

// with react-hook-form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm({
  resolver: zodResolver(schema),
})
```

### error display
```typescript
// inline errors
<Input {...register('email')} />
{errors.email && (
  <p className="mt-1 text-sm text-destructive">
    {errors.email.message}
  </p>
)}
```

## routing patterns

### protected routes
```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/'],
})

// in pages
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  
  return <div>protected content</div>
}
```

### dynamic routes
```typescript
// app/items/[id]/page.tsx
interface Props {
  params: { id: string }
  searchParams: Record<string, string>
}

export default function ItemPage({ params, searchParams }: Props) {
  // use params.id
}
```

---

*these frontend rules ensure consistent, performant, and accessible user interfaces.*