import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getAuthUser } from "../../lib/auth";

export const toggleFavorite = mutation({
  args: { spotId: v.id("spots") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_spot", (q) =>
        q.eq("userId", user._id).eq("spotId", args.spotId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { favorited: false };
    }

    await ctx.db.insert("favorites", {
      userId: user._id,
      spotId: args.spotId,
      createdAt: Date.now(),
    });

    return { favorited: true };
  },
});

export const incrementCheckIns = mutation({
  args: { spotId: v.id("spots") },
  handler: async (ctx, args) => {
    const spot = await ctx.db.get(args.spotId);
    if (!spot) return null;

    await ctx.db.patch(args.spotId, {
      checkInsCount: (spot.checkInsCount ?? 0) + 1,
      updatedAt: Date.now(),
    });

    return spot.checkInsCount + 1;
  },
});

export const createCheckIn = mutation({
  args: {
    spotId: v.id("spots"),
    rating: v.optional(v.number()),
    comment: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);

    const checkInId = await ctx.db.insert("checkIns", {
      userId: user._id,
      spotId: args.spotId,
      rating: args.rating,
      comment: args.comment,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    });

    // Increment spot check-in count
    await ctx.scheduler.runAfter(
      0,
      "app/spots/mutations:incrementCheckIns" as any,
      {
        spotId: args.spotId,
      }
    );

    return checkInId;
  },
});
