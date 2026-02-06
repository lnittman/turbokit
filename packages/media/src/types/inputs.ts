/**
 * Input types for media generation across different providers
 */

/**
 * OpenAI image generation input
 * Fetch available models dynamically using fetchOpenAIModels()
 */
export interface OpenAIImageInput {
	/** Text prompt describing the desired image */
	prompt: string;
	/**
	 * Model ID to use (default: 'gpt-image-1')
	 * Use fetchOpenAIModels() to get current available models
	 * Common models: 'gpt-image-1', 'gpt-image-1-mini'
	 */
	model?: string;
	/** Image dimensions */
	size?: "1024x1024" | "1536x1024" | "1024x1536";
	/** Generation quality (default: high) */
	quality?: "low" | "medium" | "high";
	/** Input image for editing (URL, data URL, or base64) - NOT supported by mini models */
	inputImage?: string;
	/** Output format (default: png) */
	outputFormat?: "png" | "jpeg";
	/** Number of images to generate (1-10, default: 1) */
	numImages?: number;
}

/**
 * Fal.ai generic input
 * Supports any Fal model (images, video, audio, 3D)
 */
export interface FalInput {
	/** Fal model ID (e.g., 'fal-ai/flux-pro', 'fal-ai/veo3', 'fal-ai/maestro/music') */
	model: string;
	/** Model-specific parameters - consult Fal.ai documentation for each model */
	input: Record<string, unknown>;
	/** Optional generation options */
	options?: {
		/** Whether to download and base64-encode the result (only relevant for images, default: false) */
		downloadAndEncode?: boolean;
		/** Timeout in milliseconds (default: 15000) */
		timeout?: number;
		/** Queue update callback for progress tracking */
		onQueueUpdate?: (update: FalQueueUpdate) => void;
	};
}

/**
 * Fal.ai queue update event
 */
export interface FalQueueUpdate {
	status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
	logs?: Array<{ message: string; timestamp: string }>;
	position?: number;
}

/**
 * OpenRouter image generation input
 * Currently supports Gemini 2.5 Flash Image Preview
 */
export interface OpenRouterImageInput {
	/** Text prompt describing the desired image */
	prompt: string;
	/** Model to use (default: google/gemini-2.5-flash-image-preview) */
	model?: string;
	/** Image aspect ratio (Gemini-specific) */
	aspectRatio?:
		| "1:1"
		| "2:3"
		| "3:2"
		| "3:4"
		| "4:3"
		| "4:5"
		| "5:4"
		| "9:16"
		| "16:9"
		| "21:9";
}
