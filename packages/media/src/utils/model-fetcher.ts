/**
 * Dynamic model fetching utilities (SERVER-ONLY)
 *
 * ⚠️ WARNING: These functions should ONLY be called from Convex actions
 * They require API keys and should not be exposed to the client
 *
 * For client-side model listing, use the Convex queries:
 * - useQuery(api.app.models.list, { provider: 'openai' })
 * - useQuery(api.app.models.list, { provider: 'openrouter', outputModalities: ['image'] })
 */

import type { ModelInfo } from '../types/enums';

/**
 * Cache for model lists to avoid excessive API calls
 */
const modelCache = new Map<string, { models: ModelInfo[]; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached(key: string): ModelInfo[] | null {
  const cached = modelCache.get(key);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    modelCache.delete(key);
    return null;
  }

  return cached.models;
}

function setCache(key: string, models: ModelInfo[]): void {
  modelCache.set(key, { models, timestamp: Date.now() });
}

/**
 * Fetch available models from OpenAI
 * Filters for image generation models (gpt-image-*)
 */
export async function fetchOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
  const cacheKey = `openai:${apiKey.slice(0, 8)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey });
    const response = await client.models.list();

    // Filter for image models
    const imageModels = response.data
      .filter((model) => model.id.includes('gpt-image') || model.id.includes('dall-e'))
      .map((model) => ({
        id: model.id,
        name: model.id,
        capabilities: ['image'],
        meta: {
          created: model.created,
          owned_by: model.owned_by,
        },
      }));

    setCache(cacheKey, imageModels);
    return imageModels;
  } catch (error: any) {
    throw new Error(`Failed to fetch OpenAI models: ${error.message}`);
  }
}

/**
 * Fetch available models from OpenRouter
 * Can filter by output modalities (e.g., ['image'])
 */
export async function fetchOpenRouterModels(
  apiKey: string,
  filters?: {
    outputModalities?: string[];
  }
): Promise<ModelInfo[]> {
  const filterKey = filters?.outputModalities?.join(',') || 'all';
  const cacheKey = `openrouter:${apiKey.slice(0, 8)}:${filterKey}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let models = data.data || [];

    // Filter by output modalities if specified
    if (filters?.outputModalities) {
      models = models.filter((model: any) =>
        filters.outputModalities!.some((mod) => model.architecture?.output_modalities?.includes(mod))
      );
    }

    const modelInfos: ModelInfo[] = models.map((model: any) => ({
      id: model.id,
      name: model.name || model.id,
      description: model.description,
      capabilities: model.architecture?.output_modalities || [],
      pricing: {
        input: model.pricing?.prompt ? parseFloat(model.pricing.prompt) * 1_000_000 : undefined,
        output: model.pricing?.completion ? parseFloat(model.pricing.completion) * 1_000_000 : undefined,
      },
      meta: {
        context_length: model.context_length,
        top_provider: model.top_provider,
      },
    }));

    setCache(cacheKey, modelInfos);
    return modelInfos;
  } catch (error: any) {
    throw new Error(`Failed to fetch OpenRouter models: ${error.message}`);
  }
}

/**
 * Fetch available models from Fal.ai
 * Note: Fal.ai does not provide a public API for listing models
 * Users should browse https://fal.ai/models to discover available models
 *
 * This function returns a static note directing users to the website
 */
export function getFalModelInfo(): { message: string; url: string } {
  return {
    message: 'Fal.ai has 600+ models but does not provide a public listing API. Browse available models at:',
    url: 'https://fal.ai/models',
  };
}

/**
 * Clear the model cache
 * Useful when API keys change or to force refresh
 */
export function clearModelCache(): void {
  modelCache.clear();
}
