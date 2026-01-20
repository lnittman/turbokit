import { ActionCache } from "@convex-dev/action-cache";
import { components } from "../_generated/api";

// Image generation cache (24h TTL, deterministic results)
// Use for caching image generation by (prompt, quality, size)
export const imageGenerationCache = new ActionCache(components.actionCache as any, {
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 1000,
} as any);

// LLM response cache (1h TTL, temperature=0 only)
// Use for caching deterministic LLM responses
export const llmResponseCache = new ActionCache(components.actionCache as any, {
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 5000,
} as any);

// External API cache (5min TTL)
// Use for caching external API calls
export const apiCallCache = new ActionCache(components.actionCache as any, {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 10000,
} as any);

// Usage example:
// const result = await imageGenerationCache.fetch(ctx,
//   { prompt, quality, size },
//   async () => await imagesClient.generate({ prompt, quality, size })
// );

