/**
 * TurboKit Registry Public Queries
 *
 * These are PUBLIC queries that all TurboKit users can call
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * List all public presets
 */
export const listPresets = query({
  args: {
    filter: v.optional(
      v.union(v.literal("all"), v.literal("builtin"), v.literal("verified"))
    ),
  },
  handler: async (ctx, { filter = "all" }) => {
    let results = await ctx.db
      .query("presets")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .collect();

    // Apply filter
    if (filter === "builtin") {
      results = results.filter((p) => p.isBuiltin);
    } else if (filter === "verified") {
      results = results.filter((p) => p.isVerified || p.isBuiltin);
    }

    return results;
  },
});

/**
 * Get a single preset by ID
 */
export const getPreset = query({
  args: {
    presetId: v.string(),
  },
  handler: async (ctx, { presetId }) => {
    const preset = await ctx.db
      .query("presets")
      .withIndex("by_preset_id", (q) => q.eq("presetId", presetId))
      .first();

    if (!preset || !preset.isPublic) {
      return null;
    }

    return preset;
  },
});

/**
 * Get registry stats
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allPresets = await ctx.db.query("presets").collect();
    const publicPresets = allPresets.filter((p) => p.isPublic);
    const builtinPresets = allPresets.filter((p) => p.isBuiltin);
    const verifiedPresets = allPresets.filter((p) => p.isVerified);
    const communityPresets = allPresets.filter(
      (p) => p.isPublic && !p.isBuiltin && !p.isVerified
    );

    const totalDownloads = allPresets.reduce((sum, p) => sum + p.downloads, 0);

    return {
      totalPresets: allPresets.length,
      publicPresets: publicPresets.length,
      builtinPresets: builtinPresets.length,
      verifiedPresets: verifiedPresets.length,
      communityPresets: communityPresets.length,
      totalDownloads,
    };
  },
});
