import { v } from "convex/values";
import { query } from "../../_generated/server";

/**
 * List available models from a provider
 * Returns cached models if fresh, otherwise schedules refresh
 */
export const list = query({
	args: {
		provider: v.union(v.literal("openai"), v.literal("openrouter")),
		outputModalities: v.optional(v.array(v.string())), // For OpenRouter filtering
	},
	handler: async (ctx, args) => {
		const { provider, outputModalities } = args;

		// Create filter key for caching
		const filterKey =
			outputModalities?.sort().join(",") ||
			(provider === "openai" ? "default" : "all");

		// Check cache
		const cached = await ctx.db
			.query("modelCache")
			.withIndex("by_provider_filter", (q) =>
				q.eq("provider", provider).eq("filterKey", filterKey),
			)
			.first();

		const now = Date.now();

		// If cache is fresh, return it
		if (cached && cached.expiresAt > now) {
			return {
				models: cached.models,
				cached: true,
				fetchedAt: cached.fetchedAt,
			};
		}

		// Cache is stale or missing - return stale data if available
		// Client should trigger a refresh mutation to update the cache
		if (cached) {
			return {
				models: cached.models,
				cached: true,
				stale: true,
				fetchedAt: cached.fetchedAt,
			};
		}

		return {
			models: [],
			cached: false,
			fetching: true,
		};
	},
});

/**
 * Get information about Fal.ai models
 * Fal doesn't provide a listing API, so we return static info
 */
export const getFalInfo = query({
	args: {},
	handler: async () => {
		return {
			message:
				"Fal.ai has 600+ models but does not provide a public listing API.",
			url: "https://fal.ai/models",
			note: "Browse available models and pass the model ID directly to generateWithFal()",
		};
	},
});
