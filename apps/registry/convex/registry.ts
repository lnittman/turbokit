/**
 * TurboKit Registry Internal Functions
 *
 * These are called by HTTP endpoints and are NOT exposed to clients
 */

import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";

/**
 * List all public presets
 */
export const listPresets = internalQuery({
  args: {
    filter: v.optional(
      v.union(v.literal("all"), v.literal("builtin"), v.literal("verified"))
    ),
  },
  handler: async (ctx, { filter = "all" }) => {
    let query = ctx.db.query("presets").withIndex("by_public", (q) =>
      q.eq("isPublic", true)
    );

    const presets = await query.collect();

    // Apply filter
    if (filter === "builtin") {
      return presets.filter((p) => p.isBuiltin);
    }
    if (filter === "verified") {
      return presets.filter((p) => p.isVerified || p.isBuiltin);
    }

    return presets;
  },
});

/**
 * Get a single preset by ID
 */
export const getPreset = internalQuery({
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
 * Track a download
 */
export const trackDownload = internalMutation({
  args: {
    presetId: v.string(),
    userId: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, { presetId, userId, userAgent }) => {
    // Insert download record
    await ctx.db.insert("downloads", {
      presetId,
      userId,
      userAgent,
      downloadedAt: Date.now(),
    });

    // Increment download count on preset
    const preset = await ctx.db
      .query("presets")
      .withIndex("by_preset_id", (q) => q.eq("presetId", presetId))
      .first();

    if (preset) {
      await ctx.db.patch(preset._id, {
        downloads: preset.downloads + 1,
      });
    }
  },
});

/**
 * Get registry stats
 */
export const getStats = internalQuery({
  args: {},
  handler: async (ctx) => {
    const allPresets = await ctx.db.query("presets").collect();
    const publicPresets = allPresets.filter((p) => p.isPublic);
    const builtinPresets = allPresets.filter((p) => p.isBuiltin);
    const verifiedPresets = allPresets.filter((p) => p.isVerified);
    const communityPresets = allPresets.filter(
      (p) => p.isPublic && !p.isBuiltin && !p.isVerified
    );

    const totalDownloads = allPresets.reduce(
      (sum, p) => sum + p.downloads,
      0
    );

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

/**
 * Seed built-in TurboKit presets
 *
 * Run this once to populate the registry with official presets
 */
export const seedBuiltinPresets = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const builtinPresets = [
      {
        presetId: "koto",
        name: "Koto",
        description:
          "iOS-inspired minimal design with glassmorphism effects, warm color palette, and linear tight layout. The default TurboKit preset.",
        author: "TurboKit",
        tags: ["ios", "minimal", "warm", "glass", "default"],
        version: "1.0.0",
        isPublic: true,
        isBuiltin: true,
        isVerified: true,
        preset: {
          id: "koto",
          name: "Koto",
          description: "Default TurboKit preset with iOS-inspired design",
          author: "TurboKit",
          tags: ["ios", "minimal", "warm"],
          version: "1.0.0",
          layers: {
            tokens: {
              colors: {
                semantic: {
                  background: "oklch(0.98 0.005 85)",
                  foreground: "oklch(0.2 0.01 85)",
                  primary: "oklch(0.22 0.01 85)",
                  "primary-foreground": "oklch(0.97 0.005 85)",
                },
              },
              radius: {
                DEFAULT: "0.375rem",
              },
            },
          },
          metadata: {
            category: "minimal",
            compatibility: ["next-15", "react-19"],
            features: ["iOS-inspired", "Warm colors", "Glassmorphism"],
          },
          preview: {
            light: {
              background: "#fafafa",
              foreground: "#333333",
              accent: "#6680ff",
            },
            dark: {
              background: "#0a0a0a",
              foreground: "#f0f0f0",
              accent: "#e86c3b",
            },
          },
        },
      },
      {
        presetId: "sacred",
        name: "Sacred",
        description:
          "Terminal-aesthetic design system with 17 switchable monospace fonts, character-based spacing, OKLCH color tinting, and box-shadow borders.",
        author: "Internet Development",
        tags: ["terminal", "monospace", "retro", "minimal", "tints"],
        version: "2.0.0",
        isPublic: true,
        isBuiltin: true,
        isVerified: true,
        preset: {
          id: "sacred",
          name: "Sacred",
          description: "Terminal aesthetic with monospace fonts",
          author: "Internet Development",
          tags: ["terminal", "monospace"],
          version: "2.0.0",
          layers: {
            tokens: {
              colors: {
                semantic: {
                  background: "rgb(255 255 255)",
                  foreground: "rgb(0 0 0)",
                },
              },
              radius: {
                DEFAULT: "0",
              },
            },
          },
          metadata: {
            category: "terminal",
            compatibility: ["next-15", "react-19"],
            features: ["17 monospace fonts", "OKLCH tinting", "Zero radius"],
          },
          preview: {
            light: {
              background: "#ffffff",
              foreground: "#000000",
              accent: "#5cff3b",
            },
            dark: {
              background: "#000000",
              foreground: "#ffffff",
              accent: "#ef6300",
            },
          },
        },
      },
      {
        presetId: "kumori",
        name: "Kumori",
        description:
          "iOS design language parity with exact iOS color values, glassmorphism effects, Iosevka Term typography, and playful animations.",
        author: "Luke Zhang",
        tags: ["ios", "modern", "glassmorphism", "minimal", "playful"],
        version: "1.0.0",
        isPublic: true,
        isBuiltin: true,
        isVerified: true,
        preset: {
          id: "kumori",
          name: "Kumori",
          description: "iOS parity with exact color values",
          author: "Luke Zhang",
          tags: ["ios", "modern"],
          version: "1.0.0",
          layers: {
            tokens: {
              colors: {
                semantic: {
                  background: "rgb(255 255 255)",
                  foreground: "rgb(0 0 0)",
                  primary: "rgb(102 128 255)",
                },
              },
              radius: {
                DEFAULT: "0.75rem",
              },
            },
          },
          metadata: {
            category: "modern",
            compatibility: ["next-15", "react-19"],
            features: [
              "iOS exact colors",
              "Glassmorphism",
              "Playful animations",
            ],
          },
          preview: {
            light: {
              background: "#ffffff",
              foreground: "#000000",
              accent: "#6680ff",
            },
            dark: {
              background: "#000000",
              foreground: "#ffffff",
              accent: "#6680ff",
            },
          },
        },
      },
    ];

    const results = [];

    for (const presetData of builtinPresets) {
      // Check if preset already exists
      const existing = await ctx.db
        .query("presets")
        .withIndex("by_preset_id", (q) => q.eq("presetId", presetData.presetId))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("presets", {
          ...presetData,
          downloads: 0,
          rating: undefined,
          ratingCount: undefined,
          submittedBy: undefined,
          submittedAt: undefined,
          createdAt: now,
          updatedAt: now,
        });

        results.push({ presetId: presetData.presetId, id, created: true });
      } else {
        results.push({
          presetId: presetData.presetId,
          id: existing._id,
          created: false,
          message: "Already exists",
        });
      }
    }

    return {
      success: true,
      seeded: results.filter((r) => r.created).length,
      skipped: results.filter((r) => !r.created).length,
      results,
    };
  },
});
