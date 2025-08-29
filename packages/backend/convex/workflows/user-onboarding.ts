import { workflow } from "./manager";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";

export const userOnboarding = workflow.define({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
  },
  handler: async (step, { userId, email, name }): Promise<void> => {
    // Step 1: Send welcome email
    await step.runAction(
      api.functions.actions.emails.sendWelcomeEmail,
      { userId, email, name },
      { 
        retry: { 
          maxAttempts: 3,
          backoffMs: [1000, 2000, 4000], // Exponential backoff
        },
      }
    );
    
    // Step 2: Create initial project for the user
    const projectId = await step.runMutation(
      internal.functions.internal.projects.createInitialProject,
      { userId, name: `${name}'s First Project` }
    );
    
    // Step 3: Set up default preferences
    await step.runMutation(
      internal.functions.internal.users.setupDefaultPreferences,
      { userId }
    );
    
    // Step 4: Schedule follow-up email (24 hours later)
    await step.sleep(24 * 60 * 60 * 1000); // 24 hours in milliseconds
    
    // Step 5: Send follow-up email
    await step.runAction(
      api.functions.actions.emails.sendNotificationEmail,
      {
        userId,
        email,
        subject: "How's it going?",
        body: `Hi ${name}, just checking in to see how you're finding TurboKit!`,
      },
      { 
        retry: { 
          maxAttempts: 2,
        },
      }
    );
    
    // Step 6: Log onboarding completion
    await step.runMutation(
      internal.functions.internal.users.logActivity,
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

// Function to start the onboarding workflow
export const startOnboarding = workflow.trigger(
  api.workflows.userOnboarding.userOnboarding
);