import { Agent } from "@convex-dev/agent";
import { components } from "../../_generated/api";
import { getChatModel } from "../../lib/models";

export const assistantAgent = new Agent(components.agent, {
	name: "assistant",
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
	languageModel: getChatModel() as any,
	tools: {
		// Add custom tools here as needed
	},
});

// Helper function to create a new conversation thread
export async function createThread(ctx: any, userId: string, title?: string) {
	const { threadId } = await assistantAgent.createThread(ctx, {
		userId,
		title: title || "New conversation",
	});
	return threadId;
}

// Helper to send a message and get response
export async function sendMessage(
	ctx: any,
	threadId: string,
	prompt: string,
	userId: string,
) {
	// Persist the user message and stream a reply with deltas saved
	const { saveMessage } = await import("@convex-dev/agent");
	const { messageId } = await saveMessage(ctx, components.agent, {
		threadId,
		userId,
		prompt,
	});

	const result = await assistantAgent.streamText(
		ctx,
		{ threadId },
		{ prompt },
		{ saveStreamDeltas: true },
	);

	// Consume the stream to ensure it completes
	await result.consumeStream();

	return { success: true, messageId };
}
