import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { JobStatus, providerValidator } from "./types";

/**
 * Start an image generation job
 * Uses the mutation-schedules-action pattern for reliability
 */
export const startGeneration = mutation({
  args: {
    prompt: v.string(),
    provider: v.optional(providerValidator),
    inputImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { prompt, provider = "openai", inputImageUrl }) => {
    const { user } = await requireAuth(ctx);

    // Idempotency: check for existing queued job with same prompt
    const existing = await ctx.db
      .query("imageJobs")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", JobStatus.QUEUED)
      )
      .first();

    if (existing && existing.prompt === prompt) {
      return { jobId: existing._id };
    }

    // Create job record
    const jobId = await ctx.db.insert("imageJobs", {
      userId: user._id,
      prompt,
      provider,
      inputImageUrl,
      status: JobStatus.QUEUED,
      attempts: 0,
      correlationId: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Schedule action immediately
    await ctx.scheduler.runAfter(0, internal.app.images.actions.processJob, {
      jobId,
    });

    return { jobId };
  },
});
