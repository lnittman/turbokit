/**
 * Type exports for the backend package
 *
 * This file re-exports generated Convex types and provides convenience aliases
 * to avoid brittle imports from _generated paths in consuming applications.
 */

// Re-export API for clean imports
export type { api } from "./convex/_generated/api";
// Core Convex types
export type {
	DataModel,
	Doc,
	Id,
} from "./convex/_generated/dataModel";

// Re-export function types
export type {
	ActionCtx,
	MutationCtx,
	QueryCtx,
} from "./convex/_generated/server";

/**
 * Convenience type aliases for common document types
 * These provide cleaner imports and better intellisense
 */

// User and authentication
export type User = Doc<"users">;
export type UserId = Id<"users">;

// Projects and organization
export type Project = Doc<"projects">;
export type ProjectId = Id<"projects">;

// AI/Agent types
export type Thread = Doc<"threads">;
export type ThreadId = Id<"threads">;
export type Message = Doc<"messages">;
export type MessageId = Id<"messages">;

// Activity logging
export type Activity = Doc<"activities">;
export type ActivityId = Id<"activities">;

// File storage (if using Convex storage)
export type StorageId = Id<"_storage">;

/**
 * Subscription/billing types (from Autumn integration)
 * These are not Convex documents but useful to export
 */
export type SubscriptionStatus =
	| "active"
	| "trialing"
	| "past_due"
	| "cancelled"
	| "incomplete";
export type SubscriptionTier = "free" | "starter" | "pro" | "enterprise";

/**
 * Common query/mutation argument types
 */
export type PaginationArgs = {
	cursor?: string;
	limit?: number;
};

export type DateRange = {
	startDate: number;
	endDate: number;
};

/**
 * Utility types for working with Convex documents
 */

// Extract document type without system fields
export type WithoutSystemFields<T> = Omit<T, "_id" | "_creationTime">;

// Make certain fields optional (useful for updates)
export type PartialFields<T, K extends keyof T> = Omit<T, K> &
	Partial<Pick<T, K>>;

// Add timestamps to a type
export type WithTimestamps<T> = T & {
	createdAt: number;
	updatedAt: number;
};

/**
 * Role and permission types
 */
export type UserRole = "user" | "admin";

export type Permission =
	| "projects.create"
	| "projects.read"
	| "projects.update"
	| "projects.delete"
	| "users.read"
	| "users.update"
	| "users.delete"
	| "admin.all";

/**
 * Status enums used across the app
 */
export type ProjectStatus = "active" | "archived" | "draft";
export type MessageRole = "user" | "assistant" | "system";

/**
 * Metadata types for flexible data storage
 */
export type UserMetadata = {
	bio?: string;
	location?: string;
	website?: string;
	company?: string;
	subscriptionTier?: SubscriptionTier;
	customerId?: string;
	[key: string]: any;
};

export type ProjectSettings = {
	isPublic?: boolean;
	maxMembers?: number;
	allowComments?: boolean;
	features?: string[];
	[key: string]: any;
};

/**
 * Helper type for Convex function results
 */
export type ConvexResult<T> = Promise<T | null>;
export type ConvexPaginatedResult<T> = Promise<{
	data: T[];
	cursor?: string;
	isDone: boolean;
}>;

/**
 * Error types
 */
export type ConvexErrorData = {
	code: string;
	message: string;
	statusCode?: number;
	details?: any;
};

/**
 * Re-export component types if needed
 */
// Autumn types are intentionally not re-exported here to avoid leaking SDK internals.
