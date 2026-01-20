/**
 * Preset Mutations
 *
 * Write operations for managing design presets
 */

import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

/**
 * Create a new preset
 */
export const create = mutation({
  args: {
    presetId: v.string(),
    name: v.string(),
    description: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
    version: v.string(),
    preset: v.any(), // Complete DesignPreset JSON
    isPublic: v.optional(v.boolean()),
    isBuiltin: v.optional(v.boolean()),
    extractedFrom: v.optional(
      v.object({
        path: v.string(),
        detectedBy: v.union(v.literal("ai"), v.literal("manual")),
        confidence: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Check if preset ID already exists
    const existing = await ctx.db
      .query("presets")
      .withIndex("by_preset_id", (q) => q.eq("presetId", args.presetId))
      .first();

    if (existing) {
      throw new ConvexError(`Preset with ID '${args.presetId}' already exists`);
    }

    // Get user record to link authorId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    const now = Date.now();

    const presetId = await ctx.db.insert("presets", {
      presetId: args.presetId,
      name: args.name,
      description: args.description,
      author: args.author,
      authorId: user?._id,
      tags: args.tags,
      version: args.version,
      preset: args.preset,
      isPublic: args.isPublic ?? false,
      isBuiltin: args.isBuiltin ?? false,
      downloads: 0,
      rating: undefined,
      ratingCount: undefined,
      extractedFrom: args.extractedFrom,
      createdAt: now,
      updatedAt: now,
    });

    return presetId;
  },
});

/**
 * Update an existing preset
 */
export const update = mutation({
  args: {
    id: v.id("presets"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    version: v.optional(v.string()),
    preset: v.optional(v.any()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const preset = await ctx.db.get(args.id);
    if (!preset) {
      throw new ConvexError("Preset not found");
    }

    // Check if user is author or admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    const isAuthor = user && preset.authorId === user._id;
    const isAdmin = user?.role === "admin";

    if (!isAuthor && !isAdmin) {
      throw new ConvexError("Only the author or admin can update this preset");
    }

    // Prepare update object
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.version !== undefined) updates.version = args.version;
    if (args.preset !== undefined) updates.preset = args.preset;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.id, updates);

    return { success: true };
  },
});

/**
 * Delete a preset
 */
export const deletePreset = mutation({
  args: {
    id: v.id("presets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const preset = await ctx.db.get(args.id);
    if (!preset) {
      throw new ConvexError("Preset not found");
    }

    // Only author or admin can delete
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    const isAuthor = user && preset.authorId === user._id;
    const isAdmin = user?.role === "admin";

    if (!isAuthor && !isAdmin) {
      throw new ConvexError("Only the author or admin can delete this preset");
    }

    // Don't allow deleting builtin presets unless admin
    if (preset.isBuiltin && !isAdmin) {
      throw new ConvexError("Cannot delete builtin presets");
    }

    // Delete associated ratings
    const ratings = await ctx.db
      .query("presetRatings")
      .withIndex("by_preset", (q) => q.eq("presetId", preset.presetId))
      .collect();

    for (const rating of ratings) {
      await ctx.db.delete(rating._id);
    }

    // Delete associated installations
    const installations = await ctx.db
      .query("presetInstallations")
      .withIndex("by_preset", (q) => q.eq("presetId", preset.presetId))
      .collect();

    for (const installation of installations) {
      await ctx.db.delete(installation._id);
    }

    // Delete preset
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

/**
 * Publish a preset (make it public)
 */
export const publish = mutation({
  args: {
    id: v.id("presets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const preset = await ctx.db.get(args.id);
    if (!preset) {
      throw new ConvexError("Preset not found");
    }

    // Check if user is author
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || preset.authorId !== user._id) {
      throw new ConvexError("Only the author can publish this preset");
    }

    await ctx.db.patch(args.id, {
      isPublic: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Unpublish a preset (make it private)
 */
export const unpublish = mutation({
  args: {
    id: v.id("presets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const preset = await ctx.db.get(args.id);
    if (!preset) {
      throw new ConvexError("Preset not found");
    }

    // Check if user is author
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || preset.authorId !== user._id) {
      throw new ConvexError("Only the author can unpublish this preset");
    }

    // Don't allow unpublishing builtin presets
    if (preset.isBuiltin) {
      throw new ConvexError("Cannot unpublish builtin presets");
    }

    await ctx.db.patch(args.id, {
      isPublic: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Rate a preset
 */
export const rate = mutation({
  args: {
    presetId: v.string(),
    rating: v.number(),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new ConvexError("Rating must be between 1 and 5");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Check if preset exists
    const preset = await ctx.db
      .query("presets")
      .withIndex("by_preset_id", (q) => q.eq("presetId", args.presetId))
      .first();

    if (!preset) {
      throw new ConvexError("Preset not found");
    }

    const now = Date.now();

    // Check if user already rated this preset
    const existing = await ctx.db
      .query("presetRatings")
      .withIndex("by_preset_user", (q) =>
        q.eq("presetId", args.presetId).eq("userId", user._id)
      )
      .first();

    if (existing) {
      // Update existing rating
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        review: args.review,
        updatedAt: now,
      });
    } else {
      // Create new rating
      await ctx.db.insert("presetRatings", {
        presetId: args.presetId,
        userId: user._id,
        rating: args.rating,
        review: args.review,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Recalculate average rating
    const allRatings = await ctx.db
      .query("presetRatings")
      .withIndex("by_preset", (q) => q.eq("presetId", args.presetId))
      .collect();

    const avgRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await ctx.db.patch(preset._id, {
      rating: avgRating,
      ratingCount: allRatings.length,
      updatedAt: now,
    });

    return { success: true, averageRating: avgRating };
  },
});

/**
 * Install a preset (track installation)
 */
export const install = mutation({
  args: {
    presetId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Check if preset exists
    const preset = await ctx.db
      .query("presets")
      .withIndex("by_preset_id", (q) => q.eq("presetId", args.presetId))
      .first();

    if (!preset) {
      throw new ConvexError("Preset not found");
    }

    const now = Date.now();

    // Check if already installed
    const existing = await ctx.db
      .query("presetInstallations")
      .withIndex("by_preset_user", (q) =>
        q.eq("presetId", args.presetId).eq("userId", user._id)
      )
      .first();

    if (existing) {
      // Update last used
      await ctx.db.patch(existing._id, {
        lastUsed: now,
      });
    } else {
      // Create new installation
      await ctx.db.insert("presetInstallations", {
        presetId: args.presetId,
        userId: user._id,
        installedAt: now,
        lastUsed: now,
      });

      // Increment download counter
      await ctx.db.patch(preset._id, {
        downloads: preset.downloads + 1,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Increment download counter
 */
export const incrementDownloads = mutation({
  args: {
    presetId: v.string(),
  },
  handler: async (ctx, args) => {
    const preset = await ctx.db
      .query("presets")
      .withIndex("by_preset_id", (q) => q.eq("presetId", args.presetId))
      .first();

    if (!preset) {
      throw new ConvexError("Preset not found");
    }

    await ctx.db.patch(preset._id, {
      downloads: preset.downloads + 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Bulk create presets (admin only, for seeding builtin presets)
 */
export const bulkCreate = mutation({
  args: {
    presets: v.array(
      v.object({
        presetId: v.string(),
        name: v.string(),
        description: v.string(),
        author: v.string(),
        tags: v.array(v.string()),
        version: v.string(),
        preset: v.any(),
        isPublic: v.boolean(),
        isBuiltin: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // Admin only
    if (user?.role !== "admin") {
      throw new ConvexError("Admin access required");
    }

    const now = Date.now();
    const created = [];

    for (const presetData of args.presets) {
      // Check if already exists
      const existing = await ctx.db
        .query("presets")
        .withIndex("by_preset_id", (q) => q.eq("presetId", presetData.presetId))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("presets", {
          ...presetData,
          authorId: user._id,
          downloads: 0,
          rating: undefined,
          ratingCount: undefined,
          extractedFrom: undefined,
          createdAt: now,
          updatedAt: now,
        });
        created.push(id);
      }
    }

    return { success: true, created: created.length };
  },
});
