import type { Doc, Id } from "./_generated/dataModel";

// ==================== CONVENIENCE TYPE EXPORTS ====================

// Core entities
export type User = Doc<"users">;
export type Interest = Doc<"interests">;
export type Spot = Doc<"spots">;
export type Collection = Doc<"collections">;
export type Trip = Doc<"trips">;
export type CheckIn = Doc<"checkIns">;
export type Recommendation = Doc<"recommendations">;
export type Notification = Doc<"notifications">;

// Relations
export type UserInterest = Doc<"userInterests">;
export type SpotInterest = Doc<"spotInterests">;
export type CollectionSpot = Doc<"collectionSpots">;
export type TripSpot = Doc<"tripSpots">;
export type TripCollaborator = Doc<"tripCollaborators">;
export type Favorite = Doc<"favorites">;
export type Tag = Doc<"tags">;
export type SpotTag = Doc<"spotTags">;

// System
export type Activity = Doc<"activities">;
export type Embedding = Doc<"embeddings">;
export type LLMUsage = Doc<"llmUsage">;
export type ModelCache = Doc<"modelCache">;
export type NotificationPreference = Doc<"notificationPreferences">;
export type DeviceToken = Doc<"deviceTokens">;

// ==================== ID TYPES ====================

export type UserId = Id<"users">;
export type InterestId = Id<"interests">;
export type SpotId = Id<"spots">;
export type CollectionId = Id<"collections">;
export type TripId = Id<"trips">;
export type CheckInId = Id<"checkIns">;
export type RecommendationId = Id<"recommendations">;
export type NotificationId = Id<"notifications">;

// ==================== UTILITY TYPES ====================

// Remove Convex system fields
export type WithoutSystemFields<T> = Omit<T, "_id" | "_creationTime">;

// Add timestamps
export type WithTimestamps<T> = T & {
  createdAt: number;
  updatedAt: number;
};

// Make fields optional for updates
export type PartialFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// ==================== ENUMS ====================

export const UserRole = {
  USER: "user",
  ADMIN: "admin",
} as const;

export const CollaboratorRole = {
  VIEWER: "viewer",
  EDITOR: "editor",
  ADMIN: "admin",
} as const;

export const InterestSource = {
  ONBOARDING: "onboarding",
  EXPLICIT: "explicit",
  INFERRED: "inferred",
} as const;

export const SpotInterestSource = {
  MANUAL: "manual",
  AI_GENERATED: "ai_generated",
  USER_CONTRIBUTED: "user_contributed",
} as const;

export const LLMTier = {
  PREMIUM: "PREMIUM",
  STANDARD: "STANDARD",
} as const;

export const DigestFrequency = {
  DAILY: "daily",
  WEEKLY: "weekly",
  NEVER: "never",
} as const;

// ==================== CUSTOM TYPES ====================

// Spot with populated interests
export type SpotWithInterests = Spot & {
  interests: Array<{
    interest: Interest;
    strength: number;
  }>;
};

// User with populated interests
export type UserWithInterests = User & {
  interests: Array<{
    interest: Interest;
    strength: number;
  }>;
};

// Collection with spots
export type CollectionWithSpots = Collection & {
  spots: Array<{
    spot: Spot;
    notes?: string;
    order?: number;
  }>;
  spotCount: number;
};

// Trip with collaborators and spots
export type TripWithDetails = Trip & {
  collaborators: Array<{
    user: User;
    role: string;
  }>;
  spots: Array<{
    spot: Spot;
    day?: number;
    time?: string;
    notes?: string;
    order?: number;
  }>;
};

// Recommendation with spot details
export type RecommendationWithSpot = Recommendation & {
  spot: Spot;
  interest?: Interest;
};

// LLM Client Types
export type ModelTier = (typeof LLMTier)[keyof typeof LLMTier];
export type ModelProvider = "openai" | "anthropic";

export type ModelConfig = {
  provider: ModelProvider;
  model: string;
};

export type APIKeys = {
  openai?: string;
  anthropic?: string;
  openrouter?: string;
  google?: string;
};
