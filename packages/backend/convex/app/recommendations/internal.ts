/**
 * Internal functions for recommendations
 *
 * Used by actions for database operations
 */

import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../_generated/server";

// ==================== INTERNAL QUERIES ====================

export const searchSpotsByName = internalQuery({
  args: {
    query: v.string(),
    city: v.optional(v.string()),
    limit: v.number(),
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
      .take(args.limit);

    return results.map((spot) => ({
      _id: spot._id,
      name: spot.name,
      description: spot.description,
      city: spot.city,
      rating: spot.rating,
      imageUrl: spot.imageUrl,
    }));
  },
});

export const searchSpotsByInterest = internalQuery({
  args: {
    interest: v.string(),
    city: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // First find matching interests
    const interests = await ctx.db
      .query("interests")
      .withSearchIndex("search_name", (q) => q.search("name", args.interest))
      .take(5);

    if (interests.length === 0) {
      return [];
    }

    const results: any[] = [];

    for (const interest of interests) {
      const spotInterests = await ctx.db
        .query("spotInterests")
        .withIndex("by_interest", (q) => q.eq("interestId", interest._id))
        .take(args.limit);

      for (const si of spotInterests) {
        const spot = await ctx.db.get(si.spotId);
        if (!spot) continue;
        if (args.city && spot.city !== args.city) continue;

        results.push({
          _id: spot._id,
          name: spot.name,
          description: spot.description,
          city: spot.city,
          rating: spot.rating,
          imageUrl: spot.imageUrl,
          relevanceScore: si.strength,
        });
      }
    }

    return results.slice(0, args.limit);
  },
});

export const searchSpotsByCity = internalQuery({
  args: {
    city: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const spots = await ctx.db
      .query("spots")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .take(args.limit);

    return spots.map((spot) => ({
      _id: spot._id,
      name: spot.name,
      description: spot.description,
      city: spot.city,
      rating: spot.rating,
      imageUrl: spot.imageUrl,
    }));
  },
});

export const getUserTopInterests = internalQuery({
  args: {
    userId: v.id("users"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const userInterests = await ctx.db
      .query("userInterests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(args.limit * 2); // Get extra to filter

    // Sort by strength and limit
    const sorted = userInterests.sort((a, b) => b.strength - a.strength).slice(0, args.limit);

    // Fetch interest names
    const withNames = await Promise.all(
      sorted.map(async (ui) => {
        const interest = await ctx.db.get(ui.interestId);
        return {
          interestId: ui.interestId,
          interestName: interest?.name ?? "Unknown",
          strength: ui.strength,
        };
      })
    );

    return withNames;
  },
});

export const getSpotsByInterestId = internalQuery({
  args: {
    interestId: v.id("interests"),
    city: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const spotInterests = await ctx.db
      .query("spotInterests")
      .withIndex("by_interest_strength", (q) => q.eq("interestId", args.interestId))
      .take(args.limit * 2);

    const results: any[] = [];

    for (const si of spotInterests) {
      const spot = await ctx.db.get(si.spotId);
      if (!spot) continue;
      if (args.city && spot.city !== args.city) continue;

      results.push({
        _id: spot._id,
        name: spot.name,
        description: spot.description,
        city: spot.city,
        rating: spot.rating,
        imageUrl: spot.imageUrl,
        relevanceScore: si.strength,
      });
    }

    return results.slice(0, args.limit);
  },
});

export const getPopularSpots = internalQuery({
  args: {
    city: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const spots = args.city
      ? await ctx.db
          .query("spots")
          .withIndex("by_city", (q) => q.eq("city", args.city!))
          .take(args.limit * 2)
      : await ctx.db.query("spots").take(args.limit * 2);

    // Sort by check-ins and rating
    return spots
      .sort((a, b) => {
        const scoreA = a.checkInsCount + (a.rating ?? 0) * 10;
        const scoreB = b.checkInsCount + (b.rating ?? 0) * 10;
        return scoreB - scoreA;
      })
      .slice(0, args.limit)
      .map((spot) => ({
        _id: spot._id,
        name: spot.name,
        description: spot.description,
        city: spot.city,
        rating: spot.rating,
        imageUrl: spot.imageUrl,
        relevanceScore: 0.5,
        matchReason: "Popular spot",
      }));
  },
});

// ==================== INTERNAL MUTATIONS ====================

export const trackSearch = internalMutation({
  args: {
    userId: v.id("users"),
    query: v.string(),
    intent: v.any(),
    resultCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activities", {
      userId: args.userId,
      action: "natural_language_search",
      resourceType: "search",
      metadata: {
        query: args.query,
        intent: args.intent,
        resultCount: args.resultCount,
      },
      timestamp: Date.now(),
    });
  },
});

export const storeRecommendations = internalMutation({
  args: {
    userId: v.id("users"),
    recommendations: v.array(
      v.object({
        spotId: v.id("spots"),
        score: v.number(),
        reasoning: v.optional(v.string()),
        source: v.optional(v.string()),
        location: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 1000 * 60 * 60 * 24; // 24 hours

    for (const rec of args.recommendations) {
      // Check for existing recommendation
      const existing = await ctx.db
        .query("recommendations")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("spotId"), rec.spotId))
        .first();

      if (existing) {
        // Update if exists
        await ctx.db.patch(existing._id, {
          score: rec.score,
          reasoning: rec.reasoning,
          source: rec.source,
          expiresAt,
        });
      } else {
        // Create new
        await ctx.db.insert("recommendations", {
          userId: args.userId,
          spotId: rec.spotId,
          score: rec.score,
          reasoning: rec.reasoning,
          source: rec.source,
          location: rec.location,
          expiresAt,
          createdAt: now,
        });
      }
    }
  },
});
