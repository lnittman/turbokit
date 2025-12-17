import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";

/**
 * Create a new preset
 */
export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    author: v.string(),
    version: v.string(),
    tags: v.array(v.string()),
    layers: v.any(),
    metadata: v.optional(v.any()),
    preview: v.optional(v.any()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { slug, name, description, author, version, tags, layers, metadata, preview, isPublic }
  ) => {
    const { user } = await requireAuth(ctx);

    // Check slug uniqueness
    const existing = await ctx.db
      .query("presets")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) {
      throw new Error(`Preset with slug "${slug}" already exists`);
    }

    // Validate slug format (kebab-case)
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      throw new Error("Slug must be kebab-case (lowercase letters, numbers, and hyphens)");
    }

    const now = Date.now();

    const presetId = await ctx.db.insert("presets", {
      slug,
      name,
      description,
      author,
      version,
      tags,
      layers,
      metadata: metadata ?? {
        createdAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
        isPublic: isPublic ?? false,
      },
      preview,
      isPublic: isPublic ?? false,
      isActive: false,
      createdBy: user._id,
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
    presetId: v.id("presets"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    author: v.optional(v.string()),
    version: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    layers: v.optional(v.any()),
    metadata: v.optional(v.any()),
    preview: v.optional(v.any()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { presetId, ...updates }) => {
    const { user } = await requireAuth(ctx);

    const preset = await ctx.db.get(presetId);
    if (!preset) {
      throw new Error("Preset not found");
    }

    // Only owner or admin can update
    if (preset.createdBy !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to update this preset");
    }

    const now = Date.now();

    await ctx.db.patch(presetId, {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.author !== undefined && { author: updates.author }),
      ...(updates.version !== undefined && { version: updates.version }),
      ...(updates.tags !== undefined && { tags: updates.tags }),
      ...(updates.layers !== undefined && { layers: updates.layers }),
      ...(updates.metadata !== undefined && { metadata: updates.metadata }),
      ...(updates.preview !== undefined && { preview: updates.preview }),
      ...(updates.isPublic !== undefined && { isPublic: updates.isPublic }),
      updatedAt: now,
    });
  },
});

/**
 * Delete a preset
 */
export const remove = mutation({
  args: { presetId: v.id("presets") },
  handler: async (ctx, { presetId }) => {
    const { user } = await requireAuth(ctx);

    const preset = await ctx.db.get(presetId);
    if (!preset) {
      throw new Error("Preset not found");
    }

    // Only owner or admin can delete
    if (preset.createdBy !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to delete this preset");
    }

    // Clear any user settings referencing this preset
    const settings = await ctx.db
      .query("userPresetSettings")
      .filter((q) => q.eq(q.field("activePresetId"), presetId))
      .collect();

    for (const setting of settings) {
      await ctx.db.patch(setting._id, {
        activePresetId: undefined,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.delete(presetId);
  },
});

/**
 * Set a preset as the system-wide active preset (admin only)
 */
export const setSystemActive = mutation({
  args: { presetId: v.id("presets") },
  handler: async (ctx, { presetId }) => {
    const { user } = await requireAuth(ctx);

    if (user.role !== "admin") {
      throw new Error("Only admins can set system active preset");
    }

    const preset = await ctx.db.get(presetId);
    if (!preset) {
      throw new Error("Preset not found");
    }

    // Deactivate current active preset
    const currentActive = await ctx.db
      .query("presets")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

    if (currentActive && currentActive._id !== presetId) {
      await ctx.db.patch(currentActive._id, { isActive: false });
    }

    // Activate the new preset
    await ctx.db.patch(presetId, { isActive: true });
  },
});

/**
 * Set the user's active preset
 */
export const setUserActive = mutation({
  args: {
    presetId: v.optional(v.id("presets")),
    overrides: v.optional(v.any()),
  },
  handler: async (ctx, { presetId, overrides }) => {
    const { user } = await requireAuth(ctx);

    // Validate preset exists and user can access it
    if (presetId) {
      const preset = await ctx.db.get(presetId);
      if (!preset) {
        throw new Error("Preset not found");
      }
      if (!preset.isPublic && preset.createdBy !== user._id) {
        throw new Error("Not authorized to use this preset");
      }
    }

    const existing = await ctx.db
      .query("userPresetSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        activePresetId: presetId,
        overrides,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userPresetSettings", {
        userId: user._id,
        activePresetId: presetId,
        overrides,
        updatedAt: now,
      });
    }
  },
});

/**
 * Update user's preset overrides
 */
export const updateOverrides = mutation({
  args: {
    overrides: v.any(),
  },
  handler: async (ctx, { overrides }) => {
    const { user } = await requireAuth(ctx);

    const existing = await ctx.db
      .query("userPresetSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        overrides,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userPresetSettings", {
        userId: user._id,
        overrides,
        updatedAt: now,
      });
    }
  },
});

/**
 * Duplicate a preset
 */
export const duplicate = mutation({
  args: {
    presetId: v.id("presets"),
    newSlug: v.string(),
    newName: v.optional(v.string()),
  },
  handler: async (ctx, { presetId, newSlug, newName }) => {
    const { user } = await requireAuth(ctx);

    const original = await ctx.db.get(presetId);
    if (!original) {
      throw new Error("Preset not found");
    }

    // Check access
    if (!original.isPublic && original.createdBy !== user._id) {
      throw new Error("Not authorized to duplicate this preset");
    }

    // Check slug uniqueness
    const existing = await ctx.db
      .query("presets")
      .withIndex("by_slug", (q) => q.eq("slug", newSlug))
      .first();

    if (existing) {
      throw new Error(`Preset with slug "${newSlug}" already exists`);
    }

    // Validate slug format
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(newSlug)) {
      throw new Error("Slug must be kebab-case");
    }

    const now = Date.now();

    const newPresetId = await ctx.db.insert("presets", {
      slug: newSlug,
      name: newName ?? `${original.name} (Copy)`,
      description: original.description,
      author: user.name ?? user.email,
      version: "1.0.0",
      tags: original.tags,
      layers: original.layers,
      metadata: {
        ...original.metadata,
        createdAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
        extends: [original.slug],
      },
      preview: original.preview,
      isPublic: false, // Duplicates start private
      isActive: false,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return newPresetId;
  },
});

/**
 * Toggle preset public/private status
 */
export const togglePublic = mutation({
  args: { presetId: v.id("presets") },
  handler: async (ctx, { presetId }) => {
    const { user } = await requireAuth(ctx);

    const preset = await ctx.db.get(presetId);
    if (!preset) {
      throw new Error("Preset not found");
    }

    // Only owner or admin can toggle
    if (preset.createdBy !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to modify this preset");
    }

    await ctx.db.patch(presetId, {
      isPublic: !preset.isPublic,
      updatedAt: Date.now(),
    });

    return !preset.isPublic;
  },
});
