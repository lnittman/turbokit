import { RateLimiter, MINUTE, SECOND, HOUR } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";
import { ConvexError } from "convex/values";
import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  apiCall: { kind: "token bucket", period: SECOND, rate: 10, capacity: 20 },
  aiTokens: { kind: "token bucket", period: MINUTE, rate: 10000, capacity: 50000 },
  emailSend: { kind: "fixed window", period: HOUR, rate: 20, capacity: 20 },
  userRegistration: { kind: "fixed window", period: 24 * HOUR, rate: 10, capacity: 10 },
  fileUpload: { kind: "token bucket", period: MINUTE, rate: 5, capacity: 10 },
  search: { kind: "token bucket", period: SECOND, rate: 5, capacity: 15 },
});

export async function checkRateLimit(
  ctx: QueryCtx | MutationCtx | ActionCtx,
  limit: string,
  identifier: string,
  options?: { count?: number; throwOnLimit?: boolean }
) {
  const { count = 1, throwOnLimit = true } = options || {};
  const result = await (rateLimiter as any).limit(ctx as any, limit as any, { key: identifier as any, count: count as any } as any);
  if (!result.ok && throwOnLimit) {
    throw new ConvexError({ message: `Rate limit exceeded for ${limit}`, retryAfter: result.retryAfter });
  }
  return result;
}

export async function checkApiRateLimit(ctx: QueryCtx | MutationCtx | ActionCtx, userId: string) {
  return checkRateLimit(ctx, "apiCall", userId);
}

export async function checkAiTokenLimit(ctx: QueryCtx | MutationCtx | ActionCtx, userId: string, estimatedTokens: number) {
  return checkRateLimit(ctx, "aiTokens", userId, { count: estimatedTokens });
}

