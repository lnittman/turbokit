import { v } from "convex/values";
import { action } from "../../_generated/server";
import { requireAuthAction } from "../../lib/auth";

function normalizeError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return "Unknown media generation error";
}

// Optional: direct generation action (for testing/admin use)
// WARNING: this bypasses job tracking and retries. Use startGeneration mutation for production.
export const generateDirect = action({
	args: {
		provider: v.union(
			v.literal("openai"),
			v.literal("fal"),
			v.literal("openrouter"),
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
		const { MediaClient } = await import("@repo/media");

		const mediaClient = new MediaClient({
			OPENAI_API_KEY: process.env.OPENAI_API_KEY,
			FAL_API_KEY: process.env.FAL_API_KEY,
			OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
			OPENROUTER_REFERER: process.env.OPENROUTER_REFERER,
			OPENROUTER_TITLE: process.env.OPENROUTER_TITLE,
		});

		try {
			let result: unknown;

			switch (args.provider) {
				case "openai":
					result = await mediaClient.generateWithOpenAI({
						prompt: args.prompt,
						model: args.model,
						inputImage: args.inputImage,
						quality: args.quality as "low" | "medium" | "high" | undefined,
						size: args.size as
							| "1024x1024"
							| "1536x1024"
							| "1024x1536"
							| undefined,
						outputFormat: args.outputFormat as "png" | "jpeg" | undefined,
						numImages: args.numImages,
					});
					break;
				case "fal":
					result = await mediaClient.generateWithFal({
						model: args.model || "fal-ai/flux-pro",
						input: args.falInput || { prompt: args.prompt },
					});
					break;
				case "openrouter":
					result = await mediaClient.generateWithOpenRouter({
						prompt: args.prompt,
						model: args.model,
						aspectRatio: args.aspectRatio as
							| "1:1"
							| "2:3"
							| "3:2"
							| "3:4"
							| "4:3"
							| "4:5"
							| "5:4"
							| "9:16"
							| "16:9"
							| "21:9"
							| undefined,
					});
					break;
				default:
					throw new Error(`Unsupported provider: ${args.provider}`);
			}

			return {
				success: true,
				provider: args.provider,
				userId: user._id,
				result,
			};
		} catch (error) {
			const message = normalizeError(error);
			console.error("[IMAGES] Direct generation failed:", message);
			return {
				success: false,
				provider: args.provider,
				userId: user._id,
				error: message,
			};
		}
	},
});
