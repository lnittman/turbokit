import { createTool } from "@mastra/core/tools";

import { jinaReaderInputSchema, jinaReaderOutputSchema } from "./schema.js";

/**
 * Jina reader tool for extracting content from web pages
 * Supports r.jina.ai URLs for optimized reading experience
 */
export const jinaReader = createTool({
  id: "jinaReadUrl",
  description: "Reads content from a webpage using r.jina.ai reader service",
  inputSchema: jinaReaderInputSchema,
  outputSchema: jinaReaderOutputSchema,
  execute: async ({ context }) => {
    const { url } = context;

    try {
      // Ensure URL is in r.jina.ai format
      const jinaUrl = url.startsWith("https://r.jina.ai/") ? url 
        : `https://r.jina.ai/${encodeURIComponent(url)}`;

      console.log("[jinaReader] fetching Jina Reader URL:", jinaUrl);

      // Fetch the content from r.jina.ai
      const response = await fetch(jinaUrl, {
        headers: {
          "Accept": "text/html,application/xhtml+xml,application/xml",
          "User-Agent": "Mastra/1.0 (Books App)"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch content from r.jina.ai: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();

      return {
        content,
        url: jinaUrl,
        success: true
      };
    } catch (error) {
      console.error("Error reading URL with Jina:", error);

      return {
        content: "",
        url,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
});

export default jinaReader;
