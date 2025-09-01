import { createOpenAI } from "@ai-sdk/openai";
import { LanguageModel } from "ai";

// Configure OpenRouter (OpenAI-compatible gateway)
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  headers: {
    ...(process.env.OPENROUTER_REFERER ? { "HTTP-Referer": process.env.OPENROUTER_REFERER } : {}),
    ...(process.env.OPENROUTER_TITLE ? { "X-Title": process.env.OPENROUTER_TITLE } : {}),
  },
});

export function getChatModel(): LanguageModel {
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-5"; // default per TurboKit preference
  return openrouter(model);
}

export function getEmbeddingModel() {
  // Default to OpenAI small embeddings via OpenRouter
  const model = process.env.OPENROUTER_EMBEDDING_MODEL || "openai/text-embedding-3-small";
  return openrouter.embedding(model);
}

export function getAdvancedModel(): LanguageModel {
  // Use the same default unless overridden
  const model = process.env.OPENROUTER_ADVANCED_MODEL || process.env.OPENROUTER_MODEL || "openai/gpt-5";
  return openrouter(model);
}

export function getVisionModel(): LanguageModel {
  // GPT-5 is vision-capable; default to unified chat model unless overridden
  const model = process.env.OPENROUTER_VISION_MODEL || process.env.OPENROUTER_MODEL || "openai/gpt-5";
  return openrouter(model);
}
