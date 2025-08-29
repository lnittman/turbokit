import { action } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuthAction } from "../../components/auth";
import { checkAiTokenLimit } from "../../components/rate-limiter";
import { sendMessage } from "../../agents/assistant";
import { generateCode } from "../../agents/code-generator";
import { api } from "../../_generated/api";

export const sendAIMessage = action({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, prompt }) => {
    const { user } = await requireAuthAction(ctx);
    
    // Estimate tokens (rough: 1 token ≈ 4 characters)
    const estimatedTokens = Math.ceil((prompt.length * 2) / 4); // x2 for response
    await checkAiTokenLimit(ctx, user._id, estimatedTokens);
    
    // Send message and get response
    const result = await sendMessage(ctx, threadId, prompt, user._id);
    
    // Log activity
    await ctx.runMutation(api.functions.internal.users.logActivity, {
      userId: user._id,
      action: "ai.message.sent",
      resourceType: "thread",
      resourceId: threadId,
      metadata: { 
        promptLength: prompt.length,
        estimatedTokens,
      },
    });
    
    return result;
  },
});

export const generateAICode = action({
  args: {
    prompt: v.string(),
    language: v.optional(v.string()),
    context: v.optional(v.any()),
  },
  handler: async (ctx, { prompt, language, context }) => {
    const { user } = await requireAuthAction(ctx);
    
    // Higher token limit for code generation
    const estimatedTokens = Math.ceil((prompt.length * 4) / 4); // x4 for code output
    await checkAiTokenLimit(ctx, user._id, estimatedTokens);
    
    // Generate the code
    const result = await generateCode(ctx, prompt, language, context);
    
    // Log activity
    await ctx.runMutation(api.functions.internal.users.logActivity, {
      userId: user._id,
      action: "ai.code.generated",
      resourceType: "code",
      resourceId: result.threadId,
      metadata: { 
        language,
        promptLength: prompt.length,
        codeLength: result.code.length,
      },
    });
    
    return result;
  },
});