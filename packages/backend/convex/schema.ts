import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	// Core tables
	users: defineTable({
		clerkId: v.string(),
		email: v.string(),
		name: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
		role: v.union(v.literal("user"), v.literal("admin")),
		metadata: v.optional(v.any()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_clerk_id", ["clerkId"])
		.index("by_email", ["email"]),

	// Example business entity - customize for your project
	projects: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		ownerId: v.id("users"),
		status: v.union(
			v.literal("active"),
			v.literal("archived"),
			v.literal("draft"),
		),
		settings: v.optional(v.any()),
		metadata: v.optional(v.any()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_owner", ["ownerId"])
		.index("by_status", ["status"])
		.index("by_owner_status", ["ownerId", "status"]),

	// Team/collaboration support
	teamMembers: defineTable({
		projectId: v.id("projects"),
		userId: v.id("users"),
		role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
		joinedAt: v.number(),
	})
		.index("by_project", ["projectId"])
		.index("by_user", ["userId"])
		.index("by_project_user", ["projectId", "userId"]),

	// Vector embeddings for AI features
	embeddings: defineTable({
		embedding: v.array(v.float64()),
		text: v.string(),
		source: v.string(), // "user_message", "document", etc.
		sourceId: v.optional(v.string()), // Reference to source document/message
		metadata: v.any(),
		createdAt: v.number(),
	}).vectorIndex("by_embedding", {
		vectorField: "embedding",
		dimensions: 1536, // OpenAI text-embedding-3-small
		filterFields: ["source"],
	}),

	// Activity log for audit trail
	activities: defineTable({
		userId: v.id("users"),
		action: v.string(),
		resourceType: v.optional(v.string()),
		resourceId: v.optional(v.string()),
		metadata: v.optional(v.any()),
		timestamp: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_timestamp", ["timestamp"])
		.index("by_resource", ["resourceType", "resourceId"]),

	// Notifications: Convex-native in-app notifications
	notifications: defineTable({
		userId: v.id("users"),
		type: v.string(),
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

	// Device tokens for push notifications
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

	// Notification preferences
	notificationPreferences: defineTable({
		userId: v.id("users"),
		email: v.boolean(),
		push: v.boolean(),
		inApp: v.boolean(),
		types: v.optional(v.any()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_user", ["userId"]),

	// Media generation jobs (images, video, audio, 3D)
	imageGenerationJobs: defineTable({
		userId: v.id("users"),
		provider: v.union(
			v.literal("openai"),
			v.literal("fal"),
			v.literal("openrouter"),
		),
		mediaType: v.optional(
			v.union(
				v.literal("image"),
				v.literal("video"),
				v.literal("audio"),
				v.literal("3d"),
			),
		),
		prompt: v.optional(v.string()), // Optional for Fal generic input
		input: v.optional(v.any()), // Generic input for Fal models
		inputImage: v.optional(v.string()),
		quality: v.optional(v.string()),
		size: v.optional(v.string()),
		outputFormat: v.optional(v.string()),
		numImages: v.optional(v.number()),
		model: v.optional(v.string()),
		aspectRatio: v.optional(v.string()),
		status: v.union(
			v.literal("queued"),
			v.literal("processing"),
			v.literal("completed"),
			v.literal("failed"),
		),
		attempts: v.number(),
		resultB64: v.optional(v.string()), // For images only
		resultUrl: v.optional(v.string()), // For all media types
		duration: v.optional(v.number()), // For video/audio
		error: v.optional(v.string()),
		correlationId: v.optional(v.string()),
		metadata: v.optional(v.any()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_status", ["status"])
		.index("by_user_status", ["userId", "status"])
		.index("by_correlation", ["correlationId"]),

	// Model cache - stores available models from providers
	modelCache: defineTable({
		provider: v.union(v.literal("openai"), v.literal("openrouter")),
		filterKey: v.string(), // Hash of filters for OpenRouter
		models: v.array(
			v.object({
				id: v.string(),
				name: v.optional(v.string()),
				description: v.optional(v.string()),
				capabilities: v.optional(v.array(v.string())),
				pricing: v.optional(
					v.object({
						input: v.optional(v.number()),
						output: v.optional(v.number()),
					}),
				),
				meta: v.optional(v.any()),
			}),
		),
		fetchedAt: v.number(),
		expiresAt: v.number(),
	}).index("by_provider_filter", ["provider", "filterKey"]),
});
