import { useCallback, useMemo } from 'react';
import { Provider } from '../types/enums';
import { useMediaBase } from './useMediaBase';
import type { ImageMediaResult } from '../types/results';
import type { OpenAIImageInput } from '../types/inputs';

export interface UseOpenAIParams {
  /** OpenAI API key (defaults to process.env.NEXT_PUBLIC_OPENAI_API_KEY) */
  apiKey?: string;
}

export interface UseOpenAIResult {
  /** Generated image result (null until generation completes) */
  image: ImageMediaResult | null;
  /** Whether generation is in progress */
  isLoading: boolean;
  /** Error if generation failed */
  error: any;
  /** Generate an image */
  generate: (input: OpenAIImageInput) => Promise<ImageMediaResult>;
  /** Cancel ongoing generation */
  cancel: () => void;
}

/**
 * React hook for OpenAI image generation
 * Supports gpt-image-1 and gpt-image-1-mini models
 *
 * @example
 * ```tsx
 * const { image, isLoading, generate } = useOpenAI({
 *   apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
 * });
 *
 * await generate({
 *   prompt: 'A beautiful sunset',
 *   model: 'gpt-image-1',
 *   quality: 'high',
 * });
 * ```
 */
export function useOpenAI(params: UseOpenAIParams = {}): UseOpenAIResult {
  const apiKey = useMemo(
    () => params.apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    [params.apiKey]
  );

  const base = useMediaBase<ImageMediaResult>(Provider.OPENAI);

  const generate = useCallback(
    async (input: OpenAIImageInput): Promise<ImageMediaResult> => {
      return base.execute(async (signal) => {
        if (!apiKey) {
          throw new Error('OPENAI_API_KEY is required. Pass it as a param or set NEXT_PUBLIC_OPENAI_API_KEY');
        }

        // Dynamic import to avoid bundling in server environments
        const { MediaClient } = await import('../client');

        const client = new MediaClient({ OPENAI_API_KEY: apiKey });
        const result = await client.generateWithOpenAI(input);

        // TODO: Handle abort signal if needed
        // The MediaClient doesn't support abort signals yet

        return result;
      });
    },
    [apiKey, base]
  );

  return {
    image: base.result,
    isLoading: base.isLoading,
    error: base.error,
    generate,
    cancel: base.cancel,
  };
}

// Backward compatibility: export as useImageGen1
export { useOpenAI as useImageGen1 };
