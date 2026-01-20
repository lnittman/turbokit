// Client exports
export { MediaClient, ImagesClient } from './client';
export type { MediaClientConfig } from './client';

// Legacy client (for OpenAI Responses API)
export { ResponsesClient } from './responses-client';

// Type exports
export * from './types/enums';
export * from './types/results';
export * from './types/inputs';

// Prompt templates
export * from './prompts';

/**
 * NOTE: Model fetching utilities are SERVER-ONLY
 * They are used internally by Convex actions in packages/backend/convex/app/models/
 *
 * For client-side model listing, use Convex queries:
 * - useQuery(api.app.models.list, { provider: 'openai' })
 * - useQuery(api.app.models.list, { provider: 'openrouter', outputModalities: ['image'] })
 * - useQuery(api.app.models.getFalInfo, {})
 */
