import { action } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuthAction } from "../../lib/auth";
import { requireRole } from "../../lib/auth";
import { MediaClient } from "@repo/media";

// Optional: Direct generation action (for testing/admin use)
// WARNING: This bypasses job tracking and retries. Use startGeneration mutation for production.
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

    // Optional: Restrict to admins only
    // requireRole(user, "admin");

    const mediaClient = new MediaClient({
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      FAL_API_KEY: process.env.FAL_API_KEY,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      OPENROUTER_REFERER: process.env.OPENROUTER_REFERER,
      OPENROUTER_TITLE: process.env.OPENROUTER_TITLE,
    });

    try {
      let result;

      switch (args.provider) {
        case "openai":
          result = await mediaClient.generateWithOpenAI({
            prompt: args.prompt,
            model: args.model || "gpt-image-1",
            inputImage: args.inputImage,
            quality: (args.quality as any) || "high",
            size: (args.size as any) || "1024x1024",
            outputFormat: (args.outputFormat as any) || "png",
            numImages: args.numImages || 1,
          });
          break;

        case "fal":
          // Fal now requires model + generic input object
          if (!args.model) {
            throw new Error("Fal generation requires 'model' parameter (e.g., 'fal-ai/flux-pro')");
          }
          result = await mediaClient.generateWithFal({
            model: args.model,
            input: args.falInput || { prompt: args.prompt },
          });
          break;

        case "openrouter":
          result = await mediaClient.generateWithOpenRouter({
            prompt: args.prompt,
            model: args.model || "google/gemini-2.5-flash-image-preview",
            aspectRatio: args.aspectRatio as any,
          });
          break;

        default:
          throw new Error(`Unknown provider: ${args.provider}`);
      }

      // MediaResult is a discriminated union (image | video | audio | 3d)
      return {
        success: true,
        result: {
          type: result.type,
          url: result.url,
          // Type-specific fields
          ...(result.type === "image" && {
            b64: result.b64,
            width: result.width,
            height: result.height,
            contentType: result.contentType,
          }),
          ...(result.type === "video" && {
            duration: result.duration,
            hasAudio: result.hasAudio,
            contentType: result.contentType,
          }),
          ...(result.type === "audio" && {
            duration: result.duration,
            contentType: result.contentType,
          }),
          ...(result.type === "3d" && {
            format: result.format,
            previewUrl: result.previewUrl,
          }),
          meta: result.meta,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  },
});
