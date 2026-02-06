/**
 * Discriminated union for all media generation results
 * Use the 'type' field to discriminate between different media types
 */

export interface ImageMediaResult {
	type: "image";
	/** Public URL where the image can be accessed */
	url: string;
	/** Optional base64-encoded image data (only if downloadAndEncode: true) */
	b64?: string;
	/** Image width in pixels */
	width?: number;
	/** Image height in pixels */
	height?: number;
	/** MIME type (e.g., 'image/png', 'image/jpeg') */
	contentType?: string;
	/** Provider-specific metadata (seed, model version, etc.) */
	meta?: Record<string, unknown>;
}

export interface VideoMediaResult {
	type: "video";
	/** Public URL where the video can be accessed */
	url: string;
	/** Video duration in seconds */
	duration?: number;
	/** Whether the video includes audio track */
	hasAudio?: boolean;
	/** MIME type (e.g., 'video/mp4', 'video/webm') */
	contentType?: string;
	/** Original file name from provider */
	fileName?: string;
	/** File size in bytes */
	fileSize?: number;
	/** Provider-specific metadata (seed, fps, dimensions, etc.) */
	meta?: Record<string, unknown>;
}

export interface AudioMediaResult {
	type: "audio";
	/** Public URL where the audio can be accessed */
	url: string;
	/** Audio duration in seconds */
	duration?: number;
	/** MIME type (e.g., 'audio/mpeg', 'audio/wav') */
	contentType?: string;
	/** Provider-specific metadata (seed, sample rate, etc.) */
	meta?: Record<string, unknown>;
}

export interface ThreeDMediaResult {
	type: "3d";
	/** Public URL where the 3D model can be accessed */
	url: string;
	/** Model format (e.g., 'glb', 'obj', 'fbx') */
	format?: string;
	/** Optional preview image URL */
	previewUrl?: string;
	/** Provider-specific metadata (polygon count, seed, etc.) */
	meta?: Record<string, unknown>;
}

/**
 * Union type for all possible media generation results
 * Use type discrimination for type-safe access:
 *
 * @example
 * ```typescript
 * const result = await client.generateWithFal({...});
 *
 * switch (result.type) {
 *   case 'image':
 *     console.log(result.width, result.height);
 *     break;
 *   case 'video':
 *     console.log(result.duration, result.hasAudio);
 *     break;
 *   case 'audio':
 *     console.log(result.duration);
 *     break;
 *   case '3d':
 *     console.log(result.format, result.previewUrl);
 *     break;
 * }
 * ```
 */
export type MediaResult =
	| ImageMediaResult
	| VideoMediaResult
	| AudioMediaResult
	| ThreeDMediaResult;
