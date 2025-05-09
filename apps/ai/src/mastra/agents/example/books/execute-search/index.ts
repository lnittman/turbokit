import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { searchMCP } from '../../../mcp.js';
import { loadPrompt } from "../../../../utils/loadPrompt.js";

const tools = await searchMCP.getTools();

/**
 * Agent for listing books based on a search query, using LLM and optionally web search tools
 */
export const executeSearchAgent = new Agent({
  name: "execute-search",
  instructions: loadPrompt("agents/execute-search/instructions.xml"),
  model: createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  })("openai/gpt-4.1"),
  tools: { firecrawl_firecrawl_search: tools.firecrawl_firecrawl_search }
});

export default executeSearchAgent;
