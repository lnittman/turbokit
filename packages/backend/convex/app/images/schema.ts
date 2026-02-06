import { defineTable } from "convex/server";
import { v } from "convex/values";

// Image Generation Jobs table
export const imageGenerationJobs = defineTable({
	userId: v.id("users"),
	provider: v.union(
		v.literal("openai"),
		v.literal("fal"),
		v.literal("openrouter"),
	),
	prompt: v.string(),
	inputImage: v.optional(v.string()),
	quality: v.optional(v.string()),
	size: v.optional(v.string()),
	outputFormat: v.optional(v.string()),
	numImages: v.optional(v.number()),
	model: v.optional(v.string()), // Fal model or OpenRouter model
	input: v.optional(v.any()), // Fal model input object
	aspectRatio: v.optional(v.string()), // OpenRouter image aspect ratio
	status: v.union(
		v.literal("queued"),
		v.literal("processing"),
		v.literal("completed"),
		v.literal("failed"),
	),
	attempts: v.number(),
	mediaType: v.optional(
		v.union(
			v.literal("image"),
			v.literal("video"),
			v.literal("audio"),
			v.literal("3d"),
		),
	),
	resultB64: v.optional(v.string()), // Base64 result (no data: prefix)
	resultUrl: v.optional(v.string()), // Public URL (Fal.ai returns this)
	duration: v.optional(v.number()),
	error: v.optional(v.string()),
	correlationId: v.optional(v.string()), // For tracking across logs
	metadata: v.optional(v.any()), // Provider-specific metadata
	createdAt: v.number(),
	updatedAt: v.number(),
})
	.index("by_user", ["userId"])
	.index("by_status", ["status"])
	.index("by_user_status", ["userId", "status"])
	.index("by_correlation", ["correlationId"]);
