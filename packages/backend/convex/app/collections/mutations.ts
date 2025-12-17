import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getAuthUser, requireOwnership } from "../../lib/auth";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);

    const collectionId = await ctx.db.insert("collections", {
      userId: user._id,
      name: args.name,
      description: args.description,
      isPublic: args.isPublic,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return collectionId;
  },
});

export const addSpot = mutation({
  args: {
    collectionId: v.id("collections"),
    spotId: v.id("spots"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const collection = await ctx.db.get(args.collectionId);

    if (!collection) throw new Error("Collection not found");
    requireOwnership(user._id, collection.userId);

    // Check if already added
    const existing = await ctx.db
      .query("collectionSpots")
      .withIndex("by_collection_spot", (q) =>
        q.eq("collectionId", args.collectionId).eq("spotId", args.spotId)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    const collectionSpotId = await ctx.db.insert("collectionSpots", {
      collectionId: args.collectionId,
      spotId: args.spotId,
      notes: args.notes,
      addedAt: Date.now(),
    });

    return collectionSpotId;
  },
});

export const removeSpot = mutation({
  args: {
    collectionId: v.id("collections"),
    spotId: v.id("spots"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const collection = await ctx.db.get(args.collectionId);

    if (!collection) throw new Error("Collection not found");
    requireOwnership(user._id, collection.userId);

    const collectionSpot = await ctx.db
      .query("collectionSpots")
      .withIndex("by_collection_spot", (q) =>
        q.eq("collectionId", args.collectionId).eq("spotId", args.spotId)
      )
      .unique();

    if (collectionSpot) {
      await ctx.db.delete(collectionSpot._id);
    }

    return true;
  },
});

export const deleteCollection = mutation({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const collection = await ctx.db.get(args.collectionId);

    if (!collection) throw new Error("Collection not found");
    requireOwnership(user._id, collection.userId);

    // Delete all collection spots
    const collectionSpots = await ctx.db
      .query("collectionSpots")
      .withIndex("by_collection", (q) =>
        q.eq("collectionId", args.collectionId)
      )
      .collect();

    for (const cs of collectionSpots) {
      await ctx.db.delete(cs._id);
    }

    // Delete collection
    await ctx.db.delete(args.collectionId);

    return true;
  },
});
