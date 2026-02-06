import OpenAI from "openai";

export interface ResponsesClientOptions {
	apiKey?: string;
	organization?: string;
}

export interface ResponsesCreateOptions {
	model: string;
	input: string | UserMessage[];
	tools?: Tool[];
}

export interface UserMessage {
	role: "user";
	content: MessageContent[];
}

export type MessageContent =
	| { type: "input_text"; text: string }
	| { type: "input_image"; image_url?: string; file_id?: string };

export interface Tool {
	type: "image_generation";
	quality?: string;
	size?: string;
	background?: string;
}

export interface ResponsesResult {
	id: string;
	object: string;
	created_at: number;
	model: string;
	usage?: any;
	output?: OutputItem[];
	output_text?: string;
	error?: string;
	status?: string;
}

export interface OutputItem {
	type: string;
	status?: string;
	result?: string;
	error?: string;
	content?: any[];
}

export interface ImageGenerationCallOutput extends OutputItem {
	type: "image_generation_call";
	status: "completed" | "failed";
	result?: string; // Base64 encoded image
	error?: string;
}

export class ResponsesClient {
	private openai: OpenAI;

	constructor(options: ResponsesClientOptions = {}) {
		const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
		const organization = options.organization || process.env.OPENAI_ORG_ID;

		this.openai = new OpenAI({
			apiKey: apiKey,
			organization: organization,
			baseURL: "https://api.openai.com/v1",
		});
	}

	async create(options: ResponsesCreateOptions): Promise<ResponsesResult> {
		const apiKey = this.openai.apiKey;
		const baseURL = "https://api.openai.com/v1";
		const orgId = process.env.OPENAI_ORG_ID;

		const headers: any = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		};

		if (orgId) {
			headers["OpenAI-Organization"] = orgId;
		}

		const httpResponse = await fetch(`${baseURL}/responses`, {
			method: "POST",
			headers,
			body: JSON.stringify(options),
		});

		if (!httpResponse.ok) {
			const errorText = await httpResponse.text();
			throw new Error(
				`Responses API Error ${httpResponse.status}: ${errorText}`,
			);
		}

		const response = (await httpResponse.json()) as any;

		return {
			id: response.id,
			object: response.object,
			created_at: response.created_at,
			model: response.model,
			usage: response.usage,
			output: response.output,
			output_text: response.output_text,
			error: response.error,
			status: response.status,
		};
	}

	async generateImage(
		prompt: string,
		options: {
			inputImage?: string; // Base64 data URL or HTTP URL
			quality?: "low" | "medium" | "high" | "auto";
			size?: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
			background?: "transparent" | "opaque" | "auto";
			model?: string;
		} = {},
	): Promise<string> {
		const {
			inputImage,
			quality = "high",
			size = "1024x1024",
			background = "auto",
			model = "gpt-5-mini", // Model that supports image generation in Responses API
		} = options;

		// Build the input message
		let input: string | UserMessage[];

		if (inputImage) {
			// When we have an input image, use structured messages
			const content: any[] = [];

			// Include generation instructions
			content.push({
				type: "input_text",
				text: `Generate an image based on the following instructions:\n\n${prompt}`,
			});

			// Add the input image
			if (inputImage.startsWith("data:") || inputImage.startsWith("http")) {
				content.push({ type: "input_image", image_url: inputImage });
			} else {
				// Assume it's a file ID
				content.push({ type: "input_image", file_id: inputImage });
			}

			input = [
				{
					role: "user",
					content,
				},
			];
		} else {
			// Text-only generation
			input = `Generate an image based on the following instructions:\n\n${prompt}`;
		}

		const response = await this.create({
			model,
			input,
			tools: [
				{
					type: "image_generation",
					quality,
					size,
					background,
				},
			],
		});

		// Extract the image from the response
		for (const output of response.output || []) {
			// Check for image generation call
			if (output.type === "image_generation_call") {
				const imageOutput = output as ImageGenerationCallOutput;
				if (imageOutput.status === "completed" && imageOutput.result) {
					return imageOutput.result; // Base64 encoded
				} else if (imageOutput.status === "failed") {
					throw new Error(
						`Image generation failed: ${imageOutput.error || "Unknown error"}`,
					);
				}
			}

			// Check for content with generated images
			if (
				output.type === "message" &&
				output.content &&
				Array.isArray(output.content)
			) {
				for (const content of output.content) {
					if (content.type === "image" && content.image?.b64_json) {
						return content.image.b64_json;
					}
				}
			}
		}

		throw new Error("No image data found in response");
	}
}
