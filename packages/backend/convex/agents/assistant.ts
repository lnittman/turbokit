import { Agent } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { getChatModel, getEmbeddingModel } from "../lib/models";

export const assistantAgent = new Agent(components.agent, {
  name: "assistant",
  description: "General purpose AI assistant for TurboKit applications",
  instructions: `
You are a helpful AI assistant for the TurboKit platform.

Your capabilities include:
- Answering questions about the application
- Helping users navigate features
- Providing guidance and recommendations
- Assisting with troubleshooting

Guidelines:
- Be concise and helpful
- Use a friendly, professional tone
- Provide accurate information
- Admit when you don't know something
- Never share sensitive user information
  `,
  model: getChatModel(),
  embedding: getEmbeddingModel(),
  tools: {
    // Add custom tools here as needed
  },
});

// Helper function to create a new conversation thread
export async function createThread(
  ctx: any,
  userId: string,
  title?: string
) {
  const { threadId } = await assistantAgent.createThread(ctx, {
    userId,
    title: title || "New conversation",
    metadata: {
      createdAt: Date.now(),
    },
  });
  return threadId;
}

// Helper to send a message and get response
export async function sendMessage(
  ctx: any,
  threadId: string,
  prompt: string,
  userId: string
) {
  const { thread } = await assistantAgent.continueThread(ctx, { threadId });
  
  // Save the user message
  const { messageId } = await thread.saveMessage({
    role: "user",
    content: [{ type: "text", text: prompt }],
    userId,
  });
  
  // Generate and stream the response
  const result = await thread.streamText(
    { promptMessageId: messageId },
    { saveStreamDeltas: true }
  );
  
  // Consume the stream to ensure it completes
  await result.consumeStream();
  
  return { success: true, messageId };
}
