import { useCallback, useMemo } from 'react';
import { Provider } from '../types/enums';
import { useMediaBase } from './useMediaBase';
import type { ImageMediaResult } from '../types/results';
import type { OpenRouterImageInput } from '../types/inputs';

export interface UseOpenRouterParams {
  /** OpenRouter API key (defaults to process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) */
  apiKey?: string;
  /** HTTP-Referer header for OpenRouter (defaults to https://turbokit.dev) */
  referer?: string;
  /** X-Title header for OpenRouter (defaults to TurboKit) */
  title?: string;
}

export interface UseOpenRouterResult {
  /** Generated image result (null until generation completes) */
  image: ImageMediaResult | null;
  /** Whether generation is in progress */
  isLoading: boolean;
  /** Error if generation failed */
  error: any;
  /** Generate an image */
  generate: (input: OpenRouterImageInput) => Promise<ImageMediaResult>;
  /** Cancel ongoing generation */
  cancel: () => void;
}

/**
 * React hook for OpenRouter image generation
 * Supports Gemini 2.5 Flash Image Preview and other image models
 *
 * @example
 * ```tsx
 * const { image, isLoading, generate } = useOpenRouter({
 *   apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
 *   referer: 'https://your-app.com',
 *   title: 'Your App'
 * });
 *
 * await generate({
 *   prompt: 'A futuristic cityscape',
 *   model: 'google/gemini-2.5-flash-image-preview',
 *   aspectRatio: '16:9',
 * });
 * ```
 */
export function useOpenRouter(params: UseOpenRouterParams = {}): UseOpenRouterResult {
  const apiKey = useMemo(
    () => params.apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
    [params.apiKey]
  );
  const referer = useMemo(
    () => params.referer || 'https://turbokit.dev',
    [params.referer]
  );
  const title = useMemo(
    () => params.title || 'TurboKit',
    [params.title]
  );

  const base = useMediaBase<ImageMediaResult>(Provider.OPENROUTER);

  const generate = useCallback(
    async (input: OpenRouterImageInput): Promise<ImageMediaResult> => {
      return base.execute(async (signal) => {
        if (!apiKey) {
          throw new Error('OPENROUTER_API_KEY is required. Pass it as a param or set NEXT_PUBLIC_OPENROUTER_API_KEY');
        }

        // Dynamic import to avoid bundling in server environments
        const { MediaClient } = await import('../client');

        const client = new MediaClient({
          OPENROUTER_API_KEY: apiKey,
          OPENROUTER_REFERER: referer,
          OPENROUTER_TITLE: title,
        });
        const result = await client.generateWithOpenRouter(input);

        // TODO: Handle abort signal if needed
        // The MediaClient doesn't support abort signals yet

        return result;
      });
    },
    [apiKey, referer, title, base]
  );

  return {
    image: base.result,
    isLoading: base.isLoading,
    error: base.error,
    generate,
    cancel: base.cancel,
  };
}
