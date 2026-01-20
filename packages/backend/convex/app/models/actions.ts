import { internalAction } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { fetchOpenAIModels, fetchOpenRouterModels } from "@repo/media/server";

/**
 * Fetch models from OpenAI API and cache in database
 */
export const fetchOpenAI = internalAction({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[MODELS] OPENAI_API_KEY not configured");
      return { success: false, error: "OPENAI_API_KEY not configured" };
    }

    try {
      const models = await fetchOpenAIModels(apiKey);

      await ctx.runMutation(internal.app.models.internal.updateCache, {
        provider: "openai",
        filterKey: "default",
        models,
      });

      console.log(`[MODELS] Fetched ${models.length} OpenAI models`);
      return { success: true, count: models.length };
    } catch (error: any) {
      console.error("[MODELS] Failed to fetch OpenAI models:", error.message);
      return { success: false, error: error.message };
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
      console.error("[MODELS] OPENROUTER_API_KEY not configured");
      return { success: false, error: "OPENROUTER_API_KEY not configured" };
    }

    try {
      const filters = args.outputModalities ? { outputModalities: args.outputModalities } : undefined;
      const models = await fetchOpenRouterModels(apiKey, filters);

      // Create filter key from modalities for caching
      const filterKey = args.outputModalities?.sort().join(",") || "all";

      await ctx.runMutation(internal.app.models.internal.updateCache, {
        provider: "openrouter",
        filterKey,
        models,
      });

      console.log(`[MODELS] Fetched ${models.length} OpenRouter models (filter: ${filterKey})`);
      return { success: true, count: models.length };
    } catch (error: any) {
      console.error("[MODELS] Failed to fetch OpenRouter models:", error.message);
      return { success: false, error: error.message };
    }
  },
});
