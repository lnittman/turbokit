import { useCallback, useMemo } from 'react';
import { Provider } from '../types/enums';
import { useMediaBase } from './useMediaBase';
import type { MediaResult } from '../types/results';
import type { FalInput } from '../types/inputs';

export interface UseFalParams {
  /** Fal.ai API key (defaults to process.env.NEXT_PUBLIC_FAL_API_KEY) */
  apiKey?: string;
}

export interface UseFalResult {
  /** Generated media result (can be image, video, audio, or 3D) */
  result: MediaResult | null;
  /** Whether generation is in progress */
  isLoading: boolean;
  /** Error if generation failed */
  error: any;
  /** Generate media with any Fal model */
  generate: (input: FalInput) => Promise<MediaResult>;
  /** Cancel ongoing generation */
  cancel: () => void;
}

/**
 * React hook for Fal.ai media generation
 * Supports 600+ models across images, video, audio, and 3D
 *
 * @example
 * ```tsx
 * const { result, isLoading, generate } = useFal({
 *   apiKey: process.env.NEXT_PUBLIC_FAL_API_KEY
 * });
 *
 * // Generate image
 * const img = await generate({
 *   model: 'fal-ai/flux-pro',
 *   input: { prompt: 'A cat', image_size: { width: 1024, height: 1024 } },
 * });
 *
 * // Generate video
 * const vid = await generate({
 *   model: 'fal-ai/veo3',
 *   input: { prompt: 'Cinematic shot', duration_seconds: 5 },
 * });
 *
 * // Type discrimination
 * if (result?.type === 'video') {
 *   console.log(result.duration, result.hasAudio);
 * }
 * ```
 */
export function useFal(params: UseFalParams = {}): UseFalResult {
  const apiKey = useMemo(
    () => params.apiKey || process.env.NEXT_PUBLIC_FAL_API_KEY || '',
    [params.apiKey]
  );

  const base = useMediaBase<MediaResult>(Provider.FAL);

  const generate = useCallback(
    async (input: FalInput): Promise<MediaResult> => {
      return base.execute(async (signal) => {
        if (!apiKey) {
          throw new Error('FAL_API_KEY is required. Pass it as a param or set NEXT_PUBLIC_FAL_API_KEY');
        }

        // Dynamic import to avoid bundling in server environments
        const { MediaClient } = await import('../client');

        const client = new MediaClient({ FAL_API_KEY: apiKey });
        const result = await client.generateWithFal(input);

        // TODO: Handle abort signal if needed
        // The MediaClient doesn't support abort signals yet

        return result;
      });
    },
    [apiKey, base]
  );

  return {
    result: base.result,
    isLoading: base.isLoading,
    error: base.error,
    generate,
    cancel: base.cancel,
  };
}
