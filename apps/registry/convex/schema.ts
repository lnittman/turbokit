/**
 * TurboKit Global Registry Schema
 *
 * This is the GLOBAL preset registry that all TurboKit users access.
 * Users do NOT get this code when scaffolding - it stays in the turbokit repo.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /**
   * Global Preset Registry
   *
   * All verified/community presets available to TurboKit users
   */
  presets: defineTable({
    // Unique preset identifier
    presetId: v.string(),

    // Metadata
    name: v.string(),
    description: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
    version: v.string(),

    // Visibility & Type
    isPublic: v.boolean(),
    isBuiltin: v.boolean(), // TurboKit official presets
    isVerified: v.boolean(), // Community presets verified by TurboKit team

    // Full preset JSON (the actual design system definition)
    preset: v.any(),

    // Stats
    downloads: v.number(),
    rating: v.optional(v.number()),
    ratingCount: v.optional(v.number()),

    // Submission metadata
    submittedBy: v.optional(v.string()), // User ID if community submitted
    submittedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_preset_id", ["presetId"])
    .index("by_downloads", ["downloads"])
    .index("by_rating", ["rating"])
    .index("by_builtin", ["isBuiltin"])
    .index("by_verified", ["isVerified"])
    .index("by_public", ["isPublic"]),

  /**
   * Download Tracking
   *
   * Track which users have downloaded which presets (for analytics)
   */
  downloads: defineTable({
    presetId: v.string(),
    userId: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    downloadedAt: v.number(),
  })
    .index("by_preset", ["presetId"])
    .index("by_user", ["userId"])
    .index("by_date", ["downloadedAt"]),

  /**
   * Ratings
   *
   * User ratings for presets
   */
  ratings: defineTable({
    presetId: v.string(),
    userId: v.string(),
    rating: v.number(), // 1-5 stars
    review: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_preset", ["presetId"])
    .index("by_user", ["userId"]),
});
