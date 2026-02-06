import { faker } from "@faker-js/faker";
import type { Id } from "convex/values";

/**
 * Mock data generators for testing
 */

// Set seed for consistent test data
faker.seed(123);

/**
 * Generate a mock user
 */
export function createMockUser(overrides?: Partial<any>) {
	const firstName = faker.person.firstName();
	const lastName = faker.person.lastName();
	const email = faker.internet.email({ firstName, lastName });

	return {
		_id: `users_${faker.string.alphanumeric(16)}` as Id<"users">,
		_creationTime: Date.now(),
		clerkId: `clerk_${faker.string.alphanumeric(32)}`,
		email,
		name: `${firstName} ${lastName}`,
		imageUrl: faker.image.avatar(),
		role: "user" as const,
		metadata: {
			bio: faker.person.bio(),
			location: faker.location.city(),
		},
		createdAt: Date.now(),
		updatedAt: Date.now(),
		...overrides,
	};
}

/**
 * Generate a mock project
 */
export function createMockProject(
	ownerId: Id<"users">,
	overrides?: Partial<any>,
) {
	return {
		_id: `projects_${faker.string.alphanumeric(16)}` as Id<"projects">,
		_creationTime: Date.now(),
		name: `${faker.company.name()} Project`,
		description: faker.lorem.paragraph(),
		ownerId,
		status: faker.helpers.arrayElement(["active", "archived", "draft"]) as any,
		settings: {
			isPublic: faker.datatype.boolean(),
			allowComments: faker.datatype.boolean(),
		},
		tags: faker.helpers.arrayElements(
			["development", "design", "marketing", "sales", "hr"],
			3,
		),
		createdAt: Date.now(),
		updatedAt: Date.now(),
		...overrides,
	};
}

/**
 * Generate mock AI thread
 */
export function createMockThread(
	userId: Id<"users">,
	overrides?: Partial<any>,
) {
	return {
		_id: `threads_${faker.string.alphanumeric(16)}` as Id<"threads">,
		_creationTime: Date.now(),
		userId,
		title: faker.lorem.sentence(),
		model: faker.helpers.arrayElement(["gpt-4", "gpt-3.5-turbo", "claude-3"]),
		temperature: faker.number.float({ min: 0, max: 1, precision: 0.1 }),
		maxTokens: faker.helpers.arrayElement([1000, 2000, 4000]),
		systemPrompt: faker.lorem.paragraph(),
		createdAt: Date.now(),
		updatedAt: Date.now(),
		...overrides,
	};
}

/**
 * Generate mock AI message
 */
export function createMockMessage(
	threadId: Id<"threads">,
	overrides?: Partial<any>,
) {
	const role = faker.helpers.arrayElement(["user", "assistant", "system"]);

	return {
		_id: `messages_${faker.string.alphanumeric(16)}` as Id<"messages">,
		_creationTime: Date.now(),
		threadId,
		role,
		content:
			role === "user" ? `${faker.lorem.sentence()}?` : faker.lorem.paragraph(),
		metadata: {
			model: "gpt-4",
			tokens: faker.number.int({ min: 10, max: 500 }),
			finishReason: "stop",
		},
		createdAt: Date.now(),
		...overrides,
	};
}

/**
 * Generate mock activity log
 */
export function createMockActivity(
	userId: Id<"users">,
	overrides?: Partial<any>,
) {
	const actions = [
		"user.created",
		"user.updated",
		"project.created",
		"project.updated",
		"project.deleted",
		"thread.created",
		"message.sent",
		"subscription.created",
		"subscription.cancelled",
	];

	return {
		_id: `activities_${faker.string.alphanumeric(16)}` as Id<"activities">,
		_creationTime: Date.now(),
		userId,
		action: faker.helpers.arrayElement(actions),
		resourceType: faker.helpers.arrayElement([
			"user",
			"project",
			"thread",
			"message",
			"subscription",
		]),
		resourceId: faker.string.alphanumeric(16),
		metadata: {
			ip: faker.internet.ip(),
			userAgent: faker.internet.userAgent(),
			changes: faker.datatype.boolean()
				? { before: "old", after: "new" }
				: undefined,
		},
		timestamp: Date.now(),
		...overrides,
	};
}

/**
 * Generate mock subscription (Autumn)
 */
export function createMockSubscription(
	userId: Id<"users">,
	overrides?: Partial<any>,
) {
	const products = ["starter", "pro", "enterprise"];
	const productKey = faker.helpers.arrayElement(products);

	return {
		id: `sub_${faker.string.alphanumeric(24)}`,
		customerId: userId,
		productId: `prod_${faker.string.alphanumeric(24)}`,
		productKey,
		status: faker.helpers.arrayElement([
			"active",
			"trialing",
			"past_due",
			"cancelled",
		]),
		currentPeriodStart: Date.now(),
		currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
		cancelAtPeriodEnd: faker.datatype.boolean(),
		trialEnd: faker.datatype.boolean()
			? Date.now() + 7 * 24 * 60 * 60 * 1000
			: null,
		metadata: {
			referral: faker.helpers.arrayElement([
				null,
				"google",
				"facebook",
				"friend",
			]),
		},
		...overrides,
	};
}

/**
 * Generate batch mock data
 */
export function generateMockData(
	counts: {
		users?: number;
		projectsPerUser?: number;
		threadsPerUser?: number;
		messagesPerThread?: number;
		activitiesPerUser?: number;
	} = {},
) {
	const {
		users = 5,
		projectsPerUser = 3,
		threadsPerUser = 2,
		messagesPerThread = 5,
		activitiesPerUser = 10,
	} = counts;

	const mockUsers = Array.from({ length: users }, () => createMockUser());

	const mockProjects = mockUsers.flatMap((user) =>
		Array.from({ length: projectsPerUser }, () => createMockProject(user._id)),
	);

	const mockThreads = mockUsers.flatMap((user) =>
		Array.from({ length: threadsPerUser }, () => createMockThread(user._id)),
	);

	const mockMessages = mockThreads.flatMap((thread) =>
		Array.from({ length: messagesPerThread }, (_, i) =>
			createMockMessage(thread._id, {
				role: i % 2 === 0 ? "user" : "assistant",
			}),
		),
	);

	const mockActivities = mockUsers.flatMap((user) =>
		Array.from({ length: activitiesPerUser }, () =>
			createMockActivity(user._id),
		),
	);

	return {
		users: mockUsers,
		projects: mockProjects,
		threads: mockThreads,
		messages: mockMessages,
		activities: mockActivities,
	};
}

/**
 * Create a mock file upload
 */
export function createMockFile(overrides?: Partial<any>) {
	const fileTypes = [
		"image/png",
		"image/jpeg",
		"application/pdf",
		"text/plain",
	];
	const extensions = [".png", ".jpg", ".pdf", ".txt"];
	const typeIndex = faker.number.int({ min: 0, max: fileTypes.length - 1 });

	return {
		_id: `_storage/${faker.string.alphanumeric(32)}` as Id<"_storage">,
		_creationTime: Date.now(),
		name: faker.system.fileName({ extensionCount: 0 }) + extensions[typeIndex],
		size: faker.number.int({ min: 1000, max: 10000000 }),
		type: fileTypes[typeIndex],
		url: faker.internet.url(),
		...overrides,
	};
}

/**
 * Create mock email data
 */
export function createMockEmail(overrides?: Partial<any>) {
	return {
		to: faker.internet.email(),
		from: "noreply@turbokit.dev",
		subject: faker.lorem.sentence(),
		html: `<p>${faker.lorem.paragraph()}</p>`,
		text: faker.lorem.paragraph(),
		...overrides,
	};
}
