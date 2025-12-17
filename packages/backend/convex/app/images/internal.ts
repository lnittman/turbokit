import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../_generated/server";
import { JobStatus } from "./types";

/**
 * Get job (internal, no auth check)
 */
export const getJobInternal = internalQuery({
  args: { jobId: v.id("imageJobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db.get(jobId);
  },
});

/**
 * Update job status
 */
export const updateJobStatus = internalMutation({
  args: {
    jobId: v.id("imageJobs"),
    status: v.string(),
    attempts: v.optional(v.number()),
  },
  handler: async (ctx, { jobId, status, attempts }) => {
    const updates: Record<string, unknown> = {
      status,
      updatedAt: Date.now(),
    };

    if (attempts !== undefined) {
      updates.attempts = attempts;
    }

    await ctx.db.patch(jobId, updates);
  },
});

/**
 * Complete job with result
 */
export const completeJob = internalMutation({
  args: {
    jobId: v.id("imageJobs"),
    result: v.object({
      url: v.string(),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      contentType: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { jobId, result }) => {
    await ctx.db.patch(jobId, {
      status: JobStatus.COMPLETED,
      result,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Fail job with error
 */
export const failJob = internalMutation({
  args: {
    jobId: v.id("imageJobs"),
    error: v.string(),
  },
  handler: async (ctx, { jobId, error }) => {
    await ctx.db.patch(jobId, {
      status: JobStatus.FAILED,
      error,
      updatedAt: Date.now(),
    });
  },
});
