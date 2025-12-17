import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getAuthUser } from "../../lib/auth";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const userInterests = await ctx.db
      .query("userInterests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const interests = await Promise.all(
      userInterests.map(async (ui) => {
        const interest = await ctx.db.get(ui.interestId);
        return { ...ui, interest };
      })
    );

    return { ...user, interests: interests.filter((i) => i.interest !== null) };
  },
});
