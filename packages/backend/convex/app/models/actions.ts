import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
// TODO: Re-enable when @repo/media workspace package is properly resolved
// import { fetchOpenAIModels, fetchOpenRouterModels } from "@repo/media/server";

/**
 * Fetch models from OpenAI API and cache in database
 * TODO: Re-enable when @repo/media workspace package is properly resolved
 */
export const fetchOpenAI = internalAction({
	args: {},
	handler: async (_ctx) => {
		// Stubbed - @repo/media not yet configured
		console.error("[MODELS] @repo/media package not configured");
		return {
			success: false,
			error:
				"Model fetching not yet configured. Install and configure @repo/media package.",
		};
	},
});

/**
 * Fetch models from OpenRouter API and cache in database
 * TODO: Re-enable when @repo/media workspace package is properly resolved
 */
export const fetchOpenRouter = internalAction({
	args: {
		outputModalities: v.optional(v.array(v.string())),
	},
	handler: async (_ctx, _args) => {
		// Stubbed - @repo/media not yet configured
		console.error("[MODELS] @repo/media package not configured");
		return {
			success: false,
			error:
				"Model fetching not yet configured. Install and configure @repo/media package.",
		};
	},
});
