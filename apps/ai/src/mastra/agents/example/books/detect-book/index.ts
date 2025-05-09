import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { loadPrompt } from "../../../../utils/loadPrompt";

/**
 * Book detection agent specializing in analyzing images
 * to determine if they contain books and extract relevant details
 */
export const detectBookAgent = new Agent({
  name: "detect-book",
  instructions: loadPrompt("agents/detect-book/instructions.xml"),
  model: createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  })("openai/gpt-4.1"),
});

export default detectBookAgent;
