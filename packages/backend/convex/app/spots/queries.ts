import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getAuthUser } from "../../lib/auth";

export const list = query({
  args: {
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const city = args.city;
    if (city) {
      return await ctx.db
        .query("spots")
        .withIndex("by_city", (q) => q.eq("city", city))
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("spots").take(args.limit ?? 50);
  },
});

export const getById = query({
  args: { id: v.id("spots") },
  handler: async (ctx, args) => {
    const spot = await ctx.db.get(args.id);
    if (!spot) return null;

    // Get spot interests
    const spotInterests = await ctx.db
      .query("spotInterests")
      .withIndex("by_spot", (q) => q.eq("spotId", args.id))
      .collect();

    const interests = await Promise.all(
      spotInterests.map(async (si) => {
        const interest = await ctx.db.get(si.interestId);
        return { interest, strength: si.strength };
      })
    );

    return {
      ...spot,
      interests: interests.filter((i) => i.interest !== null),
    };
  },
});

export const search = query({
  args: {
    query: v.string(),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("spots")
      .withSearchIndex("search_name", (q) => {
        let search = q.search("name", args.query);
        if (args.city) {
          search = search.eq("city", args.city);
        }
        return search;
      })
      .take(20);

    return results;
  },
});

export const getNearby = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusKm: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Simple bounding box search
    // For production, you'd want proper geospatial queries
    const radius = args.radiusKm ?? 10;
    const latDelta = radius / 111; // Rough km to degrees
    const lonDelta = radius / (111 * Math.cos((args.latitude * Math.PI) / 180));

    const spots = await ctx.db.query("spots").collect();

    const nearby = spots.filter((spot) => {
      const latDiff = Math.abs(spot.latitude - args.latitude);
      const lonDiff = Math.abs(spot.longitude - args.longitude);
      return latDiff <= latDelta && lonDiff <= lonDelta;
    });

    return nearby.slice(0, args.limit ?? 50);
  },
});

export const getByInterest = query({
  args: {
    interestId: v.id("interests"),
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const spotInterests = await ctx.db
      .query("spotInterests")
      .withIndex("by_interest", (q) => q.eq("interestId", args.interestId))
      .take(args.limit ?? 50);

    const spots = await Promise.all(
      spotInterests.map(async (si) => {
        const spot = await ctx.db.get(si.spotId);
        if (!spot) return null;
        if (args.city && spot.city !== args.city) return null;
        return { ...spot, relevanceScore: si.strength };
      })
    );

    return spots.filter((s) => s !== null);
  },
});

export const isFavorited = query({
  args: { spotId: v.id("spots") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return false;

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_spot", (q) =>
        q.eq("userId", user._id).eq("spotId", args.spotId)
      )
      .unique();

    return !!favorite;
  },
});
