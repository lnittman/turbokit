/**
 * Hook factory for fetching available models from providers
 * Creates a type-safe hook that uses your Convex API
 *
 * @example
 * ```tsx
 * // In your app, create the hook once:
 * // apps/app/src/hooks/useAvailableModels.ts
 * import { createUseAvailableModels } from '@repo/media/react';
 * import { api } from '@/convex/_generated/api';
 *
 * export const useAvailableModels = createUseAvailableModels(api);
 * ```
 *
 * ```tsx
 * // Then use it anywhere in your app:
 * const { models, isLoading } = useAvailableModels('openai');
 * const { models } = useAvailableModels('openrouter', { outputModalities: ['image'] });
 * ```
 */

import type { ModelInfo } from '../types/enums';

export interface UseAvailableModelsOptions {
  /** For OpenRouter: filter by output modalities (e.g., ['image', 'text']) */
  outputModalities?: string[];
}

export interface UseAvailableModelsResult {
  /** Available models (empty array while loading) */
  models: ModelInfo[];
  /** Whether models are currently being loaded */
  isLoading: boolean;
  /** Whether data is from cache */
  cached?: boolean;
  /** Whether cached data is stale (refresh in progress) */
  stale?: boolean;
  /** When models were last fetched */
  fetchedAt?: number;
  /** For Fal.ai: info about browsing models */
  info?: {
    message: string;
    url: string;
    note: string;
  };
}

/**
 * Creates a useAvailableModels hook for your app
 * Pass your Convex API object to make it type-safe
 *
 * @param api - Your Convex API object from convex/_generated/api
 * @returns A hook function for fetching available models
 */
export function createUseAvailableModels(api: any) {
  return function useAvailableModels(
    provider: 'openai' | 'openrouter' | 'fal',
    options?: UseAvailableModelsOptions
  ): UseAvailableModelsResult {
    // Lazy import to avoid bundling Convex in non-React environments
    let useQuery: any;
    try {
      useQuery = require('convex/react').useQuery;
    } catch {
      throw new Error(
        'convex/react not found. Make sure you have Convex installed and configured.'
      );
    }

    if (provider === 'fal') {
      const info = useQuery(api.app.models.getFalInfo, {});
      return {
        models: [],
        isLoading: info === undefined,
        info,
      };
    }

    const data = useQuery(api.app.models.list, {
      provider,
      outputModalities: options?.outputModalities,
    });

    return {
      models: data?.models || [],
      isLoading: data === undefined,
      cached: data?.cached,
      stale: data?.stale,
      fetchedAt: data?.fetchedAt,
    };
  };
}
