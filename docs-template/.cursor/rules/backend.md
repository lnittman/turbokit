# backend development rules

specific rules for backend code including api routes and services.

## api design patterns

### route structure
```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'

// GET /api/resource
export async function GET(request: NextRequest) {
  try {
    // 1. authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401 }
      )
    }
    
    // 2. parse query params
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // 3. business logic
    const data = await service.getData({ userId, page, limit })
    
    // 4. response
    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        timestamp: Date.now(),
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/resource
export async function POST(request: NextRequest) {
  try {
    // 1. authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401 }
      )
    }
    
    // 2. parse and validate body
    const body = await request.json()
    const validated = schema.parse(body)
    
    // 3. business logic
    const result = await service.create({ ...validated, userId })
    
    // 4. response
    return NextResponse.json(
      { data: result },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

### error handling
```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// lib/handle-api-error.ts
export function handleApiError(error: unknown): NextResponse {
  // known api error
  if (error instanceof ApiError) {
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code 
      },
      { status: error.statusCode }
    )
  }
  
  // validation error
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        error: 'validation error',
        details: error.errors 
      },
      { status: 400 }
    )
  }
  
  // prisma error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'duplicate entry' },
        { status: 409 }
      )
    }
  }
  
  // unknown error
  console.error('unhandled api error:', error)
  return NextResponse.json(
    { error: 'internal server error' },
    { status: 500 }
  )
}
```

## authentication flows

### clerk integration
```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/', '/api/webhook'],
  ignoredRoutes: ['/api/health'],
})

// api route
import { auth, currentUser } from '@clerk/nextjs'

export async function GET() {
  // simple auth check
  const { userId } = await auth()
  
  // full user data
  const user = await currentUser()
  
  if (!userId) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401 }
    )
  }
}
```

### api keys
```typescript
// for external api access
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey || !isValidApiKey(apiKey)) {
    return NextResponse.json(
      { error: 'invalid api key' },
      { status: 403 }
    )
  }
  
  // proceed with request
}
```

## database interactions

### prisma patterns
```typescript
// services/user.service.ts
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class UserService {
  // create with transaction
  async createWithProfile(data: CreateUserData) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
        }
      })
      
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          bio: data.bio,
        }
      })
      
      return { user, profile }
    })
  }
  
  // pagination
  async list(params: ListParams) {
    const { page = 1, limit = 10, orderBy = 'createdAt' } = params
    
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [orderBy]: 'desc' },
        include: {
          profile: true,
        }
      }),
      prisma.user.count()
    ])
    
    return {
      items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    }
  }
  
  // soft delete
  async delete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        status: 'deleted',
      }
    })
  }
}
```

### query optimization
```typescript
// avoid n+1 queries
// bad
const posts = await prisma.post.findMany()
for (const post of posts) {
  post.author = await prisma.user.findUnique({
    where: { id: post.authorId }
  })
}

// good
const posts = await prisma.post.findMany({
  include: {
    author: true
  }
})

// selective fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    profile: {
      select: {
        bio: true,
        avatar: true,
      }
    }
  }
})
```

## caching strategies

### swr cache headers
```typescript
export async function GET() {
  const data = await fetchData()
  
  return NextResponse.json(
    { data },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      }
    }
  )
}
```

### redis caching
```typescript
import { redis } from '@/lib/redis'

export async function getCachedData(key: string) {
  // try cache first
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // fetch fresh data
  const data = await fetchFromDatabase()
  
  // cache for 5 minutes
  await redis.setex(key, 300, JSON.stringify(data))
  
  return data
}
```

### invalidation patterns
```typescript
// invalidate on mutation
export async function POST(request: NextRequest) {
  const result = await createItem(data)
  
  // invalidate related caches
  await redis.del([
    'items:list',
    `items:${result.categoryId}`,
  ])
  
  return NextResponse.json({ data: result })
}
```

## service layer patterns

### service structure
```typescript
// services/base.service.ts
export abstract class BaseService<T> {
  protected abstract model: any
  
  async findById(id: string): Promise<T> {
    const item = await this.model.findUnique({
      where: { id }
    })
    
    if (!item) {
      throw new ApiError('not found', 404)
    }
    
    return item
  }
  
  async list(params: ListParams): Promise<ListResponse<T>> {
    // implementation
  }
  
  abstract create(data: any): Promise<T>
  abstract update(id: string, data: any): Promise<T>
  abstract delete(id: string): Promise<void>
}
```

### business logic
```typescript
// services/order.service.ts
export class OrderService extends BaseService<Order> {
  protected model = prisma.order
  
  async create(data: CreateOrderData) {
    // validate business rules
    if (!this.canCreateOrder(data.userId)) {
      throw new ApiError('order limit reached', 429)
    }
    
    // calculate pricing
    const total = await this.calculateTotal(data.items)
    
    // create with transaction
    return prisma.$transaction(async (tx) => {
      // create order
      const order = await tx.order.create({
        data: {
          ...data,
          total,
          status: 'pending',
        }
      })
      
      // create items
      await tx.orderItem.createMany({
        data: data.items.map(item => ({
          orderId: order.id,
          ...item,
        }))
      })
      
      // update inventory
      await this.updateInventory(tx, data.items)
      
      return order
    })
  }
  
  private async canCreateOrder(userId: string): Promise<boolean> {
    // business rule validation
  }
  
  private async calculateTotal(items: OrderItem[]): Promise<number> {
    // pricing logic
  }
}
```

## rate limiting

### api route protection
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
})

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: 'too many requests' },
      { status: 429 }
    )
  }
  
  // proceed with request
}
```

## webhook handling

### secure webhooks
```typescript
// app/api/webhook/[provider]/route.ts
import { headers } from 'next/headers'
import { verifyWebhook } from '@/lib/webhooks'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('x-signature')
  
  // verify webhook signature
  if (!verifyWebhook(body, signature)) {
    return NextResponse.json(
      { error: 'invalid signature' },
      { status: 401 }
    )
  }
  
  const event = JSON.parse(body)
  
  // process webhook
  await processWebhookEvent(event)
  
  // always return 200 quickly
  return NextResponse.json({ received: true })
}

// process async
async function processWebhookEvent(event: WebhookEvent) {
  // queue for background processing
  await queue.add('webhook', event)
}
```

## environment configuration

### validation
```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string(),
  REDIS_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)
```

### usage
```typescript
import { env } from '@/lib/env'

// use validated env vars
const db = new Database(env.DATABASE_URL)
```

---

*these backend rules ensure secure, performant, and maintainable api services.*