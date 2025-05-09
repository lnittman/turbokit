import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { jinaReader } from "../../../../tools/jina";
import { loadPrompt } from "../../../../utils/loadPrompt";

/**
 * Agent for listing books based on a search query, using LLM and optionally web search tools
 */
export const getBookAgent = new Agent({
  name: "get-book",
  instructions: loadPrompt("agents/get-book/instructions.xml"),
  model: createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  })("openai/gpt-4.1"),
  tools: { "jinaReadUrl": jinaReader },
});

export default getBookAgent; 