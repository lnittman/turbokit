import { ConvexError, v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalMutation, mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";

// Public mutation: Start media generation (creates job, schedules internal action)
export const startGeneration = mutation({
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
		input: v.optional(v.any()),
		// OpenRouter-specific
		aspectRatio: v.optional(v.string()),
		// Metadata
		correlationId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { user } = await requireAuth(ctx);

		// Idempotency check: if there's already a queued/processing job, return that
		const existing = await ctx.db
			.query("imageGenerationJobs")
			.withIndex("by_user_status", (q) =>
				q.eq("userId", user._id).eq("status", "queued"),
			)
			.order("desc")
			.first();

		if (existing) {
			return { jobId: existing._id, status: existing.status };
		}

		const processing = await ctx.db
			.query("imageGenerationJobs")
			.withIndex("by_user_status", (q) =>
				q.eq("userId", user._id).eq("status", "processing"),
			)
			.order("desc")
			.first();

		if (processing) {
			return { jobId: processing._id, status: processing.status };
		}

		// Create new job
		const jobId = await ctx.db.insert("imageGenerationJobs", {
			userId: user._id,
			provider: args.provider,
			prompt: args.prompt,
			inputImage: args.inputImage,
			quality: args.quality,
			size: args.size,
			outputFormat: args.outputFormat,
			numImages: args.numImages,
			model: args.model,
			input: args.input,
			aspectRatio: args.aspectRatio,
			status: "queued",
			attempts: 0,
			correlationId: args.correlationId || crypto.randomUUID(),
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		// Schedule internal action immediately
		await ctx.scheduler.runAfter(
			0,
			internal.app.images.internal.processGeneration,
			{ jobId },
		);

		return { jobId, status: "queued" as const };
	},
});

// Internal mutation: Update job status
export const updateJobStatus = internalMutation({
	args: {
		jobId: v.id("imageGenerationJobs"),
		status: v.union(
			v.literal("queued"),
			v.literal("processing"),
			v.literal("completed"),
			v.literal("failed"),
		),
		attempts: v.optional(v.number()),
		error: v.optional(v.string()),
	},
	handler: async (ctx, { jobId, status, attempts, error }) => {
		const job = await ctx.db.get(jobId);
		if (!job) {
			throw new ConvexError("Job not found");
		}

		await ctx.db.patch(jobId, {
			status,
			...(attempts !== undefined && { attempts }),
			...(error && { error }),
			updatedAt: Date.now(),
		});
	},
});

// Internal mutation: Complete job with result
export const completeJob = internalMutation({
	args: {
		jobId: v.id("imageGenerationJobs"),
		resultType: v.union(
			v.literal("image"),
			v.literal("video"),
			v.literal("audio"),
			v.literal("3d"),
		),
		resultUrl: v.string(),
		// Image-specific
		resultB64: v.optional(v.string()),
		resultWidth: v.optional(v.number()),
		resultHeight: v.optional(v.number()),
		// Common
		resultContentType: v.optional(v.string()),
		// Video/Audio-specific
		resultDuration: v.optional(v.number()),
		resultHasAudio: v.optional(v.boolean()),
		// 3D-specific
		resultFormat: v.optional(v.string()),
		resultPreviewUrl: v.optional(v.string()),
		// Metadata
		metadata: v.optional(v.any()),
	},
	handler: async (ctx, args) => {
		const job = await ctx.db.get(args.jobId);
		if (!job) {
			throw new ConvexError("Job not found");
		}

		await ctx.db.patch(args.jobId, {
			status: "completed",
			mediaType: args.resultType,
			resultUrl: args.resultUrl,
			resultB64: args.resultB64,
			duration: args.resultDuration,
			metadata: {
				...args.metadata,
				width: args.resultWidth,
				height: args.resultHeight,
				contentType: args.resultContentType,
				hasAudio: args.resultHasAudio,
				format: args.resultFormat,
				previewUrl: args.resultPreviewUrl,
			},
			updatedAt: Date.now(),
		});

		// Log activity
		await ctx.db.insert("activities", {
			userId: job.userId,
			action: "media.generated",
			resourceType: "imageGenerationJob",
			resourceId: args.jobId,
			metadata: {
				provider: job.provider,
				mediaType: args.resultType,
				correlationId: job.correlationId,
			},
			timestamp: Date.now(),
		});
	},
});

// Internal mutation: Mark job as failed
export const failJob = internalMutation({
	args: {
		jobId: v.id("imageGenerationJobs"),
		error: v.string(),
		attempts: v.number(),
	},
	handler: async (ctx, { jobId, error, attempts }) => {
		const job = await ctx.db.get(jobId);
		if (!job) {
			throw new ConvexError("Job not found");
		}

		await ctx.db.patch(jobId, {
			status: "failed",
			error,
			attempts,
			updatedAt: Date.now(),
		});

		// Log failure
		await ctx.db.insert("activities", {
			userId: job.userId,
			action: "image.generation.failed",
			resourceType: "imageGenerationJob",
			resourceId: jobId,
			metadata: { provider: job.provider, error, attempts },
			timestamp: Date.now(),
		});
	},
});
