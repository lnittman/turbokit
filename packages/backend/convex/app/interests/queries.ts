import { v } from "convex/values";
import { query } from "../../_generated/server";

export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("interests")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .collect();
    }

    return await ctx.db.query("interests").collect();
  },
});

export const getTrending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const interests = await ctx.db
      .query("interests")
      .withIndex("by_trending", (q) => q.eq("trending", true))
      .collect();

    const sorted = interests.sort((a, b) => b.trendScore - a.trendScore);
    return args.limit ? sorted.slice(0, args.limit) : sorted;
  },
});

export const getById = query({
  args: { id: v.id("interests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interests")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(20);
  },
});
