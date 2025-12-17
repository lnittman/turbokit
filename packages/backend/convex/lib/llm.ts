"use node";

/**
 * LLM Client with cost-efficient tier architecture
 *
 * PREMIUM tier: gpt-5, claude-sonnet-4.5 for heavy/global workflows
 * STANDARD tier: gpt-5-mini for user-scoped interactions
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { EmbeddingModel, LanguageModel } from "ai";
import { internal } from "../_generated/api";

// ==================== MODEL TIER DEFINITIONS ====================

export const MODEL_TIERS = {
  // Premium models for heavy lifting, global workflows
  PREMIUM: {
    openai: "gpt-5", // General intelligence
    anthropic: "claude-sonnet-4.5", // Complex reasoning
    embeddings: "text-embedding-3-small", // 1536-dim
  },

  // Standard models for user-scoped interactions
  STANDARD: {
    openai: "gpt-5-mini", // Fast, cheap, good quality
    embeddings: "text-embedding-3-small", // Same for both tiers
  },
} as const;

// ==================== OPERATION TO TIER MAPPING ====================

export const OPERATION_TIERS = {
  // PREMIUM operations (batch/global/expensive)
  recommendation_generation_batch: "PREMIUM",
  trending_analysis: "PREMIUM",
  interest_expansion: "PREMIUM",
  spot_quality_scoring: "PREMIUM",
  email_digest_generation: "PREMIUM",

  // STANDARD operations (user-scoped/real-time)
  user_search: "STANDARD",
  natural_language_query: "STANDARD",
  collection_suggestion: "STANDARD",
  trip_planning_assist: "STANDARD",
  review_sentiment: "STANDARD",
  quick_interest_match: "STANDARD",
  interest_suggestions: "STANDARD",
} as const;

type OperationName = keyof typeof OPERATION_TIERS;
type ModelTier = "PREMIUM" | "STANDARD";
type ModelProvider = "openai" | "anthropic";

// ==================== LLM CLIENT ====================

export class LLMClient {
  private openaiKey: string;
  private anthropicKey: string;

  constructor(apiKeys: { openai: string; anthropic?: string }) {
    this.openaiKey = apiKeys.openai;
    this.anthropicKey = apiKeys.anthropic || "";
  }

  /**
   * Get language model by tier and provider
   */
  getModel(tier: ModelTier, provider: ModelProvider = "openai"): LanguageModel {
    const config = MODEL_TIERS[tier];

    if (provider === "openai") {
      const openai = createOpenAI({
        apiKey: this.openaiKey,
      });
      return openai.chat(config.openai);
    }

    if (provider === "anthropic" && tier === "PREMIUM") {
      if (!this.anthropicKey) {
        // Fallback to OpenAI if Anthropic key not available
        const openai = createOpenAI({
          apiKey: this.openaiKey,
        });
        return openai.chat(config.openai);
      }
      const anthropic = createAnthropic({
        apiKey: this.anthropicKey,
      });
      const premiumConfig = MODEL_TIERS[tier];
      return anthropic.chat(premiumConfig.anthropic);
    }

    // Default to OpenAI standard
    const openai = createOpenAI({
      apiKey: this.openaiKey,
    });
    return openai.chat(MODEL_TIERS.STANDARD.openai);
  }

  /**
   * Get model by operation name (automatically selects tier)
   */
  getModelForOperation(
    operation: OperationName,
    preferredProvider?: ModelProvider
  ): LanguageModel {
    const tier = OPERATION_TIERS[operation] as ModelTier;
    return this.getModel(tier, preferredProvider);
  }

  /**
   * Get embedding model
   */
  getEmbeddingModel(): EmbeddingModel<string> {
    const openai = createOpenAI({
      apiKey: this.openaiKey,
    });
    return openai.embedding(MODEL_TIERS.PREMIUM.embeddings);
  }
}

// ==================== SERVER-SIDE INSTANCE ====================

let llmClient: LLMClient | null = null;

/**
 * Get singleton LLM client instance (server-side only)
 */
export function getLLMClient(): LLMClient {
  if (!llmClient) {
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured in environment variables");
    }

    llmClient = new LLMClient({
      openai: openaiKey,
      anthropic: anthropicKey,
    });
  }

  return llmClient;
}

// ==================== COST TRACKING ====================

