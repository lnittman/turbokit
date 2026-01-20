/**
 * Media generation providers
 */
export enum Provider {
  OPENAI = 'OPENAI',
  FAL = 'FAL',
  OPENROUTER = 'OPENROUTER',
}

/**
 * OpenAI image quality levels
 * Maps to OpenAI's low/medium/high quality settings
 */
export enum ImageGen1Quality {
  DRAFT = 'low',
  STANDARD = 'medium',
  PRO = 'high',
}

/**
 * Model information returned by provider APIs
 */
export interface ModelInfo {
  /** Unique model identifier */
  id: string;
  /** Human-readable model name */
  name?: string;
  /** Model description */
  description?: string;
  /** Supported capabilities/modalities */
  capabilities?: string[];
  /** Pricing information (per million tokens or per image) */
  pricing?: {
    input?: number;
    output?: number;
  };
  /** Provider-specific metadata */
  meta?: Record<string, unknown>;
}

export const IMAGE_GEN1_SIZES = [
  '1024x1024',
  '1536x1024',
  '1024x1536',
] as const;
export type ImageGen1Size = typeof IMAGE_GEN1_SIZES[number];

export interface ProviderError {
  provider: Provider;
  code?: string;
  message: string;
  cause?: unknown;
}

export interface ImageResult {
  /** Raw base64 (without data: prefix). */
  b64: string;
  /** Optional public URL when a provider returns a URL instead of inline data. */
  url?: string;
  /** Provider metadata (ids, cost, etc). */
  meta?: Record<string, unknown>;
}
