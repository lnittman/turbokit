/**
 * Internal user management functions
 * 
 * These are called from webhooks and other internal processes,
 * not directly from the client.
 */

import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Sync user data from Clerk webhook
 * Creates or updates user in Convex database
 */
export const syncUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { clerkId, email, name, imageUrl } = args;
    
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    
    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email,
        name,
        imageUrl,
        updatedAt: Date.now(),
      });
      
      console.log(`Updated user ${clerkId}`);
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId,
        email,
        name,
        imageUrl,
        role: "user" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      console.log(`Created user ${clerkId}`);
      return userId;
    }
  },
});

/**
 * Delete user by Clerk ID
 * Called when user is deleted in Clerk
 */
export const deleteUserByClerkId = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    
    if (user) {
      await ctx.db.delete(user._id);
      console.log(`Deleted user ${clerkId}`);
    } else {
      console.warn(`User ${clerkId} not found for deletion`);
    }
  },
});