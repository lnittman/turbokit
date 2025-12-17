"use node";

/**
 * AI-Powered Recommendation Actions
 *
 * Handles natural language queries to find spots using LLM for intent extraction.
 */

import { v } from "convex/values";
import { generateObject } from "ai";
import { z } from "zod";
import { action } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { getLLMClient } from "../../lib/llm";

// Schema for parsed query intent
const QueryIntentSchema = z.object({
  intent: z.enum([
    "find_spots",
    "plan_trip",
    "get_recommendations",
    "explore_area",
    "find_specific",
  ]),
  location: z.string().optional().describe("City, neighborhood, or region"),
  interests: z.array(z.string()).describe("Relevant interests or categories"),
  keywords: z.array(z.string()).describe("Search keywords from the query"),
  filters: z
    .object({
      minRating: z.number().optional(),
      maxDistance: z.number().optional(),
      priceRange: z.string().optional(),
    })
    .optional(),
  reasoning: z.string().describe("Brief explanation of how you parsed this query"),
});

type QueryIntent = z.infer<typeof QueryIntentSchema>;

// Result type for search
interface SpotResult {
  _id: string;
  name: string;
  description?: string;
  city: string;
  rating?: number;
  imageUrl?: string;
  relevanceScore: number;
  matchReason: string;
}

interface SearchResponse {
  spots: SpotResult[];
  intent: QueryIntent;
  totalResults: number;
  searchDuration: number;
}

interface PersonalizedResponse {
  spots: SpotResult[];
  source: "personalized" | "popular";
}

/**
 * Natural language spot search
 */
export const searchByNaturalLanguage = action({
  args: {
    query: v.string(),
    location: v.optional(v.string()), // User's current location for context
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<SearchResponse> => {
    const startTime = Date.now();
    const limit = args.limit ?? 10;

    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.runQuery(internal.lib.auth._getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Parse query intent using LLM
    const llmClient = getLLMClient();
    const model = llmClient.getModelForOperation("natural_language_query");

    const result = await generateObject({
      model,
      schema: QueryIntentSchema,
      prompt: `Parse this spot search query and extract the user's intent.

User query: "${args.query}"
${args.location ? `User's current location: ${args.location}` : ""}

Extract:
1. The main intent (finding spots, planning a trip, getting recommendations, etc.)
2. Any location mentioned or implied
3. Relevant interests/categories (coffee, hiking, restaurants, etc.)
4. Keywords for text search
5. Any filters (rating, distance, price)

Be generous with interests - include related categories that might help find relevant spots.`,
    });

    const intent = result.object;

    // Search for spots based on parsed intent
    const spots = await searchSpots(ctx, intent, limit);

    // Track the search
    await ctx.runMutation(
      internal.app.recommendations.internal.trackSearch as any,
      {
        userId: user._id,
        query: args.query,
        intent,
        resultCount: spots.length,
      }
    );

    const searchDuration = Date.now() - startTime;

    return {
      spots,
      intent,
      totalResults: spots.length,
      searchDuration,
    };
  },
});

/**
 * Search spots based on parsed intent
 */
async function searchSpots(
  ctx: any,
  intent: QueryIntent,
  limit: number
): Promise<SpotResult[]> {
  const results: SpotResult[] = [];
  const seenIds = new Set<string>();

  // 1. Search by name if we have keywords
  if (intent.keywords.length > 0) {
    for (const keyword of intent.keywords.slice(0, 3)) {
      const nameResults = (await ctx.runQuery(
        internal.app.recommendations.internal.searchSpotsByName as any,
        { query: keyword, city: intent.location, limit: 10 }
      )) as Array<Omit<SpotResult, "relevanceScore" | "matchReason">>;

      for (const spot of nameResults) {
        if (!seenIds.has(spot._id)) {
          seenIds.add(spot._id);
          results.push({
            ...spot,
            relevanceScore: 0.9,
            matchReason: `Matches "${keyword}"`,
          });
        }
      }
    }
  }

  // 2. Search by interests if we have them
  if (intent.interests.length > 0) {
    for (const interest of intent.interests.slice(0, 3)) {
      const interestResults = (await ctx.runQuery(
        internal.app.recommendations.internal.searchSpotsByInterest as any,
        { interest, city: intent.location, limit: 10 }
      )) as Array<Omit<SpotResult, "matchReason">>;

      for (const spot of interestResults) {
        if (!seenIds.has(spot._id)) {
          seenIds.add(spot._id);
          results.push({
            ...spot,
            relevanceScore: spot.relevanceScore ?? 0.7,
            matchReason: `Related to "${interest}"`,
          });
        }
      }
    }
  }

  // 3. Fall back to location-based search if no results
  if (results.length === 0 && intent.location) {
    const locationResults = (await ctx.runQuery(
      internal.app.recommendations.internal.searchSpotsByCity as any,
      { city: intent.location, limit }
    )) as Array<Omit<SpotResult, "relevanceScore" | "matchReason">>;

    for (const spot of locationResults) {
      results.push({
        ...spot,
        relevanceScore: 0.5,
        matchReason: `In ${intent.location}`,
      });
    }
  }

  // Sort by relevance and apply limit
  return results
    .sort((a, b) => {
      // First by relevance score
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      // Then by rating
      return (b.rating ?? 0) - (a.rating ?? 0);
    })
    .slice(0, limit);
}

/**
 * Get personalized recommendations based on user interests
 */
export const getPersonalized = action({
  args: {
    location: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<PersonalizedResponse> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.runQuery(internal.lib.auth._getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get user's top interests
    const userInterests = (await ctx.runQuery(
      internal.app.recommendations.internal.getUserTopInterests as any,
      { userId: user._id, limit: 5 }
    )) as Array<{ interestId: string; interestName: string; strength: number }>;

    if (userInterests.length === 0) {
      // Return popular spots if no interests
      const popular = (await ctx.runQuery(
        internal.app.recommendations.internal.getPopularSpots as any,
        { city: args.location, limit: args.limit ?? 10 }
      )) as SpotResult[];
      return { spots: popular, source: "popular" as const };
    }

    // Find spots matching user interests
    const results: SpotResult[] = [];
    const seenIds = new Set<string>();

    for (const ui of userInterests) {
      const spots = (await ctx.runQuery(
        internal.app.recommendations.internal.getSpotsByInterestId as any,
        {
          interestId: ui.interestId,
          city: args.location,
          limit: 5,
        }
      )) as Array<SpotResult & { relevanceScore: number }>;

      for (const spot of spots) {
        if (!seenIds.has(spot._id)) {
          seenIds.add(spot._id);
          results.push({
            ...spot,
            relevanceScore: spot.relevanceScore * ui.strength,
            matchReason: `Based on your interest in ${ui.interestName}`,
          });
        }
      }
    }

    return {
      spots: results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, args.limit ?? 10),
      source: "personalized",
    };
  },
});
