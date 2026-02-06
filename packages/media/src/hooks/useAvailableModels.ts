/**
 * Hook factory for fetching available models from providers
 * Creates a type-safe hook that uses your Convex API
 *
 * @example
 * ```tsx
 * // In your app, create the hook once:
 * // apps/app/src/hooks/useAvailableModels.ts
 * import { createUseAvailableModels } from '@repo/media/react';
 * import { api } from '@/convex/_generated/api';
 *
 * export const useAvailableModels = createUseAvailableModels(api);
 * ```
 *
 * ```tsx
 * // Then use it anywhere in your app:
 * const { models, isLoading } = useAvailableModels('openai');
 * const { models } = useAvailableModels('openrouter', { outputModalities: ['image'] });
 * ```
 */

import type { ModelInfo } from "../types/enums";

type ConvexQueryHook = (
	query: unknown,
	args: Record<string, unknown> | "skip",
) => unknown;

export interface UseAvailableModelsOptions {
	/** For OpenRouter: filter by output modalities (e.g., ['image', 'text']) */
	outputModalities?: string[];
}

export interface UseAvailableModelsResult {
	/** Available models (empty array while loading) */
	models: ModelInfo[];
	/** Whether models are currently being loaded */
	isLoading: boolean;
	/** Whether data is from cache */
	cached?: boolean;
	/** Whether cached data is stale (refresh in progress) */
	stale?: boolean;
	/** When models were last fetched */
	fetchedAt?: number;
	/** For Fal.ai: info about browsing models */
	info?: {
		message: string;
		url: string;
		note: string;
	};
}

/**
 * Creates a useAvailableModels hook for your app
 * Pass your Convex API object to make it type-safe
 *
 * @param api - Your Convex API object from convex/_generated/api
 * @returns A hook function for fetching available models
 */
export function createUseAvailableModels(api: any) {
	return function useAvailableModels(
		provider: "openai" | "openrouter" | "fal",
		options?: UseAvailableModelsOptions,
	): UseAvailableModelsResult {
		let useQuery: ConvexQueryHook;
		try {
			useQuery = (
				require("convex/react") as {
					useQuery: ConvexQueryHook;
				}
			).useQuery;
		} catch {
			throw new Error(
				"convex/react not found. Make sure you have Convex installed and configured.",
			);
		}

		const isFalProvider = provider === "fal";
		const falInfo = useQuery(
			api.app.models.getFalInfo,
			isFalProvider ? {} : "skip",
		) as UseAvailableModelsResult["info"] | undefined;
		const modelData = useQuery(
			api.app.models.list,
			isFalProvider
				? "skip"
				: {
						provider,
						outputModalities: options?.outputModalities,
					},
		) as
			| {
					models?: ModelInfo[];
					cached?: boolean;
					stale?: boolean;
					fetchedAt?: number;
			  }
			| undefined;

		if (isFalProvider) {
			return {
				models: [],
				isLoading: falInfo === undefined,
				info: falInfo,
			};
		}

		return {
			models: modelData?.models || [],
			isLoading: modelData === undefined,
			cached: modelData?.cached,
			stale: modelData?.stale,
			fetchedAt: modelData?.fetchedAt,
		};
	};
}
