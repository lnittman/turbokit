import { MCPConfiguration } from "@mastra/mcp";

// Set up MCP configuration with Firecrawl server
export const searchMCP = new MCPConfiguration({
    id: "search-books",
    servers: {
      firecrawl: {
        command: "npx",
        args: ["-y", "firecrawl-mcp"],
        env: {
          FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY || "",
        },
      },
    },
});

