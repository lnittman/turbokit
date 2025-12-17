"use node";

import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { JobStatus } from "./types";

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

/**
 * Process an image generation job
 * Placeholder implementation - add provider logic as needed
 */
export const processJob = internalAction({
  args: { jobId: v.id("imageJobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.runQuery(
      internal.app.images.internal.getJobInternal,
      {
        jobId,
      }
    );

    if (!job || job.status === JobStatus.COMPLETED) {
      return;
    }

    // Update to processing
    await ctx.runMutation(internal.app.images.internal.updateJobStatus, {
      jobId,
      status: JobStatus.PROCESSING,
      attempts: job.attempts + 1,
    });

    try {
      // TODO: Implement provider-specific generation
      // For now, throw to indicate not implemented
      throw new Error(
        `Image generation not implemented. Provider: ${job.provider}, Prompt: ${job.prompt}`
      );

      // When implemented:
      // const result = await generateImage(job.provider, job.prompt, job.inputImageUrl);
      // await ctx.runMutation(internal.app.images.internal.completeJob, {
      //   jobId,
      //   result,
      // });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (job.attempts + 1 >= MAX_RETRIES) {
        await ctx.runMutation(internal.app.images.internal.failJob, {
          jobId,
          error: errorMessage,
        });
        return;
      }

      // Retry with exponential backoff
      const backoffMs = Math.min(60_000, BASE_BACKOFF_MS * 2 ** job.attempts);
      await ctx.scheduler.runAfter(
        backoffMs,
        internal.app.images.actions.processJob,
        { jobId }
      );

      await ctx.runMutation(internal.app.images.internal.updateJobStatus, {
        jobId,
        status: JobStatus.QUEUED,
      });
    }
  },
});
