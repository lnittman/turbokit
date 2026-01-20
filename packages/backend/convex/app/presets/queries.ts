/**
 * Preset Queries
 *
 * Read-only operations for browsing and discovering design presets
 */

import { query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * List all public presets with optional filters
 */
export const list = query({
  args: {
    tags: v.optional(v.array(v.string())),
    author: v.optional(v.string()),
    builtin: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let presetsQuery = ctx.db.query("presets");

    // Filter by public presets only (unless user is admin)
    presetsQuery = presetsQuery.withIndex("by_public", (q) => q.eq("isPublic", true));

    const presets = await presetsQuery.collect();

    // Apply filters
    let filtered = presets;

    if (args.tags && args.tags.length > 0) {
      filtered = filtered.filter((preset) =>
        args.tags!.some((tag) => preset.tags.includes(tag))
      );
    }

    if (args.author) {
      filtered = filtered.filter((preset) => preset.author === args.author);
    }

    if (args.builtin !== undefined) {
      filtered = filtered.filter((preset) => preset.isBuiltin === args.builtin);
    }

    // Sort by downloads (most popular first)
    filtered.sort((a, b) => b.downloads - a.downloads);

    // Limit results
    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

/**
 * Get a specific preset by ID
 */
export const get = query({
  args: {
    presetId: v.string(),
  },
  handler: async (ctx, args) => {
    const preset = await ctx.db
      .query("presets")
      .withIndex("by_preset_id", (q) => q.eq("presetId", args.presetId))
      .first();

    if (!preset) {
      return null;
    }

    // Only return public presets (unless user is author or admin)
    if (!preset.isPublic) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || preset.author !== identity.name) {
        return null;
      }
    }

    return preset;
  },
});

/**
 * Search presets by name or description
 */
export const search = query({
  args: {
    query: v.string(),
    tags: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Search by name
    const nameResults = await ctx.db
      .query("presets")
      .withSearchIndex("search_name", (q) =>
        q.search("name", args.query).eq("isPublic", true)
      )
      .take(args.limit || 20);

    // Search by description
    const descResults = await ctx.db
      .query("presets")
      .withSearchIndex("search_description", (q) =>
        q.search("description", args.query).eq("isPublic", true)
      )
      .take(args.limit || 20);

    // Combine and deduplicate
    const combined = [...nameResults, ...descResults];
    const unique = Array.from(
      new Map(combined.map((p) => [p._id.toString(), p])).values()
    );

    // Filter by tags if provided
    let filtered = unique;
    if (args.tags && args.tags.length > 0) {
      filtered = filtered.filter((preset) =>
        args.tags!.some((tag) => preset.tags.includes(tag))
      );
    }

    // Sort by relevance (downloads for now)
    filtered.sort((a, b) => b.downloads - a.downloads);

    return filtered.slice(0, args.limit || 20);
  },
});

/**
 * Get presets by a specific author
 */
export const getByAuthor = query({
  args: {
    author: v.string(),
    includePrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const presets = await ctx.db
      .query("presets")
      .withIndex("by_author", (q) => q.eq("author", args.author))
      .collect();

    // Filter private presets unless requested by author
    if (!args.includePrivate) {
      return presets.filter((p) => p.isPublic);
    }

    // Check if requester is the author
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.name !== args.author) {
      return presets.filter((p) => p.isPublic);
    }

    return presets;
  },
});

/**
 * Get popular presets (sorted by downloads)
 */
export const getPopular = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const presets = await ctx.db
      .query("presets")
      .withIndex("by_downloads")
      .order("desc")
      .take(args.limit || 10);

    return presets.filter((p) => p.isPublic);
  },
});

/**
 * Get recently added presets
 */
export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const presets = await ctx.db
      .query("presets")
      .withIndex("by_created")
      .order("desc")
      .take(args.limit || 10);

    return presets.filter((p) => p.isPublic);
  },
});

/**
 * Get builtin (official TurboKit) presets
 */
export const getBuiltin = query({
  handler: async (ctx) => {
    const presets = await ctx.db
      .query("presets")
      .withIndex("by_builtin", (q) => q.eq("isBuiltin", true))
      .collect();

    return presets;
  },
});

/**
 * Get preset ratings
 */
export const getRatings = query({
  args: {
    presetId: v.string(),
  },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("presetRatings")
      .withIndex("by_preset", (q) => q.eq("presetId", args.presetId))
      .collect();

    return ratings;
  },
});

/**
 * Get user's preset installations
 */
export const getUserInstallations = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const installations = await ctx.db
      .query("presetInstallations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return installations;
  },
});
