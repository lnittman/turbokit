/**
 * Internal functions for interests
 *
 * Used by actions for database operations
 */

import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { internalMutation, internalQuery } from "../../_generated/server";

// ==================== INTERNAL QUERIES ====================

export const getTrendingInterests = internalQuery({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const interests = await ctx.db
      .query("interests")
      .withIndex("by_trending", (q) => q.eq("trending", true))
      .collect();

    return interests
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, args.limit);
  },
});

export const getAllInterests = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const interests = await ctx.db.query("interests").collect();

    if (args.limit) {
      return interests.slice(0, args.limit);
    }
    return interests;
  },
});

export const getInterestsByCategory = internalQuery({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const interests = await ctx.db
      .query("interests")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();

    if (args.limit) {
      return interests.slice(0, args.limit);
    }
    return interests;
  },
});

export const getUserInterestNames = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userInterests = await ctx.db
      .query("userInterests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const names: string[] = [];
    for (const ui of userInterests) {
      const interest = await ctx.db.get(ui.interestId);
      if (interest) {
        names.push(interest.name);
      }
    }
    return names;
  },
});

export const getUserInterests = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userInterests = await ctx.db
      .query("userInterests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const results: Array<{
      _id: Id<"interests">;
      _creationTime: number;
      name: string;
      description?: string;
      category?: string;
      iconName?: string;
      imageUrl?: string;
      trending: boolean;
      trendScore: number;
      isSeasonal: boolean;
      createdAt: number;
      updatedAt: number;
      strength: number;
      source?: "onboarding" | "explicit" | "inferred";
    }> = [];

    for (const ui of userInterests) {
      const interest = await ctx.db.get(ui.interestId);
      if (interest) {
        results.push({
          ...interest,
          strength: ui.strength,
          source: ui.source,
        });
      }
    }

    return results.sort((a, b) => b.strength - a.strength);
  },
});

export const searchInterestsByName = internalQuery({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("interests")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(args.limit ?? 20);

    return results;
  },
});

// ==================== INTERNAL MUTATIONS ====================

export const ensureInterestExists = internalMutation({
  args: {
    name: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if interest already exists
    const existing = await ctx.db
      .query("interests")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new interest
    const now = Date.now();
    return await ctx.db.insert("interests", {
      name: args.name,
      category: args.category,
      trending: false,
      trendScore: 0,
      isSeasonal: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const addUserInterest = internalMutation({
  args: {
    userId: v.id("users"),
    interestId: v.id("interests"),
    strength: v.optional(v.number()),
    source: v.optional(
      v.union(
        v.literal("onboarding"),
        v.literal("explicit"),
        v.literal("inferred")
      )
    ),
  },
  handler: async (ctx, args) => {
    // Check if user already has this interest
    const existing = await ctx.db
      .query("userInterests")
      .withIndex("by_user_interest", (q) =>
        q.eq("userId", args.userId).eq("interestId", args.interestId)
      )
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        strength: args.strength ?? existing.strength,
        source: args.source ?? existing.source,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new user interest
    return await ctx.db.insert("userInterests", {
      userId: args.userId,
      interestId: args.interestId,
      strength: args.strength ?? 0.5,
      source: args.source ?? "explicit",
      createdAt: Date.now(),
    });
  },
});

export const removeUserInterest = internalMutation({
  args: {
    userId: v.id("users"),
    interestId: v.id("interests"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userInterests")
      .withIndex("by_user_interest", (q) =>
        q.eq("userId", args.userId).eq("interestId", args.interestId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});

export const updateTrendScore = internalMutation({
  args: {
    interestId: v.id("interests"),
    scoreDelta: v.number(),
  },
  handler: async (ctx, args) => {
    const interest = await ctx.db.get(args.interestId);
    if (!interest) return;

    const newScore = Math.max(0, Math.min(100, interest.trendScore + args.scoreDelta));
    const isTrending = newScore >= 50;

    await ctx.db.patch(args.interestId, {
      trendScore: newScore,
      trending: isTrending,
      updatedAt: Date.now(),
    });
  },
});
