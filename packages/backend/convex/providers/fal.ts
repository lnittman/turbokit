// Fal.ai provider for image generation
// See: https://fal.ai/models for available models

export {
  CAPABILITIES,
  type ImageResult,
  Provider,
  type ProviderCapabilities,
} from "../app/images/types";

// TODO: Implement Fal client when needed
// import { fal } from "@fal-ai/client";
// export async function generateWithFal(args: {
//   prompt: string;
//   model?: string;
//   inputImage?: string;
// }): Promise<ImageResult> { ... }
