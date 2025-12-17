"use node";

/**
 * AI-Powered Interest Actions
 *
 * Handles LLM-based interest generation for location-aware suggestions.
 */

import { v } from "convex/values";
import { generateObject } from "ai";
import { z } from "zod";
import { action } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { getLLMClient } from "../../lib/llm";

// Schema for generated interests
const GeneratedInterestsSchema = z.object({
  interests: z
    .array(
      z.object({
        name: z.string(),
        reason: z.string(),
      })
    )
    .describe("List of relevant interests for the location"),
  reasoning: z.string().describe("Brief explanation of the selection"),
});

interface SuggestedInterest {
  name: string;
  reason: string;
  id: string;
  category?: string;
}

interface SuggestionsResponse {
  interests: SuggestedInterest[];
  source: "personalized" | "llm" | "trending";
}

/**
 * Get personalized interest suggestions based on location
 */
export const getSuggestions = action({
  args: {
    location: v.optional(v.string()),
    currentInterests: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<SuggestionsResponse> => {
    const limit = args.limit ?? 20;
    const location = args.location ?? "San Francisco";
    const currentInterests = args.currentInterests ?? [];

    // Get authenticated user (optional for this action)
    const identity = await ctx.auth.getUserIdentity();

    // First, try to get trending interests from the database
    const trending = (await ctx.runQuery(
      internal.app.interests.internal.getTrendingInterests as any,
      { limit: limit * 2 }
    )) as Array<{ _id: string; name: string; category?: string }>;

    // Filter out interests user already has
    const filteredTrending = trending.filter(
      (i) =>
        !currentInterests
          .map((c) => c.toLowerCase())
          .includes(i.name.toLowerCase())
    );

    // If we have enough trending interests, return them
    if (filteredTrending.length >= limit) {
      return {
        interests: filteredTrending.slice(0, limit).map((i) => ({
          name: i.name,
          reason: "Trending interest",
          id: i._id,
          category: i.category,
        })),
        source: "trending",
      };
    }

    // Otherwise, use LLM to generate location-specific suggestions
    try {
      const llmClient = getLLMClient();
      const model = llmClient.getModelForOperation("interest_suggestions");

      const result = await generateObject({
        model,
        schema: GeneratedInterestsSchema,
        prompt: `Generate a list of ${limit} diverse and interesting activity/interest categories that would be particularly relevant for someone visiting or living in ${location}.

${currentInterests.length > 0 ? `The user already has these interests, so suggest DIFFERENT ones: ${currentInterests.join(", ")}` : ""}

Focus on:
1. Local specialties and cultural experiences unique to ${location}
2. Popular activities in the area
3. Seasonal or trending experiences
4. Mix of indoor and outdoor activities
5. Various categories (food, culture, nature, nightlife, etc.)

Return simple, one or two word interest names that are easily recognizable.
Examples: "Coffee", "Hiking", "Art", "Live Music", "Dim Sum", "Street Art"`,
      });

      const generated = result.object.interests
        .filter(
          (i) =>
            !currentInterests
              .map((c) => c.toLowerCase())
              .includes(i.name.toLowerCase())
        )
        .slice(0, limit);

      return {
        interests: generated.map((i) => ({
          name: i.name,
          reason: i.reason,
          id: i.name.toLowerCase().replace(/\s+/g, "-"),
          category: undefined,
        })),
        source: "llm",
      };
    } catch (error) {
      console.error("[INTERESTS] LLM generation failed:", error);

      // Fall back to trending
      return {
        interests: filteredTrending.slice(0, limit).map((i) => ({
          name: i.name,
          reason: "Trending interest",
          id: i._id,
          category: i.category,
        })),
        source: "trending",
      };
    }
  },
});

/**
 * Get interests for a user based on their profile
 */
export const getForUser = action({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<SuggestionsResponse> => {
    const limit = args.limit ?? 20;

    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return trending for unauthenticated users
      const trending = (await ctx.runQuery(
        internal.app.interests.internal.getTrendingInterests as any,
        { limit }
      )) as Array<{ _id: string; name: string; category?: string }>;

      return {
        interests: trending.map((i) => ({
          name: i.name,
          reason: "Popular interest",
          id: i._id,
          category: i.category,
        })),
        source: "trending",
      };
    }

    const user = await ctx.runQuery(internal.lib.auth._getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get user's current interests to exclude them
    const userInterests = (await ctx.runQuery(
      internal.app.interests.internal.getUserInterestNames as any,
      { userId: user._id }
    )) as string[];

    // Get personalized suggestions based on user's location
    const location = user.location ?? "San Francisco";

    // Get trending interests first
    const trending = (await ctx.runQuery(
      internal.app.interests.internal.getTrendingInterests as any,
      { limit: limit * 2 }
    )) as Array<{ _id: string; name: string; category?: string }>;

    // Filter out interests user already has
    const filteredTrending = trending.filter(
      (i) =>
        !userInterests.map((c) => c.toLowerCase()).includes(i.name.toLowerCase())
    );

    // If we have enough trending interests, return them
    if (filteredTrending.length >= limit) {
      return {
        interests: filteredTrending.slice(0, limit).map((i) => ({
          name: i.name,
          reason: "Trending interest",
          id: i._id,
          category: i.category,
        })),
        source: "trending",
      };
    }

    // Use LLM to generate location-specific suggestions
    try {
      const llmClient = getLLMClient();
      const model = llmClient.getModelForOperation("interest_suggestions");

      const result = await generateObject({
        model,
        schema: GeneratedInterestsSchema,
        prompt: `Generate a list of ${limit} diverse and interesting activity/interest categories that would be particularly relevant for someone visiting or living in ${location}.

${userInterests.length > 0 ? `The user already has these interests, so suggest DIFFERENT ones: ${userInterests.join(", ")}` : ""}

Focus on:
1. Local specialties and cultural experiences unique to ${location}
2. Popular activities in the area
3. Seasonal or trending experiences
4. Mix of indoor and outdoor activities
5. Various categories (food, culture, nature, nightlife, etc.)

Return simple, one or two word interest names that are easily recognizable.
Examples: "Coffee", "Hiking", "Art", "Live Music", "Dim Sum", "Street Art"`,
      });

      const generated = result.object.interests
        .filter(
          (i) =>
            !userInterests.map((c) => c.toLowerCase()).includes(i.name.toLowerCase())
        )
        .slice(0, limit);

      return {
        interests: generated.map((i) => ({
          name: i.name,
          reason: i.reason,
          id: i.name.toLowerCase().replace(/\s+/g, "-"),
          category: undefined,
        })),
        source: "personalized",
      };
    } catch (error) {
      console.error("[INTERESTS] LLM generation failed:", error);
      return {
        interests: filteredTrending.slice(0, limit).map((i) => ({
          name: i.name,
          reason: "Trending interest",
          id: i._id,
          category: i.category,
        })),
        source: "trending",
      };
    }
  },
});
