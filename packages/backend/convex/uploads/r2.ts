import { R2 } from "@convex-dev/r2";
import { components } from "../_generated/api";

export const r2 = new R2(components.r2);

export const { generateUploadUrl, syncMetadata } = r2.clientApi({
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

