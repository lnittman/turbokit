import { Workpool } from "@convex-dev/workpool";
import { components } from "../_generated/api";

// Limit concurrent image generations (avoid API quota burnout)
export const imageGenPool = new Workpool(
	components.workpool as any,
	{
		maxConcurrency: 5,
	} as any,
);

// Limit concurrent LLM calls (avoid rate limits)
export const llmPool = new Workpool(
	components.workpool as any,
	{
		maxConcurrency: 10,
	} as any,
);

// Limit concurrent external API calls
export const apiPool = new Workpool(
	components.workpool as any,
	{
		maxConcurrency: 20,
	} as any,
);

// Usage example:
// await imageGenPool.run(ctx, async () => {
//   return await imagesClient.generate(...);
// });
