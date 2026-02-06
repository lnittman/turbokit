import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

export const createInitialProject = internalMutation({
	args: { userId: v.id("users"), name: v.string() },
	handler: async (ctx, { userId, name }) => {
		const projectId = await ctx.db.insert("projects", {
			name,
			description: "Your first project on TurboKit",
			ownerId: userId,
			status: "active",
			settings: { isDefault: true },
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});
		await ctx.db.insert("teamMembers", {
			projectId,
			userId,
			role: "owner",
			joinedAt: Date.now(),
		});
		return projectId;
	},
});

export const setupDefaultPreferences = internalMutation({
	args: { userId: v.id("users") },
	handler: async (ctx, { userId }) => {
		await ctx.db.patch(userId, {
			metadata: {
				preferences: {
					theme: "light",
					notifications: { email: true, inApp: true },
					language: "en",
					timezone: "UTC",
				},
				onboardingCompleted: true,
			},
			updatedAt: Date.now(),
		});
	},
});
