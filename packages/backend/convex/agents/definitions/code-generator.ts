import { Agent } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { getAdvancedModel, getEmbeddingModel } from "../lib/models";

export const codeGeneratorAgent = new Agent(components.agent, {
  name: "code-generator",
  instructions: `
You are an expert code generation AI assistant.

Your responsibilities:
- Generate high-quality, production-ready code
- Follow best practices and design patterns
- Write clean, maintainable, and well-documented code
- Consider edge cases and error handling
- Optimize for performance and security

Guidelines:
- Always use TypeScript for type safety
- Follow the project's coding standards
- Include appropriate error handling
- Add comments for complex logic
- Consider accessibility and user experience
- Write code that is testable and modular

When generating code:
1. First understand the requirements
2. Plan the structure and approach
3. Implement with best practices
4. Include necessary imports and types
5. Add error handling and validation
  `,
  languageModel: getAdvancedModel() as any, // Use more powerful model for code generation
  tools: {
    // Could add tools for:
    // - Searching documentation
    // - Running code snippets
    // - Validating syntax
    // - Fetching examples
  },
});

export async function generateCode(
  ctx: any,
  prompt: string,
  language: string = "typescript",
  context?: any
) {
  // Create a single-use thread for code generation
  const { threadId } = await codeGeneratorAgent.createThread(ctx, {});
  
  // Format the prompt with context
  const fullPrompt = `
Language: ${language}
Context: ${context ? JSON.stringify(context, null, 2) : "None"}

Request: ${prompt}

Please generate the requested code following best practices.
  `;
  
  // Get the response
  const result = await codeGeneratorAgent.generateText(
    ctx,
    { threadId },
    { prompt: fullPrompt }
  );
  
  return {
    code: result.text,
    threadId,
  };
}
