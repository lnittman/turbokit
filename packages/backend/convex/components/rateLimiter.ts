import { RateLimiter, MINUTE, SECOND, HOUR } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";
import { ConvexError } from "convex/values";
import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // API calls - general rate limiting
  apiCall: {
    kind: "token bucket",
    period: SECOND,
    rate: 10, // 10 requests per second
    capacity: 20, // Burst capacity of 20
  },
  
  // AI token usage - prevent runaway costs
  aiTokens: {
    kind: "token bucket",
    period: MINUTE,
    rate: 10000, // 10k tokens per minute
    capacity: 50000, // Burst capacity of 50k
  },
  
  // Email sending - prevent spam
  emailSend: {
    kind: "fixed window",
    period: HOUR,
    rate: 20, // 20 emails per hour
    capacity: 20,
  },
  
  // User registration - prevent abuse
  userRegistration: {
    kind: "fixed window",
    period: 24 * HOUR,
    rate: 10, // 10 new accounts per day per IP
    capacity: 10,
  },
  
  // File uploads
  fileUpload: {
    kind: "token bucket",
    period: MINUTE,
    rate: 5, // 5 uploads per minute
    capacity: 10,
  },
  
  // Search/query operations
  search: {
    kind: "token bucket",
    period: SECOND,
    rate: 5, // 5 searches per second
    capacity: 15,
  },
});

// Helper to check rate limit with user context
export async function checkRateLimit(
  ctx: QueryCtx | MutationCtx | ActionCtx,
  limit: string,
  identifier: string,
  options?: { 
    count?: number;
    throwOnLimit?: boolean;
  }
) {
  const { count = 1, throwOnLimit = true } = options || {};
  
  try {
    const result = await (rateLimiter as any).limit(ctx as any, limit as any, { 
      key: identifier as any,
      count: count as any,
    } as any);
    
    if (!result.ok && throwOnLimit) {
      throw new ConvexError({
        message: `Rate limit exceeded for ${limit}`,
        retryAfter: result.retryAfter,
      });
    }
    
    return result;
  } catch (error) {
    if (throwOnLimit) {
      throw error;
    }
    return { ok: false, retryAfter: 0 };
  }
}

// Check API rate limit using user ID
export async function checkApiRateLimit(
  ctx: QueryCtx | MutationCtx | ActionCtx,
  userId: string
) {
  return checkRateLimit(ctx, "apiCall", userId);
}

// Check AI token usage
export async function checkAiTokenLimit(
  ctx: QueryCtx | MutationCtx | ActionCtx,
  userId: string,
  estimatedTokens: number
) {
  return checkRateLimit(ctx, "aiTokens", userId, { count: estimatedTokens });
}
