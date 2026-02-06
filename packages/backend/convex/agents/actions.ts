import { action } from "../_generated/server";
import { v } from "convex/values";
import { requireAuthAction } from "../lib/auth";
import { checkAiTokenLimit } from "../lib/rateLimiter";
import { sendMessage as sendAssistantMessage } from "./definitions/assistant";
import { generateCode as generateCodeWithAgent } from "./definitions/codeGenerator";
import { internal } from "../_generated/api";
import { createThread as createAssistantThreadHelper } from "./definitions/assistant";

export const sendAIMessage = action({
  args: { threadId: v.string(), prompt: v.string() },
  handler: async (ctx, { threadId, prompt }) => {
    const { user } = await requireAuthAction(ctx);
    const estimatedTokens = Math.ceil((prompt.length * 2) / 4);
    await checkAiTokenLimit(ctx, user._id, estimatedTokens);
    const result = await sendAssistantMessage(ctx, threadId, prompt, user._id);
    await ctx.runMutation(internal.app.users.internal.logActivity, {
      userId: user._id,
      action: "ai.message.sent",
      resourceType: "thread",
      resourceId: threadId,
      metadata: { promptLength: prompt.length, estimatedTokens },
    });
    return result;
  },
});

export const generateAICode = action({
  args: { prompt: v.string(), language: v.optional(v.string()), context: v.optional(v.any()) },
  handler: async (ctx, { prompt, language, context }) => {
    const { user } = await requireAuthAction(ctx);
    const estimatedTokens = Math.ceil((prompt.length * 4) / 4);
    await checkAiTokenLimit(ctx, user._id, estimatedTokens);
    const result = await generateCodeWithAgent(ctx, prompt, language, context);
    await ctx.runMutation(internal.app.users.internal.logActivity, {
      userId: user._id,
      action: "ai.code.generated",
      resourceType: "code",
      resourceId: result.threadId,
      metadata: { language, promptLength: prompt.length, codeLength: result.code.length },
    });
    return result;
  },
});

export const createAssistantThread = action({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireAuthAction(ctx);
    const threadId = await createAssistantThreadHelper(ctx, user._id);
    await ctx.runMutation(internal.app.users.internal.logActivity, {
      userId: user._id,
      action: "ai.thread.created",
      resourceType: "thread",
      resourceId: threadId,
      metadata: { createdAt: Date.now() },
    });
    return { threadId } as const;
  },
});
