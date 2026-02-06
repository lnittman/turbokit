import { action } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuthAction } from "../../lib/auth";
// TODO: Re-enable when @repo/media workspace package is properly resolved
// import { MediaClient } from "@repo/media";

// Optional: Direct generation action (for testing/admin use)
// WARNING: This bypasses job tracking and retries. Use startGeneration mutation for production.
// TODO: Re-enable full implementation when @repo/media workspace package is properly resolved
export const generateDirect = action({
  args: {
    provider: v.union(
      v.literal("openai"),
      v.literal("fal"),
      v.literal("openrouter")
    ),
    prompt: v.string(),
    // OpenAI-specific
    inputImage: v.optional(v.string()),
    quality: v.optional(v.string()),
    size: v.optional(v.string()),
    outputFormat: v.optional(v.string()),
    numImages: v.optional(v.number()),
    // Generic model ID
    model: v.optional(v.string()),
    // Fal-specific: generic input object
    falInput: v.optional(v.any()),
    // OpenRouter-specific
    aspectRatio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuthAction(ctx);

    // Stubbed - media generation not yet configured
    return {
      success: false,
      error: "Media generation not yet configured. Install and configure @repo/media package.",
    };
  },
});
