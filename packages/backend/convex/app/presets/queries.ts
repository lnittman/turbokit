import { v } from "convex/values";
import { query } from "../../_generated/server";
import { requireAuth, optionalAuth } from "../../lib/auth";

/**
 * List all presets for the current user
 * Includes user's own presets and public presets
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
    includePublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { limit = 50, includePublic = true }) => {
    const auth = await optionalAuth(ctx);

    if (!auth) {
      // Unauthenticated: only public presets
      return await ctx.db
        .query("presets")
        .withIndex("by_public", (q) => q.eq("isPublic", true))
        .order("desc")
        .take(limit);
    }

    const { user } = auth;

    // Get user's own presets
    const userPresets = await ctx.db
      .query("presets")
      .withIndex("by_created_by", (q) => q.eq("createdBy", user._id))
      .order("desc")
      .collect();

    if (!includePublic) {
      return userPresets.slice(0, limit);
    }

    // Get public presets (excluding user's own)
    const publicPresets = await ctx.db
      .query("presets")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(limit);

    // Combine and dedupe
    const seenIds = new Set(userPresets.map((p) => p._id));
    const combined = [
      ...userPresets,
      ...publicPresets.filter((p) => !seenIds.has(p._id)),
    ];

    return combined.slice(0, limit);
  },
});

/**
 * Get all public presets
 */
export const listPublic = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    return await ctx.db
      .query("presets")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(limit);
  },
});

/**
 * Get a single preset by ID
 */
export const get = query({
  args: { presetId: v.id("presets") },
  handler: async (ctx, { presetId }) => {
    const preset = await ctx.db.get(presetId);

    if (!preset) {
      return null;
    }

    // If public, return it
    if (preset.isPublic) {
      return preset;
    }

    // If private, check ownership
    const auth = await optionalAuth(ctx);
    if (!auth) {
      return null;
    }

    if (preset.createdBy !== auth.user._id) {
      return null;
    }

    return preset;
  },
});

/**
 * Get a preset by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const preset = await ctx.db
      .query("presets")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!preset) {
      return null;
    }

    // If public, return it
    if (preset.isPublic) {
      return preset;
    }

    // If private, check ownership
    const auth = await optionalAuth(ctx);
    if (!auth) {
      return null;
    }

    if (preset.createdBy !== auth.user._id) {
      return null;
    }

    return preset;
  },
});

/**
 * Get the currently active preset for the current user
 */
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const auth = await optionalAuth(ctx);

    if (auth) {
      // Check user-specific settings first
      const settings = await ctx.db
        .query("userPresetSettings")
        .withIndex("by_user", (q) => q.eq("userId", auth.user._id))
        .first();

      if (settings?.activePresetId) {
        const preset = await ctx.db.get(settings.activePresetId);
        if (preset) {
          return {
            preset,
            overrides: settings.overrides,
          };
        }
      }
    }

    // Fall back to system active preset
    const systemActive = await ctx.db
      .query("presets")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

    return systemActive ? { preset: systemActive, overrides: null } : null;
  },
});

/**
 * Get user's preset settings
 */
export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);

    const settings = await ctx.db
      .query("userPresetSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!settings) {
      return {
        activePresetId: null,
        overrides: null,
      };
    }

    return {
      activePresetId: settings.activePresetId,
      overrides: settings.overrides,
    };
  },
});

/**
 * Search presets by name
 */
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { query: searchQuery, limit = 20 }) => {
    if (!searchQuery.trim()) {
      return [];
    }

    const results = await ctx.db
      .query("presets")
      .withSearchIndex("search_name", (q) =>
        q.search("name", searchQuery).eq("isPublic", true)
      )
      .take(limit);

    return results;
  },
});

/**
 * Get presets by tag
 */
export const listByTag = query({
  args: {
    tag: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { tag, limit = 50 }) => {
    // Since we can't index into arrays directly, we'll filter in JS
    const publicPresets = await ctx.db
      .query("presets")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .collect();

    return publicPresets
      .filter((p) => p.tags.includes(tag))
      .slice(0, limit);
  },
});

/**
 * Count presets for admin dashboard
 */
export const count = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);

    // Only admins can see full count
    if (user.role !== "admin") {
      const userPresets = await ctx.db
        .query("presets")
        .withIndex("by_created_by", (q) => q.eq("createdBy", user._id))
        .collect();
      return { total: userPresets.length, public: 0, private: userPresets.length };
    }

    const allPresets = await ctx.db.query("presets").collect();
    const publicCount = allPresets.filter((p) => p.isPublic).length;

    return {
      total: allPresets.length,
      public: publicCount,
      private: allPresets.length - publicCount,
    };
  },
});
