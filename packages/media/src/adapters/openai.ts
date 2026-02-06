import { ResponsesClient } from "../responses-client";
import { Provider } from "../types/enums";
import type { OpenAIImageInput } from "../types/inputs";
import type { ImageMediaResult } from "../types/results";

export interface OpenAIAdapterConfig {
	apiKey: string;
}

interface ProviderError {
	provider: Provider;
	message: string;
	cause?: unknown;
}

function normalizeError(e: any): ProviderError {
	return {
		provider: Provider.OPENAI,
		message: e?.message || "OpenAI error",
		cause: e,
	};
}

/**
 * OpenAI image generation adapter
 * Supports gpt-image-1 and gpt-image-1-mini via Responses API
 */
export class OpenAIAdapter {
	private responsesClient: ResponsesClient;

	constructor(config: OpenAIAdapterConfig) {
		this.responsesClient = new ResponsesClient({ apiKey: config.apiKey });
	}

	async generateImage(input: OpenAIImageInput): Promise<ImageMediaResult> {
		const {
			prompt,
			model = "gpt-image-1", // Default to standard model
			size = "1024x1024",
			quality = "high",
			inputImage,
			outputFormat = "png",
			numImages = 1,
		} = input;

		// Validate model-specific constraints
		// gpt-image-1-mini does not support input image editing
		const isMiniModel = model.includes("mini");
		if (isMiniModel && inputImage) {
			throw normalizeError(
				new Error(
					`Model '${model}' does not support input image editing (inputImage parameter)`,
				),
			);
		}

		try {
			const b64 = await this.responsesClient.generateImage(prompt, {
				inputImage,
				quality: quality as "low" | "medium" | "high",
				size: size as "1024x1024" | "1536x1024" | "1024x1536",
				background: "auto",
				// Note: outputFormat and numImages support would need ResponsesClient update
			});

			// Parse dimensions from size
			const [width, height] = size.split("x").map(Number);

			return {
				type: "image",
				url: `data:image/${outputFormat};base64,${b64}`,
				b64,
				width,
				height,
				contentType: `image/${outputFormat}`,
				meta: {
					provider: "openai",
					model,
					endpoint: "responses",
					quality,
				},
			};
		} catch (e: any) {
			throw normalizeError(e);
		}
	}
}
