# core development rules

these rules apply to all code in this project. follow them strictly.

## typescript conventions

### type safety
- never use `any` type, use `unknown` if type is truly unknown
- prefer interfaces over type aliases for object shapes
- use const assertions for literal types
- export all types used across module boundaries

### naming conventions
```typescript
// interfaces: PascalCase with 'I' prefix for models
interface IUser {
  id: string
  email: string
}

// types: PascalCase without prefix
type UserRole = 'admin' | 'user'

// components: PascalCase
function UserProfile() {}

// functions: camelCase
function getUserById() {}

// constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3

// files: kebab-case
// user-service.ts, api-client.ts
```

## react patterns

### component structure
```typescript
// 1. imports
import { useState } from 'react'

// 2. types
interface Props {
  // props
}

// 3. component
export function Component({ prop }: Props) {
  // 4. hooks
  const [state, setState] = useState()
  
  // 5. handlers
  const handleClick = () => {}
  
  // 6. effects
  useEffect(() => {}, [])
  
  // 7. render
  return <div />
}
```

### hooks rules
- custom hooks start with 'use'
- hooks called at top level only
- dependencies arrays complete
- cleanup functions for effects

## error handling

### api errors
```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
  }
}

// usage
try {
  const data = await api.call()
} catch (error) {
  if (error instanceof ApiError) {
    // handle api error
  } else {
    // handle unexpected error
  }
}
```

### user-facing errors
- always provide actionable error messages
- log technical details, show user-friendly messages
- include retry mechanisms where appropriate
- graceful degradation over complete failure

## security requirements

### input validation
- validate all user inputs
- sanitize before database operations
- use parameterized queries
- escape html in user content

### authentication checks
```typescript
// every protected api route
export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  // proceed with authenticated request
}
```

### sensitive data
- never log passwords or tokens
- use environment variables for secrets
- implement rate limiting
- validate permissions before operations

## performance standards

### code splitting
```typescript
// lazy load heavy components
const HeavyComponent = lazy(() => import('./heavy-component'))

// dynamic imports for optional features
if (userWantsFeature) {
  const { feature } = await import('./feature')
}
```

### optimization priorities
1. minimize bundle size
2. reduce api calls
3. cache appropriately
4. lazy load images
5. debounce user inputs

## code quality

### comments
```typescript
// why, not what
// bad: increment counter
counter++

// good: retry up to max attempts to handle transient failures
counter++
```

### functions
- single responsibility
- max 20 lines preferred
- descriptive names
- pure when possible

### imports
```typescript
// order
// 1. react
import { useState } from 'react'

// 2. next
import { useRouter } from 'next/navigation'

// 3. external packages
import { format } from 'date-fns'

// 4. internal packages
import { Button } from '@repo/ui'

// 5. relative imports
import { helper } from './utils'

// 6. types
import type { User } from './types'
```

## git conventions

### commit messages
```
type(scope): description

feat(auth): add social login
fix(ui): correct button alignment
docs(api): update endpoint documentation
refactor(db): optimize query performance
test(user): add integration tests
```

### branch naming
```
feature/add-user-dashboard
fix/login-error-handling
refactor/api-structure
docs/update-readme
```

## testing requirements

### test coverage
- critical paths: 100%
- business logic: 80%
- ui components: 60%
- utilities: 90%

### test structure
```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // arrange
    const props = {}
    
    // act
    render(<Component {...props} />)
    
    // assert
    expect(screen.getByText('text')).toBeInTheDocument()
  })
})
```

## forbidden patterns

never do these:
- [ ] direct dom manipulation in react
- [ ] mutable global state
- [ ] synchronous file operations in api routes
- [ ] hardcoded secrets
- [ ] console.log in production
- [ ] disabled linting rules without justification
- [ ] any type without attempting proper typing
- [ ] copy-paste code without understanding

---

*these core rules ensure code quality, security, and maintainability. all agents must follow them.*