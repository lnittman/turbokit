import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ==================== USER MANAGEMENT ====================

  users: defineTable({
    // Clerk integration
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    // Profile
    location: v.optional(v.string()),
    bio: v.optional(v.string()),

    // Onboarding
    onboardingComplete: v.boolean(),

    // Role
    role: v.union(v.literal("user"), v.literal("admin")),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActiveAt: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_onboarding", ["onboardingComplete"]),

  // ==================== INTERESTS & USER PREFERENCES ====================

  interests: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()), // "Popular", "Activities", "Arts & Culture", "Lifestyle"
    iconName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    // Trending
    trending: v.boolean(),
    trendScore: v.number(), // 0-100
    isSeasonal: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"])
    .index("by_trending", ["trending"])
    .index("by_trend_score", ["trendScore"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["category", "trending"],
    }),

  userInterests: defineTable({
    userId: v.id("users"),
    interestId: v.id("interests"),
    strength: v.number(), // 0-1, how strongly user likes this interest
    source: v.optional(
      v.union(
        v.literal("onboarding"),
        v.literal("explicit"),
        v.literal("inferred")
      )
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_interest", ["interestId"])
    .index("by_user_interest", ["userId", "interestId"])
    .index("by_user_strength", ["userId", "strength"]),

  // ==================== SPOTS (LOCATIONS) ====================

  spots: defineTable({
    name: v.string(),
    description: v.optional(v.string()),

    // Location
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),
    latitude: v.float64(),
    longitude: v.float64(),

    // Details
    rating: v.optional(v.number()), // 0-5
    checkInsCount: v.number(),
    imageUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    openingHours: v.optional(v.any()), // JSON structure

    // Metadata
    metadata: v.optional(v.any()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_city", ["city"])
    .index("by_country", ["country"])
    .index("by_city_country", ["city", "country"])
    .index("by_rating", ["rating"])
    .index("by_check_ins", ["checkInsCount"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["city", "country"],
    })
    .searchIndex("search_description", {
      searchField: "description",
      filterFields: ["city", "country"],
    }),

  spotInterests: defineTable({
    spotId: v.id("spots"),
    interestId: v.id("interests"),
    strength: v.number(), // 0-1, how relevant spot is to this interest
    source: v.optional(
      v.union(
        v.literal("manual"),
        v.literal("ai_generated"),
        v.literal("user_contributed")
      )
    ),
    createdAt: v.number(),
  })
    .index("by_spot", ["spotId"])
    .index("by_interest", ["interestId"])
    .index("by_spot_interest", ["spotId", "interestId"])
    .index("by_interest_strength", ["interestId", "strength"]),

  tags: defineTable({
    name: v.string(),
    category: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"]),

  spotTags: defineTable({
    spotId: v.id("spots"),
    tagId: v.id("tags"),
    createdAt: v.number(),
  })
    .index("by_spot", ["spotId"])
    .index("by_tag", ["tagId"])
    .index("by_spot_tag", ["spotId", "tagId"]),

  // ==================== USER INTERACTIONS ====================

  checkIns: defineTable({
    userId: v.id("users"),
    spotId: v.id("spots"),
    rating: v.optional(v.number()), // 1-5
    comment: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_spot", ["spotId"])
    .index("by_user_spot", ["userId", "spotId"])
    .index("by_created", ["createdAt"]),

  favorites: defineTable({
    userId: v.id("users"),
    spotId: v.id("spots"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_spot", ["spotId"])
    .index("by_user_spot", ["userId", "spotId"]),

  // ==================== COLLECTIONS ====================

  collections: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_public", ["userId", "isPublic"])
    .index("by_public", ["isPublic"]),

  collectionSpots: defineTable({
    collectionId: v.id("collections"),
    spotId: v.id("spots"),
    notes: v.optional(v.string()),
    order: v.optional(v.number()),
    addedAt: v.number(),
  })
    .index("by_collection", ["collectionId"])
    .index("by_spot", ["spotId"])
    .index("by_collection_spot", ["collectionId", "spotId"])
    .index("by_collection_order", ["collectionId", "order"]),

  // ==================== TRIPS ====================

  trips: defineTable({
    userId: v.id("users"), // Creator
    name: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_public", ["isPublic"])
    .index("by_start_date", ["startDate"]),

  tripCollaborators: defineTable({
    tripId: v.id("trips"),
    userId: v.id("users"),
    role: v.union(v.literal("viewer"), v.literal("editor"), v.literal("admin")),
    joinedAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_user", ["userId"])
    .index("by_trip_user", ["tripId", "userId"]),

  tripSpots: defineTable({
    tripId: v.id("trips"),
    spotId: v.id("spots"),
    day: v.optional(v.number()), // Which day of trip
    time: v.optional(v.string()), // Time of day
    duration: v.optional(v.number()), // Minutes
    notes: v.optional(v.string()),
    order: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_spot", ["spotId"])
    .index("by_trip_spot", ["tripId", "spotId"])
    .index("by_trip_day", ["tripId", "day"])
    .index("by_trip_order", ["tripId", "order"]),

  // ==================== AI RECOMMENDATIONS ====================

  recommendations: defineTable({
    userId: v.id("users"),
    spotId: v.id("spots"),
    interestId: v.optional(v.id("interests")),
    score: v.number(), // 0-1 relevance score
    reasoning: v.optional(v.string()), // AI explanation
    source: v.optional(v.string()), // Which model/agent generated
    location: v.string(), // City/region
    metadata: v.optional(v.any()),
    expiresAt: v.optional(v.number()), // When to refresh
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_spot", ["spotId"])
    .index("by_user_location", ["userId", "location"])
    .index("by_user_score", ["userId", "score"])
    .index("by_expires", ["expiresAt"]),

  // ==================== EMBEDDINGS (RAG) ====================

  embeddings: defineTable({
    embedding: v.array(v.float64()),
    text: v.string(),
    source: v.string(), // "spot_description", "interest_context", "user_behavior"
    sourceId: v.optional(v.string()),
    spotId: v.optional(v.id("spots")),
    interestId: v.optional(v.id("interests")),
    metadata: v.any(),
    createdAt: v.number(),
  })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536, // OpenAI text-embedding-3-small
      filterFields: ["source"],
    })
    .index("by_source", ["source"])
    .index("by_spot", ["spotId"])
    .index("by_interest", ["interestId"]),

  // ==================== LLM COST TRACKING ====================

  llmUsage: defineTable({
    operation: v.string(), // "recommendation_generation", "user_search", "trending_analysis"
    tier: v.union(v.literal("PREMIUM"), v.literal("STANDARD")),
    model: v.string(), // "gpt-4o", "gpt-4o-mini", "claude-sonnet-4.5"
    provider: v.string(), // "openai", "anthropic"
    inputTokens: v.number(),
    outputTokens: v.number(),
    cached: v.boolean(),
    userId: v.optional(v.id("users")), // If user-scoped operation
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_operation", ["operation"])
    .index("by_tier", ["tier"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user", ["userId"]),

  // ==================== IMAGE GENERATION ====================

  imageJobs: defineTable({
    userId: v.id("users"),
    prompt: v.string(),
    provider: v.string(), // "openai", "fal", "openrouter"
    inputImageUrl: v.optional(v.string()),
    status: v.string(), // "queued", "processing", "completed", "failed"
    result: v.optional(
      v.object({
        url: v.string(),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        contentType: v.optional(v.string()),
      })
    ),
    error: v.optional(v.string()),
    attempts: v.number(),
    correlationId: v.string(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"])
    .index("by_correlation", ["correlationId"]),

  // Model response cache
  modelCache: defineTable({
    cacheKey: v.string(), // Hash of (operation + inputs)
    response: v.string(),
    model: v.string(),
    operation: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_cache_key", ["cacheKey"])
    .index("by_operation", ["operation"])
    .index("by_expires", ["expiresAt"]),

  // ==================== ACTIVITY & AUDIT ====================

  activities: defineTable({
    userId: v.id("users"),
    action: v.string(), // "spot_viewed", "interest_added", "recommendation_accepted"
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"])
    .index("by_resource", ["resourceType", "resourceId"]),

  // ==================== NOTIFICATIONS ====================

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "new_spot_in_interest", "trip_invitation", etc.
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    link: v.optional(v.string()),
    icon: v.optional(v.string()),
    read: v.boolean(),
    readAt: v.optional(v.number()),
    archived: v.boolean(),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"])
    .index("by_user_archived", ["userId", "archived"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"]),

  deviceTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    platform: v.union(v.literal("fcm"), v.literal("apns"), v.literal("web")),
    deviceInfo: v.optional(v.any()),
    lastUsed: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"])
    .index("by_platform", ["platform"]),

  notificationPreferences: defineTable({
    userId: v.id("users"),
    email: v.boolean(),
    push: v.boolean(),
    inApp: v.boolean(),
    types: v.optional(v.any()), // Specific notification type preferences
    digestFrequency: v.optional(
      v.union(v.literal("daily"), v.literal("weekly"), v.literal("never"))
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ==================== DESIGN PRESETS ====================

  presets: defineTable({
    // Identity
    slug: v.string(), // kebab-case identifier (e.g., "sacred", "kumori")
    name: v.string(),
    description: v.string(),
    author: v.string(),
    version: v.string(),
    tags: v.array(v.string()),

    // Composable design layers (stored as JSON)
    layers: v.any(), // PresetLayers from design/presets/schema.ts

    // Metadata
    metadata: v.optional(v.any()), // PresetMetadata
    preview: v.optional(v.any()), // PresetPreview

    // Visibility & Status
    isPublic: v.boolean(),
    isActive: v.boolean(), // Currently active preset for the user/system

    // Ownership
    createdBy: v.optional(v.id("users")), // null for system presets

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_public", ["isPublic"])
    .index("by_active", ["isActive"])
    .index("by_created_by", ["createdBy"])
    .index("by_public_created", ["isPublic", "createdAt"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["isPublic"],
    }),

  // User-specific preset preferences
  userPresetSettings: defineTable({
    userId: v.id("users"),
    activePresetId: v.optional(v.id("presets")),
    overrides: v.optional(v.any()), // Layer overrides
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