export async function trackLLMUsage(
  ctx: any,
  params: {
    operation: string;
    tier: ModelTier;
    model: string;
    provider: ModelProvider;
    inputTokens: number;
    outputTokens: number;
    cached: boolean;
    userId?: any;
    metadata?: any;
  }
) {
  await ctx.db.insert("llmUsage", {
    operation: params.operation,
    tier: params.tier,
    model: params.model,
    provider: params.provider,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    cached: params.cached,
    userId: params.userId,
    metadata: params.metadata || {},
    timestamp: Date.now(),
  });
}

// ==================== RESPONSE CACHING ====================

/**
 * Cache expensive LLM calls with TTL
 */
export async function getCachedOrGenerate<T>(
  ctx: any,
  options: {
    operation: string;
    cacheKey: string;
    ttlMs: number;
    generator: () => Promise<T>;
    model?: string;
  }
): Promise<{ response: T; cached: boolean }> {
  // Check cache
  const cached = await ctx.db
    .query("modelCache")
    .withIndex("by_cache_key", (q: any) => q.eq("cacheKey", options.cacheKey))
    .first();

  if (cached && cached.expiresAt > Date.now()) {
    return {
      response: JSON.parse(cached.response) as T,
      cached: true,
    };
  }

  // Generate fresh response
  const response = await options.generator();

  // Store in cache
  await ctx.db.insert("modelCache", {
    cacheKey: options.cacheKey,
    response: JSON.stringify(response),
    model: options.model || "unknown",
    operation: options.operation,
    createdAt: Date.now(),
    expiresAt: Date.now() + options.ttlMs,
  });

  return { response, cached: false };
}

/**
 * Generate cache key from operation and params
 */
export function generateCacheKey(
  operation: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${JSON.stringify(params[key])}`)
    .join("|");
  return `${operation}:${sortedParams}`;
}

// ==================== RECOMMENDED TTLs ====================

export const CACHE_TTL = {
  // Very short (user-scoped, may change frequently)
  USER_SEARCH: 1000 * 60 * 60, // 1 hour
  QUICK_MATCH: 1000 * 60 * 30, // 30 minutes

  // Medium (updates daily)
  TRENDING_SPOTS: 1000 * 60 * 60 * 24, // 24 hours
  SPOT_DESCRIPTIONS: 1000 * 60 * 60 * 24, // 24 hours

  // Long (rarely changes)
  INTEREST_EXPANSION: 1000 * 60 * 60 * 24 * 7, // 7 days
  CITY_SUMMARIES: 1000 * 60 * 60 * 24 * 30, // 30 days
  SPOT_QUALITY: 1000 * 60 * 60 * 24 * 7, // 7 days
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if operation should use premium tier
 */
export function isPremiumOperation(operation: string): boolean {
  return OPERATION_TIERS[operation as OperationName] === "PREMIUM";
}

/**
 * Get recommended cache TTL for operation
 */
export function getRecommendedTTL(operation: string): number {
  // Map operations to cache TTLs
  if (operation.includes("trending")) return CACHE_TTL.TRENDING_SPOTS;
  if (operation.includes("search")) return CACHE_TTL.USER_SEARCH;
  if (operation.includes("expansion")) return CACHE_TTL.INTEREST_EXPANSION;
  if (operation.includes("city")) return CACHE_TTL.CITY_SUMMARIES;
  if (operation.includes("quality")) return CACHE_TTL.SPOT_QUALITY;

  // Default: 1 hour
  return CACHE_TTL.USER_SEARCH;
}

/**
 * Estimate cost for a call (rough estimates in USD)
 */
export function estimateCost(
  tier: ModelTier,
  provider: ModelProvider,
  inputTokens: number,
  outputTokens: number
): number {
  // Rough pricing (as of Jan 2025)
  const pricing: Record<string, { input: number; output: number }> = {
    "gpt-5": { input: 2.5 / 1_000_000, output: 10.0 / 1_000_000 },
    "gpt-5-mini": { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
    "claude-sonnet-4.5": { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
  };

  const model =
    tier === "PREMIUM"
      ? provider === "anthropic"
        ? "claude-sonnet-4.5"
        : "gpt-5"
      : "gpt-5-mini";

  const rates = pricing[model] || pricing["gpt-5-mini"];
  return inputTokens * rates.input + outputTokens * rates.output;
}
