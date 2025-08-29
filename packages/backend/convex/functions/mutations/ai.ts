import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../../components/auth";
import { checkApiRateLimit } from "../../components/rate-limiter";
import { createThread } from "../../agents/assistant";

export const createAIThread = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, { title }) => {
    const { user } = await requireAuth(ctx);
    await checkApiRateLimit(ctx, user._id);
    
    // Create a new thread for the user
    const threadId = await createThread(ctx, user._id, title);
    
    // Store thread reference in activities
    await ctx.db.insert("activities", {
      userId: user._id,
      action: "ai.thread.created",
      resourceType: "thread",
      resourceId: threadId,
      metadata: { title },
      timestamp: Date.now(),
    });
    
    return { threadId };
  },
});

export const deleteAIThread = mutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, { threadId }) => {
    const { user } = await requireAuth(ctx);
    
    // TODO: Verify thread ownership before deletion
    // For now, just log the deletion
    await ctx.db.insert("activities", {
      userId: user._id,
      action: "ai.thread.deleted",
      resourceType: "thread",
      resourceId: threadId,
      timestamp: Date.now(),
    });
    
    return { success: true };
  },
});