import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { LanguageModel } from "ai";

export type ModelProvider = "openai" | "anthropic" | "google";

export function getChatModel(provider?: ModelProvider): LanguageModel {
  const selectedProvider = provider || (process.env.DEFAULT_AI_PROVIDER as ModelProvider) || "openai";
  
  switch(selectedProvider) {
    case "anthropic":
      return anthropic("claude-3-5-sonnet-20241022");
    case "google":
      return google("gemini-1.5-flash");
    case "openai":
    default:
      return openai("gpt-4o-mini");
  }
}

export function getEmbeddingModel() {
  // OpenAI's text-embedding-3-small is a good default
  // 1536 dimensions, good performance, cost-effective
  return openai.embedding("text-embedding-3-small");
}

export function getAdvancedModel(): LanguageModel {
  // Use more powerful models for complex tasks
  const provider = process.env.ADVANCED_AI_PROVIDER || process.env.DEFAULT_AI_PROVIDER || "openai";
  
  switch(provider) {
    case "anthropic":
      return anthropic("claude-3-5-sonnet-20241022");
    case "google":
      return google("gemini-1.5-pro");
    case "openai":
    default:
      return openai("gpt-4o");
  }
}

export function getVisionModel(): LanguageModel {
  // Models that support vision/image analysis
  const provider = process.env.VISION_AI_PROVIDER || process.env.DEFAULT_AI_PROVIDER || "openai";
  
  switch(provider) {
    case "anthropic":
      return anthropic("claude-3-5-sonnet-20241022");
    case "google":
      return google("gemini-1.5-pro");
    case "openai":
    default:
      return openai("gpt-4o");
  }
}