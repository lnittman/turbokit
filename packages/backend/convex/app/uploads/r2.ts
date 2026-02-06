import { R2 } from "@convex-dev/r2";
import { components } from "../../_generated/api";
import { action } from "../../_generated/server";

// Try to initialize R2, but fail gracefully if not configured
let r2: R2 | null = null;
let r2ClientApi: any = null;

try {
	r2 = new R2(components.r2);
	r2ClientApi = r2.clientApi({
		checkUpload: async (ctx, _bucket) => {
			const identity = await ctx.auth.getUserIdentity?.();
			if (!identity) throw new Error("Unauthorized");
		},
		onUpload: async (ctx, _bucket, key) => {
			await ctx.db.insert("activities", {
				userId: (await ctx.auth.getUserIdentity())?.subject as any,
				action: "r2.upload",
				resourceType: "r2",
				resourceId: key,
				timestamp: Date.now(),
			});
		},
	});
} catch (_e) {
	// R2 not configured - will use stub actions
	console.log("[R2] Not configured - file uploads disabled");
}

// Export functions - either from R2 or stubs
export const generateUploadUrl =
	r2ClientApi?.generateUploadUrl ??
	action({
		args: {},
		handler: async () => {
			throw new Error(
				"R2 not configured. Set R2_BUCKET, R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY environment variables.",
			);
		},
	});

export const syncMetadata =
	r2ClientApi?.syncMetadata ??
	action({
		args: {},
		handler: async () => {
			throw new Error(
				"R2 not configured. Set R2_BUCKET, R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY environment variables.",
			);
		},
	});

export { r2 };
