import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";

/**
 * Fetch models from OpenAI API and cache in database
 */
export const fetchOpenAI = internalAction({
	args: {},
	handler: async (ctx) => {
		const apiKey = process.env.OPENAI_API_KEY;
		if (!apiKey) {
			return {
				success: false,
				error: "OPENAI_API_KEY is not configured",
			};
		}

		try {
			const { fetchOpenAIModels } = await import("@repo/media/server");
			const models = await fetchOpenAIModels(apiKey);

			await ctx.runMutation(internal.app.models.internal.updateCache, {
				provider: "openai",
				filterKey: "default",
				models,
			});

			return {
				success: true,
				count: models.length,
				provider: "openai" as const,
			};
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to fetch OpenAI models";
			console.error("[MODELS] OpenAI fetch failed:", message);
			return {
				success: false,
				error: message,
			};
		}
	},
});

/**
 * Fetch models from OpenRouter API and cache in database
 */
export const fetchOpenRouter = internalAction({
	args: {
		outputModalities: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const apiKey = process.env.OPENROUTER_API_KEY;
		if (!apiKey) {
			return {
				success: false,
				error: "OPENROUTER_API_KEY is not configured",
			};
		}

		const outputModalities = args.outputModalities;
		const filterKey = outputModalities?.sort().join(",") || "all";

		try {
			const { fetchOpenRouterModels } = await import("@repo/media/server");
			const models = await fetchOpenRouterModels(apiKey, {
				outputModalities,
			});

			await ctx.runMutation(internal.app.models.internal.updateCache, {
				provider: "openrouter",
				filterKey,
				models,
			});

			return {
				success: true,
				count: models.length,
				provider: "openrouter" as const,
				filterKey,
			};
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to fetch OpenRouter models";
			console.error("[MODELS] OpenRouter fetch failed:", message);
			return {
				success: false,
				error: message,
			};
		}
	},
});
