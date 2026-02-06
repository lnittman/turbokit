import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { r2 } from "./r2";

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		if (!r2) {
			throw new Error(
				"R2 not configured. Set R2_BUCKET, R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY environment variables.",
			);
		}
		const { user } = await requireAuth(ctx);
		const key = `${user._id}.${crypto.randomUUID()}`;
		return r2.generateUploadUrl(key);
	},
});
