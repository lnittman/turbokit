import { query } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../../lib/auth";
import { ConvexError } from "convex/values";

// Get a specific job by ID
export const getJob = query({
  args: { jobId: v.id("imageGenerationJobs") },
  handler: async (ctx, { jobId }) => {
    const { user } = await requireAuth(ctx);

    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new ConvexError("Job not found");
    }

    // Ensure user owns this job
    if (job.userId !== user._id) {
      throw new ConvexError("Unauthorized");
    }

    return job;
  },
});

// List user's generation jobs
export const listJobs = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("queued"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
  },
  handler: async (ctx, { limit = 50, status }) => {
    const { user } = await requireAuth(ctx);

    let jobsQuery = ctx.db
      .query("imageGenerationJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc");

    if (status) {
      jobsQuery = ctx.db
        .query("imageGenerationJobs")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", status)
        )
        .order("desc");
    }

    return await jobsQuery.take(limit);
  },
});

// Get user's latest job
export const getLatestJob = query({
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);

    return await ctx.db
      .query("imageGenerationJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
  },
});

// Count jobs by status
export const countJobsByStatus = query({
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);

    const [queued, processing, completed, failed] = await Promise.all([
      ctx.db
        .query("imageGenerationJobs")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", "queued")
        )
        .collect(),
      ctx.db
        .query("imageGenerationJobs")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", "processing")
        )
        .collect(),
      ctx.db
        .query("imageGenerationJobs")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", "completed")
        )
        .collect(),
      ctx.db
        .query("imageGenerationJobs")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", "failed")
        )
        .collect(),
    ]);

    return {
      queued: queued.length,
      processing: processing.length,
      completed: completed.length,
      failed: failed.length,
      total: queued.length + processing.length + completed.length + failed.length,
    };
  },
});
