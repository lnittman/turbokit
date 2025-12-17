import { v } from "convex/values";

// Provider types
export const Provider = {
  OPENAI: "openai",
  FAL: "fal",
  OPENROUTER: "openrouter",
} as const;

export type Provider = (typeof Provider)[keyof typeof Provider];

// Job status
export const JobStatus = {
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

// Convex validators
export const providerValidator = v.union(
  v.literal("openai"),
  v.literal("fal"),
  v.literal("openrouter")
);

export const jobStatusValidator = v.union(
  v.literal("queued"),
  v.literal("processing"),
  v.literal("completed"),
  v.literal("failed")
);

// Result types
export interface ImageResult {
  url: string;
  width?: number;
  height?: number;
  contentType?: string;
}

// Provider capabilities
export interface ProviderCapabilities {
  supportsGeneration: boolean;
  supportsTransforms: boolean;
  supportsTransparency: boolean;
  requiresInputImage: boolean;
}

export const CAPABILITIES: Record<Provider, ProviderCapabilities> = {
  openai: {
    supportsGeneration: true,
    supportsTransforms: true,
    supportsTransparency: false,
    requiresInputImage: false,
  },
  fal: {
    supportsGeneration: true,
    supportsTransforms: true,
    supportsTransparency: true,
    requiresInputImage: false,
  },
  openrouter: {
    supportsGeneration: true,
    supportsTransforms: false,
    supportsTransparency: false,
    requiresInputImage: false,
  },
};
