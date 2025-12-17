import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getAuthUser } from "../../lib/auth";

export const getForUser = query({
  args: {
    location: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);

    let q = ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (args.location) {
      q = q.filter((q) => q.eq(q.field("location"), args.location));
    }

    const recommendations = await q
      .filter((q) => {
        // Filter out expired recommendations
        const expiresAt = q.field("expiresAt");
        return q.or(q.eq(expiresAt, undefined), q.gt(expiresAt, Date.now()));
      })
      .take(args.limit ?? 20);

    // Get spot details for each recommendation
    const withSpots = await Promise.all(
      recommendations.map(async (rec) => {
        const spot = await ctx.db.get(rec.spotId);
        return {
          ...rec,
          spot,
        };
      })
    );

    return withSpots.filter((r) => r.spot !== null);
  },
});

export const getBySpot = query({
  args: { spotId: v.id("spots") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);

    const recommendation = await ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("spotId"), args.spotId))
      .first();

    return recommendation;
  },
});
