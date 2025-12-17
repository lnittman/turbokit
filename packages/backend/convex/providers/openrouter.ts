// OpenRouter provider for image generation
// See: https://openrouter.ai/models for available models

export {
  CAPABILITIES,
  type ImageResult,
  Provider,
  type ProviderCapabilities,
} from "../app/images/types";

// TODO: Implement OpenRouter client when needed
// export async function generateWithOpenRouter(args: {
//   prompt: string;
//   model?: string;
//   aspectRatio?: string;
// }): Promise<ImageResult> { ... }
