import { RAG } from "@convex-dev/rag";
import { components } from "../_generated/api";
import { getEmbeddingModel } from "./models";
import type { ActionCtx } from "../_generated/server";

export const rag = new RAG(components.rag as any, {
  embedder: getEmbeddingModel() as any,
  chunkSize: 1000,
  chunkOverlap: 200,
} as any);

/**
 * Helper: Ingest document into RAG system
 *
 * @example
 * await ingestDocument(ctx, {
 *   documentId: "user-guide-001",
 *   content: "Full text of user guide...",
 *   metadata: { type: "documentation", category: "user-guides" }
 * });
 *
 * NOTE: The RAG component API may vary - check the @convex-dev/rag docs
 * for the current method signatures.
 */
export async function ingestDocument(
  _ctx: ActionCtx,
  _args: {
    documentId: string;
    content: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  // TODO: Update to match @convex-dev/rag API
  // return await rag.ingest(ctx, { ... });
  console.log("[RAG] ingestDocument not yet configured - see lib/rag.ts");
}

/**
 * Helper: Search documents using semantic search
 *
 * @example
 * const results = await searchDocuments(ctx, "How do I reset my password?", {
 *   topK: 5,
 *   threshold: 0.7
 * });
 *
 * NOTE: The RAG component API may vary - check the @convex-dev/rag docs
 * for the current method signatures.
 */
export async function searchDocuments(
  _ctx: ActionCtx,
  _query: string,
  _options?: {
    topK?: number;
    threshold?: number;
    filters?: Record<string, any>;
  }
): Promise<Array<{ content: string; score: number; metadata: Record<string, unknown> }>> {
  // TODO: Update to match @convex-dev/rag API
  // return await rag.search(ctx, { ... });
  console.log("[RAG] searchDocuments not yet configured - see lib/rag.ts");
  return [];
}

// Example ingestion patterns (implement in your domain logic):
//
// 1. Documentation ingestion:
// await ingestDocument(ctx, {
//   documentId: `doc-${docId}`,
//   content: documentContent,
//   metadata: { type: "documentation", category: "api" }
// });
//
// 2. User-generated content:
// await ingestDocument(ctx, {
//   documentId: `post-${postId}`,
//   content: postContent,
//   metadata: { type: "post", userId, tags }
// });
//
// 3. Code snippets:
// await ingestDocument(ctx, {
//   documentId: `snippet-${snippetId}`,
//   content: codeSnippet,
//   metadata: { type: "code", language: "typescript" }
// });
