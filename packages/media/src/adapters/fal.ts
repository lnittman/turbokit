import { Provider } from "../types/enums";
import type { FalInput } from "../types/inputs";
import type {
	AudioMediaResult,
	ImageMediaResult,
	MediaResult,
	ThreeDMediaResult,
	VideoMediaResult,
} from "../types/results";

export interface FalAdapterConfig {
	apiKey: string;
}

interface ProviderError {
	provider: Provider;
	message: string;
	cause?: unknown;
}

function normalizeError(e: any): ProviderError {
	return {
		provider: Provider.FAL,
		message: e?.message || "Fal.ai error",
		cause: e,
	};
}

function arrayBufferToBase64(ab: ArrayBuffer): string {
	// Prefer Node path when Buffer is available
	if (
		typeof Buffer !== "undefined" &&
		typeof (Buffer as any).from === "function"
	) {
		return (Buffer as any).from(new Uint8Array(ab)).toString("base64");
	}
	// Browser path
	let binary = "";
	const bytes = new Uint8Array(ab);
	for (let i = 0; i < bytes.length; i++)
		binary += String.fromCharCode(bytes[i]);
	const btoaFn: ((s: string) => string) | undefined = (globalThis as any).btoa;
	if (!btoaFn) throw new Error("btoa is not available in this environment");
	return btoaFn(binary);
}

/**
 * Fal.ai adapter - Generic multi-modal media generation
 * Supports any Fal model (600+ models)
 */
export class FalAdapter {
	constructor(private config: FalAdapterConfig) {}

	/**
	 * Generate media using any Fal model
	 * Automatically detects media type from response
	 */
	async generate(input: FalInput): Promise<MediaResult> {
		try {
			const { fal } = await import("@fal-ai/client");
			fal.config({ credentials: this.config.apiKey });

			const result: any = await fal.subscribe(input.model, {
				input: input.input,
				logs: false,
				onQueueUpdate: input.options?.onQueueUpdate,
			});

			// Detect media type and parse accordingly
			return await this.detectAndParseMediaType(
				result,
				input.model,
				input.options?.downloadAndEncode,
				input.options?.timeout,
			);
		} catch (e: any) {
			throw normalizeError(e);
		}
	}

	/**
	 * Smart detection of media type based on response structure
	 */
	private async detectAndParseMediaType(
		result: any,
		model: string,
		downloadAndEncode = false,
		timeout = 15000,
	): Promise<MediaResult> {
		// Check for video
		if (result.video || result.data?.video) {
			return this.parseVideoResult(result, model);
		}

		// Check for audio
		if (result.audio || result.data?.audio) {
			return this.parseAudioResult(result, model);
		}

		// Check for 3D model
		if (result.model || result.data?.model) {
			return this.parse3DResult(result, model);
		}

		// Default: image
		return await this.parseImageResult(
			result,
			model,
			downloadAndEncode,
			timeout,
		);
	}

	private async parseImageResult(
		result: any,
		model: string,
		downloadAndEncode: boolean = false,
		timeout: number = 15000,
	): Promise<ImageMediaResult> {
		// Extract image URL from various possible locations
		const imageUrl: string | undefined =
			result.images?.[0]?.url ||
			result.data?.images?.[0]?.url ||
			result.output?.images?.[0]?.url ||
			result.image?.url;

		if (!imageUrl) {
			throw new Error("Fal.ai: No image URL found in response");
		}

		// Extract metadata
		const image =
			result.images?.[0] || result.data?.images?.[0] || result.image || {};

		const mediaResult: ImageMediaResult = {
			type: "image",
			url: imageUrl,
			width: image.width,
			height: image.height,
			contentType: image.content_type,
			meta: {
				provider: "fal",
				model,
				seed: result.seed,
			},
		};

		// Optionally download and base64 encode
		if (downloadAndEncode) {
			try {
				const controller =
					typeof AbortController !== "undefined"
						? new AbortController()
						: undefined;
				const timeoutId = setTimeout(() => controller?.abort(), timeout);

				const resp = await fetch(imageUrl, { signal: controller?.signal });
				clearTimeout(timeoutId);

				if (!resp.ok) {
					throw new Error(
						`Fal.ai: fetching image failed: ${resp.status} ${resp.statusText}`,
					);
				}

				const contentType = resp.headers.get("content-type") ?? "";
				if (!contentType.startsWith("image/")) {
					throw new Error(
						`Fal.ai: expected image content-type, got "${contentType}"`,
					);
				}

				const ab = await resp.arrayBuffer();
				mediaResult.b64 = arrayBufferToBase64(ab);
			} catch (e: any) {
				// Non-fatal: just skip base64 encoding
				console.warn(`Failed to download/encode image: ${e.message}`);
			}
		}

		return mediaResult;
	}

	private parseVideoResult(result: any, model: string): VideoMediaResult {
		const video = result.video || result.data?.video;

		if (!video?.url) {
			throw new Error("Fal.ai: No video URL found in response");
		}

		return {
			type: "video",
			url: video.url,
			duration: result.duration,
			hasAudio: result.has_audio,
			contentType: video.content_type,
			fileName: video.file_name,
			fileSize: video.file_size,
			meta: {
				provider: "fal",
				model,
				seed: result.seed,
				fps: result.fps,
			},
		};
	}

	private parseAudioResult(result: any, model: string): AudioMediaResult {
		const audio = result.audio || result.data?.audio;

		if (!audio?.url) {
			throw new Error("Fal.ai: No audio URL found in response");
		}

		return {
			type: "audio",
			url: audio.url,
			duration: result.duration,
			contentType: audio.content_type,
			meta: {
				provider: "fal",
				model,
				seed: result.seed,
			},
		};
	}

	private parse3DResult(result: any, model: string): ThreeDMediaResult {
		const modelData = result.model || result.data?.model;

		if (!modelData?.url) {
			throw new Error("Fal.ai: No 3D model URL found in response");
		}

		return {
			type: "3d",
			url: modelData.url,
			format: modelData.format,
			previewUrl: result.preview_image?.url,
			meta: {
				provider: "fal",
				model,
				seed: result.seed,
			},
		};
	}
}
