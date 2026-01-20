import { internalAction, internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { ConvexError } from "convex/values";
import { MediaClient } from "@repo/media";
import { imageGenPool } from "../../lib/workpool";

// Internal action: Process image generation job
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

    // Update status to processing
    await ctx.runMutation(internal.app.images.mutations.updateJobStatus, {
      jobId,
      status: "processing",
      attempts: job.attempts + 1,
    });

    try {
      // Use workpool to limit concurrent generations
      const result = await imageGenPool.run(ctx, async () => {
        const mediaClient = new MediaClient({
          OPENAI_API_KEY: process.env.OPENAI_API_KEY,
          FAL_API_KEY: process.env.FAL_API_KEY,
          OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
          OPENROUTER_REFERER: process.env.OPENROUTER_REFERER,
          OPENROUTER_TITLE: process.env.OPENROUTER_TITLE,
        });

        switch (job.provider) {
          case "openai":
            return await mediaClient.generateWithOpenAI({
              prompt: job.prompt,
              model: job.model || "gpt-image-1",
              inputImage: job.inputImage,
              quality: (job.quality as any) || "high",
              size: (job.size as any) || "1024x1024",
              outputFormat: (job.outputFormat as any) || "png",
              numImages: job.numImages || 1,
            });

          case "fal":
            // Fal requires model + generic input
            if (!job.model) {
              throw new Error("Fal generation requires 'model' field in job");
            }
            return await mediaClient.generateWithFal({
              model: job.model,
              input: job.input || { prompt: job.prompt },
            });

          case "openrouter":
            return await mediaClient.generateWithOpenRouter({
              prompt: job.prompt,
              model: job.model || "google/gemini-2.5-flash-image-preview",
              aspectRatio: job.aspectRatio as any,
            });

          default:
            throw new Error(`Unknown provider: ${job.provider}`);
        }
      });

      // MediaResult is discriminated union - store type-specific fields
      await ctx.runMutation(internal.app.images.mutations.completeJob, {
        jobId,
        resultType: result.type,
        resultUrl: result.url,
        // Type-specific fields
        resultB64: result.type === "image" ? result.b64 : undefined,
        resultWidth: result.type === "image" ? result.width : undefined,
        resultHeight: result.type === "image" ? result.height : undefined,
        resultContentType: result.contentType,
        resultDuration: (result.type === "video" || result.type === "audio") ? result.duration : undefined,
        resultHasAudio: result.type === "video" ? result.hasAudio : undefined,
        resultFormat: result.type === "3d" ? result.format : undefined,
        resultPreviewUrl: result.type === "3d" ? result.previewUrl : undefined,
        metadata: result.meta,
      });

      console.log(
        `[IMAGES] Job ${jobId} completed (${job.provider}, ${result.type}, correlation: ${job.correlationId})`
      );
    } catch (error: any) {
      const attempts = job.attempts + 1;
      const maxAttempts = 3;

      console.error(
        `[IMAGES] Job ${jobId} failed (attempt ${attempts}/${maxAttempts}):`,
        error.message
      );

      if (attempts >= maxAttempts) {
        // Max attempts reached, mark as failed
        await ctx.runMutation(internal.app.images.mutations.failJob, {
          jobId,
          error: error.message || "Unknown error",
          attempts,
        });
      } else {
        // Retry with exponential backoff
        const backoffMs = Math.min(60_000, 2 ** attempts * 1000);
        await ctx.runMutation(internal.app.images.mutations.updateJobStatus, {
          jobId,
          status: "queued",
          attempts,
          error: `Attempt ${attempts} failed: ${error.message}. Retrying in ${backoffMs}ms`,
        });

        // Schedule retry
        await ctx.scheduler.runAfter(
          backoffMs,
          internal.app.images.internal.processGeneration,
          { jobId }
        );
      }
    }
  },
});

// Internal query: Get job by ID (for use in actions)
export const getJobById = internalQuery({
  args: { jobId: v.id("imageGenerationJobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db.get(jobId);
  },
});
