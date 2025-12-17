import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getAuthUser } from "../../lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);

    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return collections;
  },
});

export const getById = query({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.id);
    if (!collection) return null;

    const collectionSpots = await ctx.db
      .query("collectionSpots")
      .withIndex("by_collection", (q) => q.eq("collectionId", args.id))
      .collect();

    const spots = await Promise.all(
      collectionSpots.map(async (cs) => {
        const spot = await ctx.db.get(cs.spotId);
        return {
          ...cs,
          spot,
        };
      })
    );

    return {
      ...collection,
      spots: spots.filter((s) => s.spot !== null),
      spotCount: spots.length,
    };
  },
});

export const getPublic = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .take(args.limit ?? 20);

    return collections;
  },
});
