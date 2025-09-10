import { mutation } from "../_generated/server";
import { requireAuth } from "../lib/auth";
import { r2 } from "./r2";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);
    const key = `${user._id}.${crypto.randomUUID()}`;
    return r2.generateUploadUrl(key);
  },
});
