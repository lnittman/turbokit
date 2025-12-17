/**
 * Type adapters to match spots-v1 interfaces with Convex schema
 */

import type { Doc } from "@spots/backend/dataModel";

// Original Spot interface from spots-v1
export interface Spot {
  id: string;
  name: string;
  description: string;
  type: string;
  address: string;
  neighborhood: string;
  city: string;
  coordinates: [number, number];
  interests: string[];
  priceRange: 1 | 2 | 3 | 4;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  website?: string;
  phone?: string;
  tags: string[];
  popular?: boolean;
  verified?: boolean;
  emoji?: string;
}

// Original Interest interface from spots-v1
export interface Interest {
  id: string;
  name: string;
  description?: string;
  category?: string;
  emoji?: string;
  color?: string;
}

/**
 * Convert Convex spot to v1 Spot format
 */
export function toSpot(
  convexSpot: Doc<"spots">,
  interests?: string[],
  tags?: string[]
): Spot {
  return {
    id: convexSpot._id,
    name: convexSpot.name,
    description: convexSpot.description || "",
    type: convexSpot.metadata?.type || "location",
    address: convexSpot.address || "",
    neighborhood: convexSpot.metadata?.neighborhood || convexSpot.city,
    city: convexSpot.city,
    coordinates: [convexSpot.longitude, convexSpot.latitude],
    interests: interests || [],
    priceRange: (convexSpot.metadata?.priceRange || 2) as 1 | 2 | 3 | 4,
    rating: convexSpot.rating || 0,
    reviewCount: convexSpot.checkInsCount || 0,
    imageUrl: convexSpot.imageUrl,
    website: convexSpot.websiteUrl,
    phone: convexSpot.metadata?.phone,
    tags: tags || [],
    popular: convexSpot.metadata?.popular,
    verified: convexSpot.metadata?.verified,
    emoji: convexSpot.metadata?.emoji,
  };
}

/**
 * Convert Convex interest to v1 Interest format
 */
export function toInterest(convexInterest: Doc<"interests">): Interest {
  return {
    id: convexInterest._id,
    name: convexInterest.name,
    description: convexInterest.description,
    category: convexInterest.category,
    emoji: convexInterest.iconName,
    // Color not stored in schema - could be derived from category or name hash
    color: undefined,
  };
}

/**
 * Batch convert Convex spots to v1 format
 */
export function toSpots(convexSpots: Doc<"spots">[]): Spot[] {
  return convexSpots.map((spot) => toSpot(spot));
}

/**
 * Batch convert Convex interests to v1 format
 */
export function toInterests(convexInterests: Doc<"interests">[]): Interest[] {
  return convexInterests.map((interest) => toInterest(interest));
}
