import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { loadPrompt } from "../../../../utils/loadPrompt";

/**
 * Agent for planning multiple book search queries based on a user prompt
 */
export const planSearchAgent = new Agent({
  name: "plan-search",
  instructions: loadPrompt("agents/plan-search/instructions.xml"),
  model: createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  })("openai/gpt-4.1"),
});
