import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction, internalQuery } from "../../_generated/server";

const MAX_GENERATION_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 2_000;
const OPENAI_QUALITIES = new Set(["low", "medium", "high"] as const);
const OPENAI_SIZES = new Set(["1024x1024", "1536x1024", "1024x1536"] as const);
const OPENAI_OUTPUT_FORMATS = new Set(["png", "jpeg"] as const);
const OPENROUTER_ASPECT_RATIOS = new Set([
	"1:1",
	"2:3",
	"3:2",
	"3:4",
	"4:3",
	"4:5",
	"5:4",
	"9:16",
	"16:9",
	"21:9",
] as const);

function normalizeOneOf<T extends string>(
	value: string | undefined,
	allowed: ReadonlySet<T>,
): T | undefined {
	if (!value) {
		return undefined;
	}
	return allowed.has(value as T) ? (value as T) : undefined;
}

function normalizeError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return "Unknown image generation error";
}

function getRetryDelay(attempt: number): number {
	// 2s -> 4s -> 8s max
	return Math.min(RETRY_BASE_DELAY_MS * 2 ** Math.max(0, attempt - 1), 8_000);
}

// Internal action: process image generation job
export const processGeneration = internalAction({
	args: { jobId: v.id("imageGenerationJobs") },
	handler: async (ctx, { jobId }) => {
		const job = await ctx.runQuery(internal.app.images.internal.getJobById, {
			jobId,
		});

		if (!job) {
			console.error(`[IMAGES] Job ${jobId} not found`);
			return;
		}

		if (job.status === "completed" || job.status === "failed") {
			console.log(`[IMAGES] Job ${jobId} already terminal (${job.status})`);
			return;
		}

		const prompt = job.prompt;
		if (!prompt) {
			await ctx.runMutation(internal.app.images.mutations.failJob, {
				jobId,
				error: "Job prompt is missing",
				attempts: job.attempts + 1,
			});
			return;
		}

		const quality = normalizeOneOf(job.quality, OPENAI_QUALITIES);
		const size = normalizeOneOf(job.size, OPENAI_SIZES);
		const outputFormat = normalizeOneOf(
			job.outputFormat,
			OPENAI_OUTPUT_FORMATS,
		);
		const aspectRatio = normalizeOneOf(
			job.aspectRatio,
			OPENROUTER_ASPECT_RATIOS,
		);

		const attempt = job.attempts + 1;

		await ctx.runMutation(internal.app.images.mutations.updateJobStatus, {
			jobId,
			status: "processing",
			attempts: attempt,
		});

		try {
			const { MediaClient } = await import("@repo/media");

			const mediaClient = new MediaClient({
				OPENAI_API_KEY: process.env.OPENAI_API_KEY,
				FAL_API_KEY: process.env.FAL_API_KEY,
				OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
				OPENROUTER_REFERER: process.env.OPENROUTER_REFERER,
				OPENROUTER_TITLE: process.env.OPENROUTER_TITLE,
			});

			const result = await (async () => {
				switch (job.provider) {
					case "openai":
						return mediaClient.generateWithOpenAI({
							prompt,
							model: job.model,
							inputImage: job.inputImage,
							quality,
							size,
							outputFormat,
							numImages: job.numImages,
						});
					case "fal":
						return mediaClient.generateWithFal({
							model: job.model || "fal-ai/flux-pro",
							input: job.input || { prompt },
						});
					case "openrouter":
						return mediaClient.generateWithOpenRouter({
							prompt,
							model: job.model,
							aspectRatio,
						});
					default:
						throw new Error(`Unsupported provider: ${job.provider}`);
				}
			})();

			await ctx.runMutation(internal.app.images.mutations.completeJob, {
				jobId,
				resultType: result.type,
				resultUrl: result.url,
				resultB64: result.type === "image" ? result.b64 : undefined,
				resultWidth: result.type === "image" ? result.width : undefined,
				resultHeight: result.type === "image" ? result.height : undefined,
				resultContentType:
					result.type === "image" ||
					result.type === "video" ||
					result.type === "audio"
						? result.contentType
						: undefined,
				resultDuration:
					result.type === "video" || result.type === "audio"
						? result.duration
						: undefined,
				resultHasAudio: result.type === "video" ? result.hasAudio : undefined,
				resultFormat: result.type === "3d" ? result.format : undefined,
				resultPreviewUrl: result.type === "3d" ? result.previewUrl : undefined,
				metadata: result.meta,
			});

			console.log(
				`[IMAGES] Job ${jobId} completed (${job.provider}, attempt ${attempt})`,
			);
		} catch (error) {
			const message = normalizeError(error);
			console.error(
				`[IMAGES] Job ${jobId} attempt ${attempt} failed: ${message}`,
			);

			if (attempt < MAX_GENERATION_ATTEMPTS) {
				const retryDelayMs = getRetryDelay(attempt);

				await ctx.runMutation(internal.app.images.mutations.updateJobStatus, {
					jobId,
					status: "queued",
					attempts: attempt,
					error: message,
				});

				await ctx.scheduler.runAfter(
					retryDelayMs,
					internal.app.images.internal.processGeneration,
					{ jobId },
				);

				console.log(
					`[IMAGES] Job ${jobId} re-queued in ${retryDelayMs}ms (attempt ${attempt + 1}/${MAX_GENERATION_ATTEMPTS})`,
				);
				return;
			}

			await ctx.runMutation(internal.app.images.mutations.failJob, {
				jobId,
				error: message,
				attempts: attempt,
			});
		}
	},
});

// Internal query: get job by ID (for use in actions)
export const getJobById = internalQuery({
	args: { jobId: v.id("imageGenerationJobs") },
	handler: async (ctx, { jobId }) => {
		return await ctx.db.get(jobId);
	},
});
