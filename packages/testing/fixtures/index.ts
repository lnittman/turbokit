/**
 * Test fixtures for consistent test data
 */

import type { Id } from "convex/values";

// User fixtures
export const testUsers = {
	basic: {
		_id: "users_test1" as Id<"users">,
		clerkId: "clerk_test1",
		email: "user@example.com",
		name: "Test User",
		role: "user" as const,
		createdAt: 1704067200000, // 2024-01-01
		updatedAt: 1704067200000,
	},
	admin: {
		_id: "users_admin1" as Id<"users">,
		clerkId: "clerk_admin1",
		email: "admin@example.com",
		name: "Admin User",
		role: "admin" as const,
		createdAt: 1704067200000,
		updatedAt: 1704067200000,
	},
	premium: {
		_id: "users_premium1" as Id<"users">,
		clerkId: "clerk_premium1",
		email: "premium@example.com",
		name: "Premium User",
		role: "user" as const,
		metadata: {
			subscriptionTier: "pro",
			customerId: "cus_premium1",
		},
		createdAt: 1704067200000,
		updatedAt: 1704067200000,
	},
};

// Project fixtures
export const testProjects = {
	active: {
		_id: "projects_active1" as Id<"projects">,
		name: "Active Project",
		description: "An active test project",
		ownerId: testUsers.basic._id,
		status: "active" as const,
		settings: {
			isPublic: false,
			maxMembers: 10,
		},
		createdAt: 1704153600000,
		updatedAt: 1704153600000,
	},
	archived: {
		_id: "projects_archived1" as Id<"projects">,
		name: "Archived Project",
		description: "An archived test project",
		ownerId: testUsers.basic._id,
		status: "archived" as const,
		settings: {},
		createdAt: 1704067200000,
		updatedAt: 1704240000000,
	},
	draft: {
		_id: "projects_draft1" as Id<"projects">,
		name: "Draft Project",
		description: "A draft test project",
		ownerId: testUsers.basic._id,
		status: "draft" as const,
		settings: {},
		createdAt: 1704240000000,
		updatedAt: 1704240000000,
	},
};

// AI Thread fixtures
export const testThreads = {
	basic: {
		_id: "threads_basic1" as Id<"threads">,
		userId: testUsers.basic._id,
		title: "Basic Chat Thread",
		model: "gpt-4",
		temperature: 0.7,
		maxTokens: 2000,
		systemPrompt: "You are a helpful assistant.",
		createdAt: 1704153600000,
		updatedAt: 1704153600000,
	},
	code: {
		_id: "threads_code1" as Id<"threads">,
		userId: testUsers.basic._id,
		title: "Code Generation Thread",
		model: "gpt-4",
		temperature: 0.3,
		maxTokens: 4000,
		systemPrompt:
			"You are an expert programmer. Write clean, well-documented code.",
		createdAt: 1704240000000,
		updatedAt: 1704240000000,
	},
};

// Message fixtures
export const testMessages = {
	userMessage: {
		_id: "messages_user1" as Id<"messages">,
		threadId: testThreads.basic._id,
		role: "user" as const,
		content: "What is TypeScript?",
		createdAt: 1704153700000,
	},
	assistantMessage: {
		_id: "messages_assistant1" as Id<"messages">,
		threadId: testThreads.basic._id,
		role: "assistant" as const,
		content: "TypeScript is a statically typed superset of JavaScript...",
		metadata: {
			model: "gpt-4",
			tokens: 150,
			finishReason: "stop",
		},
		createdAt: 1704153710000,
	},
	systemMessage: {
		_id: "messages_system1" as Id<"messages">,
		threadId: testThreads.basic._id,
		role: "system" as const,
		content: "You are a helpful assistant.",
		createdAt: 1704153600000,
	},
};

// Subscription fixtures (Autumn)
export const testSubscriptions = {
	starter: {
		id: "sub_starter1",
		customerId: testUsers.basic._id,
		productId: "prod_starter",
		productKey: "starter",
		status: "active" as const,
		currentPeriodStart: 1704067200000,
		currentPeriodEnd: 1706745600000, // +30 days
		cancelAtPeriodEnd: false,
		metadata: {},
	},
	pro: {
		id: "sub_pro1",
		customerId: testUsers.premium._id,
		productId: "prod_pro",
		productKey: "pro",
		status: "active" as const,
		currentPeriodStart: 1704067200000,
		currentPeriodEnd: 1706745600000,
		cancelAtPeriodEnd: false,
		trialEnd: null,
		metadata: {
			referral: "product_hunt",
		},
	},
	trial: {
		id: "sub_trial1",
		customerId: testUsers.basic._id,
		productId: "prod_pro",
		productKey: "pro",
		status: "trialing" as const,
		currentPeriodStart: 1704067200000,
		currentPeriodEnd: 1704672000000, // +7 days trial
		cancelAtPeriodEnd: false,
		trialEnd: 1704672000000,
		metadata: {},
	},
	cancelled: {
		id: "sub_cancelled1",
		customerId: testUsers.basic._id,
		productId: "prod_starter",
		productKey: "starter",
		status: "cancelled" as const,
		currentPeriodStart: 1701475200000,
		currentPeriodEnd: 1704067200000,
		cancelAtPeriodEnd: true,
		cancelledAt: 1703462400000,
		metadata: {
			cancellationReason: "Too expensive",
		},
	},
};

