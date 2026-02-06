import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction, internalQuery } from "../../_generated/server";
// TODO: Re-enable when @repo/media workspace package is properly resolved
// import { MediaClient } from "@repo/media";
// import { imageGenPool } from "../../lib/workpool";

// Internal action: Process image generation job
// TODO: Re-enable full implementation when @repo/media workspace package is properly resolved
export const processGeneration = internalAction({
	args: { jobId: v.id("imageGenerationJobs") },
	handler: async (ctx, { jobId }) => {
		// Get job
		const job = await ctx.runQuery(internal.app.images.internal.getJobById, {
			jobId,
		});

		if (!job) {
			console.error(`[IMAGES] Job ${jobId} not found`);
			return;
		}

		// Skip if already completed
		if (job.status === "completed") {
			console.log(`[IMAGES] Job ${jobId} already completed`);
			return;
		}

		// Update status to failed - media generation not yet configured
		await ctx.runMutation(internal.app.images.mutations.failJob, {
			jobId,
			error:
				"Media generation not yet configured. Install and configure @repo/media package.",
			attempts: job.attempts + 1,
		});

		console.error(`[IMAGES] Job ${jobId} failed: @repo/media not configured`);
	},
});

// Internal query: Get job by ID (for use in actions)
export const getJobById = internalQuery({
	args: { jobId: v.id("imageGenerationJobs") },
	handler: async (ctx, { jobId }) => {
		return await ctx.db.get(jobId);
	},
});
