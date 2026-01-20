import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";

const MODEL_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Update model cache in database
 * Called by actions after fetching from provider APIs
 */
export const updateCache = internalMutation({
  args: {
    provider: v.union(v.literal("openai"), v.literal("openrouter")),
    filterKey: v.string(),
    models: v.array(v.object({
      id: v.string(),
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      capabilities: v.optional(v.array(v.string())),
      pricing: v.optional(v.object({
        input: v.optional(v.number()),
        output: v.optional(v.number()),
      })),
      meta: v.optional(v.any()),
    })),
  },
  handler: async (ctx, args) => {
    const { provider, filterKey, models } = args;

    // Check if cache entry exists
    const existing = await ctx.db
      .query("modelCache")
      .withIndex("by_provider_filter", (q) =>
        q.eq("provider", provider).eq("filterKey", filterKey)
      )
      .first();

    const now = Date.now();
    const expiresAt = now + MODEL_CACHE_TTL;

    if (existing) {
      // Update existing cache
      await ctx.db.patch(existing._id, {
        models,
        fetchedAt: now,
        expiresAt,
      });
    } else {
      // Insert new cache entry
      await ctx.db.insert("modelCache", {
        provider,
        filterKey,
        models,
        fetchedAt: now,
        expiresAt,
      });
    }

    return { success: true };
  },
});
