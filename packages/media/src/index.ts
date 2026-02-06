// Client exports

export type { MediaClientConfig } from "./client";
export { ImagesClient, MediaClient } from "./client";
// Prompt templates
export * from "./prompts";
// Legacy client (for OpenAI Responses API)
export { ResponsesClient } from "./responses-client";
// Type exports
export * from "./types/enums";
export * from "./types/inputs";
export * from "./types/results";

/**
 * NOTE: Model fetching utilities are SERVER-ONLY
 * They are used internally by Convex actions in packages/backend/convex/app/models/
 *
 * For client-side model listing, use Convex queries:
 * - useQuery(api.app.models.list, { provider: 'openai' })
 * - useQuery(api.app.models.list, { provider: 'openrouter', outputModalities: ['image'] })
 * - useQuery(api.app.models.getFalInfo, {})
 */
