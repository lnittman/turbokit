import { RAG } from "@convex-dev/rag";
import { components } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import { getEmbeddingModel } from "./models";

const DEFAULT_RAG_NAMESPACE = "global";
const DEFAULT_TOP_K = 5;
const DEFAULT_EMBEDDING_DIMENSION = 1536;

const embeddingDimension = Number.parseInt(
	process.env.OPENROUTER_EMBEDDING_DIMENSION ||
		process.env.RAG_EMBEDDING_DIMENSION ||
		`${DEFAULT_EMBEDDING_DIMENSION}`,
	10,
);

export const rag = new RAG(components.rag as any, {
	textEmbeddingModel: getEmbeddingModel() as any,
	embeddingDimension: Number.isFinite(embeddingDimension)
		? embeddingDimension
		: DEFAULT_EMBEDDING_DIMENSION,
});

type IngestMetadata = Record<string, unknown> & {
	namespace?: string;
};

export async function ingestDocument(
	ctx: ActionCtx,
	args: {
		documentId: string;
		content: string;
		metadata?: IngestMetadata;
	},
): Promise<void> {
	const namespace = args.metadata?.namespace || DEFAULT_RAG_NAMESPACE;
	const { namespace: _namespace, ...metadata } = args.metadata || {};

	await rag.add(ctx as any, {
		namespace,
		key: args.documentId,
		text: args.content,
		metadata: metadata as any,
	});
}

export async function searchDocuments(
	ctx: ActionCtx,
	query: string,
	options?: {
		namespace?: string;
		topK?: number;
		threshold?: number;
		filters?: Record<string, unknown>;
	},
): Promise<
	Array<{ content: string; score: number; metadata: Record<string, unknown> }>
> {
	const namespace = options?.namespace || DEFAULT_RAG_NAMESPACE;
	const filters = options?.filters ? ([options.filters] as any) : undefined;

	const { results } = await rag.search(ctx as any, {
		namespace,
		query,
		limit: options?.topK || DEFAULT_TOP_K,
		vectorScoreThreshold: options?.threshold,
		filters,
	});

	return results.map((result: any) => ({
		content: (result.content || [])
			.map((entry: { text: string }) => entry.text)
			.join("\n"),
		score: result.score,
		metadata: result.content?.[0]?.metadata || {},
	}));
}
