import { workflow } from "./manager";
import { v } from "convex/values";
import { internal } from "../_generated/api";

export const userOnboarding = workflow.define({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
  },
  handler: async (step, { userId, email, name }): Promise<void> => {
    // Step 1: Send welcome email
    await step.runAction(
      internal.app.emails.internal.sendWelcomeEmail,
      { userId, email, name },
      {
        retry: { maxAttempts: 3, initialBackoffMs: 1000, base: 2 },
      }
    );
    
    // Step 2: Create initial project for the user
    const projectId = await step.runMutation(
      internal.app.projects.internal.createInitialProject,
      { userId, name: `${name}'s First Project` }
    );
    
    // Step 3: Set up default preferences
    await step.runMutation(
      internal.app.projects.internal.setupDefaultPreferences,
      { userId }
    );
    
    // Step 4: (Optional) schedule follow-up via a separate cron or enqueue; omit sleep in step API
    
    // Step 5: Send follow-up email
    await step.runAction(
      internal.app.emails.internal.sendNotificationEmail,
      {
        userId,
        email,
        subject: "How's it going?",
        body: `Hi ${name}, just checking in to see how you're finding TurboKit!`,
      },
      { retry: { maxAttempts: 2, initialBackoffMs: 500, base: 2 } }
    );
    
    // Step 6: Log onboarding completion
    await step.runMutation(
      internal.app.users.internal.logActivity,
      {
        userId,
        action: "user.onboarding.completed",
        resourceType: "user",
        resourceId: userId,
        metadata: { projectId },
      }
    );
  },
});

// Start function can be exposed via workflow manager or a domain action as needed.
