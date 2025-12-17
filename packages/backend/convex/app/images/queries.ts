import { v } from "convex/values";
import { query } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";

/**
 * Get an image generation job by ID
 */
export const getJob = query({
  args: { jobId: v.id("imageJobs") },
  handler: async (ctx, { jobId }) => {
    const { user } = await requireAuth(ctx);
    const job = await ctx.db.get(jobId);

    if (!job || job.userId !== user._id) {
      return null;
    }

    return job;
  },
});

/**
 * List user's image generation jobs
 */
export const listJobs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 20 }) => {
    const { user } = await requireAuth(ctx);

    return await ctx.db
      .query("imageJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
  },
});
