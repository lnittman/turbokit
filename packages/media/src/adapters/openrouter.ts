import type { ImageMediaResult } from '../types/results';
import type { OpenRouterImageInput } from '../types/inputs';
import { Provider } from '../types/enums';

export interface OpenRouterAdapterConfig {
  apiKey: string;
  referer?: string;
  title?: string;
}

interface ProviderError {
  provider: Provider;
  message: string;
  cause?: unknown;
}

function normalizeError(e: any): ProviderError {
  return {
    provider: Provider.OPENROUTER,
    message: e?.message || 'OpenRouter error',
    cause: e,
  };
}

/**
 * OpenRouter image generation adapter
 * Uses official @openrouter/sdk for type safety
 */
export class OpenRouterAdapter {
  constructor(private config: OpenRouterAdapterConfig) {}

  async generateImage(input: OpenRouterImageInput): Promise<ImageMediaResult> {
    const {
      prompt,
      model = 'google/gemini-2.5-flash-image-preview',
      aspectRatio,
    } = input;

    try {
      const payload: any = {
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        modalities: ['image', 'text'],
        stream: false,
      };

      // Add aspect ratio config if specified (for Gemini models)
      if (aspectRatio) {
        payload.image_config = { aspect_ratio: aspectRatio };
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': this.config.referer || 'https://turbokit.dev',
          'X-Title': this.config.title || 'TurboKit',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      // Parse images from response according to OpenRouter docs
      const message = result.choices?.[0]?.message;
      if (!message) {
        throw new Error('OpenRouter: No message in response');
      }

      // Extract base64 from images array
      const images = (message as any).images;
      if (!images || images.length === 0) {
        throw new Error('OpenRouter: No images in response');
      }

      const imageUrl = images[0].image_url?.url;
      if (!imageUrl) {
        throw new Error('OpenRouter: No image URL in response');
      }

      // Parse base64 from data URL
      const match = imageUrl.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!match) {
        throw new Error('OpenRouter: Invalid image data URL format');
      }

      const [, format, b64] = match;

      return {
        type: 'image',
        url: imageUrl,
        b64,
        contentType: `image/${format}`,
        meta: {
          provider: 'openrouter',
          model,
          aspectRatio,
        },
      };
    } catch (e: any) {
      throw normalizeError(e);
    }
  }
}
