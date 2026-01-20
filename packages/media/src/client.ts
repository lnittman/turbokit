import { OpenAIAdapter } from './adapters/openai';
import { FalAdapter } from './adapters/fal';
import { OpenRouterAdapter } from './adapters/openrouter';
import type { MediaResult, ImageMediaResult } from './types/results';
import type { OpenAIImageInput, FalInput, OpenRouterImageInput } from './types/inputs';

/**
 * MediaClient configuration
 */
export interface MediaClientConfig {
  /** OpenAI API key */
  OPENAI_API_KEY?: string;
  /** Fal.ai API key */
  FAL_API_KEY?: string;
  /** OpenRouter API key */
  OPENROUTER_API_KEY?: string;
  /** OpenRouter HTTP-Referer header (optional) */
  OPENROUTER_REFERER?: string;
  /** OpenRouter X-Title header (optional) */
  OPENROUTER_TITLE?: string;
}

/**
 * MediaClient - Multi-modal media generation
 * Supports images, video, audio, and 3D generation across multiple providers
 *
 * @example
 * ```typescript
 * const client = new MediaClient({
 *   OPENAI_API_KEY: process.env.OPENAI_API_KEY,
 *   FAL_API_KEY: process.env.FAL_API_KEY,
 *   OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
 * });
 *
 * // Generate image with OpenAI
 * const result = await client.generateWithOpenAI({
 *   prompt: 'A beautiful sunset',
 *   model: 'gpt-image-1',
 * });
 *
 * // Generate video with Fal
 * const video = await client.generateWithFal({
 *   model: 'fal-ai/veo3',
 *   input: { prompt: 'A cinematic shot', duration_seconds: 5 },
 * });
 * ```
 */
export class MediaClient {
  private openaiAdapter: OpenAIAdapter | null = null;
  private falAdapter: FalAdapter | null = null;
  private openrouterAdapter: OpenRouterAdapter | null = null;

  constructor(private config: MediaClientConfig = {}) {}

  /**
   * Generate images with OpenAI models
   * Supports gpt-image-1 and gpt-image-1-mini
   *
   * Use fetchOpenAIModels() to get current available models
   */
  async generateWithOpenAI(input: OpenAIImageInput): Promise<ImageMediaResult> {
    const apiKey = this.config.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required. Set it in config or environment.');
    }

    if (!this.openaiAdapter) {
      this.openaiAdapter = new OpenAIAdapter({ apiKey });
    }

    return await this.openaiAdapter.generateImage(input);
  }

  /**
   * Generate media with Fal.ai models
   * Supports 600+ models across images, video, audio, and 3D
   *
   * Browse available models at https://fal.ai/models
   *
   * @example
   * ```typescript
   * // Image
   * const img = await client.generateWithFal({
   *   model: 'fal-ai/flux-pro',
   *   input: { prompt: 'A cat', image_size: { width: 1024, height: 1024 } },
   * });
   *
   * // Video
   * const vid = await client.generateWithFal({
   *   model: 'fal-ai/veo3',
   *   input: { prompt: 'Cinematic shot', duration_seconds: 5 },
   * });
   * ```
   */
  async generateWithFal(input: FalInput): Promise<MediaResult> {
    const apiKey = this.config.FAL_API_KEY || process.env.FAL_API_KEY;
    if (!apiKey) {
      throw new Error('FAL_API_KEY is required. Set it in config or environment.');
    }

    if (!this.falAdapter) {
      this.falAdapter = new FalAdapter({ apiKey });
    }

    return await this.falAdapter.generate(input);
  }

  /**
   * Generate images with OpenRouter models
   * Supports image generation models like Gemini 2.5 Flash Image Preview
   *
   * Use fetchOpenRouterModels() to get current available models
   */
  async generateWithOpenRouter(input: OpenRouterImageInput): Promise<ImageMediaResult> {
    const apiKey = this.config.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is required. Set it in config or environment.');
    }

    if (!this.openrouterAdapter) {
      this.openrouterAdapter = new OpenRouterAdapter({
        apiKey,
        referer: this.config.OPENROUTER_REFERER,
        title: this.config.OPENROUTER_TITLE,
      });
    }

    return await this.openrouterAdapter.generateImage(input);
  }
}

// Backward compatibility: export as ImagesClient as well
export { MediaClient as ImagesClient };