// Activity log fixtures
export const testActivities = {
	userCreated: {
		_id: "activities_created1" as Id<"activities">,
		userId: testUsers.basic._id,
		action: "user.created",
		resourceType: "user",
		resourceId: testUsers.basic._id,
		metadata: {
			ip: "192.168.1.1",
			userAgent: "Mozilla/5.0...",
		},
		timestamp: 1704067200000,
	},
	projectCreated: {
		_id: "activities_project1" as Id<"activities">,
		userId: testUsers.basic._id,
		action: "project.created",
		resourceType: "project",
		resourceId: testProjects.active._id,
		metadata: {
			projectName: "Active Project",
		},
		timestamp: 1704153600000,
	},
	subscriptionCreated: {
		_id: "activities_sub1" as Id<"activities">,
		userId: testUsers.basic._id,
		action: "subscription.created",
		resourceType: "subscription",
		resourceId: "sub_starter1",
		metadata: {
			plan: "starter",
			amount: 900,
			currency: "usd",
		},
		timestamp: 1704067200000,
	},
};

// File/Storage fixtures
export const testFiles = {
	image: {
		_id: "_storage/image1" as Id<"_storage">,
		name: "test-image.png",
		size: 1024000,
		type: "image/png",
		url: "https://storage.example.com/image1.png",
	},
	document: {
		_id: "_storage/doc1" as Id<"_storage">,
		name: "test-document.pdf",
		size: 2048000,
		type: "application/pdf",
		url: "https://storage.example.com/doc1.pdf",
	},
	csv: {
		_id: "_storage/csv1" as Id<"_storage">,
		name: "test-data.csv",
		size: 512000,
		type: "text/csv",
		url: "https://storage.example.com/csv1.csv",
	},
};

// Email templates
export const testEmails = {
	welcome: {
		to: "user@example.com",
		from: "noreply@turbokit.dev",
		subject: "Welcome to TurboKit!",
		html: "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
		text: "Welcome! Thanks for signing up.",
	},
	passwordReset: {
		to: "user@example.com",
		from: "noreply@turbokit.dev",
		subject: "Reset Your Password",
		html: "<p>Click <a href='#'>here</a> to reset your password.</p>",
		text: "Click here to reset your password: https://example.com/reset",
	},
	subscriptionConfirmation: {
		to: "premium@example.com",
		from: "billing@turbokit.dev",
		subject: "Subscription Confirmed",
		html: "<p>Your Pro subscription is now active!</p>",
		text: "Your Pro subscription is now active!",
	},
};

// API Response fixtures
export const testAPIResponses = {
	success: {
		status: 200,
		data: { success: true, message: "Operation completed" },
	},
	error: {
		status: 400,
		error: { code: "BAD_REQUEST", message: "Invalid input" },
	},
	unauthorized: {
		status: 401,
		error: { code: "UNAUTHORIZED", message: "Authentication required" },
	},
	notFound: {
		status: 404,
		error: { code: "NOT_FOUND", message: "Resource not found" },
	},
	serverError: {
		status: 500,
		error: { code: "INTERNAL_ERROR", message: "Internal server error" },
	},
};

// Webhook payloads
export const testWebhooks = {
	clerkUserCreated: {
		type: "user.created",
		data: {
			id: "clerk_new_user",
			email_addresses: [{ email_address: "newuser@example.com" }],
			first_name: "New",
			last_name: "User",
			image_url: "https://example.com/avatar.jpg",
		},
	},
	autumnSubscriptionCreated: {
		type: "subscription.created",
		data: {
			id: "sub_new",
			customerId: "cus_123",
			productId: "prod_pro",
			status: "active",
		},
	},
	resendEmailDelivered: {
		type: "email.delivered",
		data: {
			email_id: "email_123",
			to: ["user@example.com"],
			subject: "Test Email",
			delivered_at: "2024-01-01T00:00:00Z",
		},
	},
};
