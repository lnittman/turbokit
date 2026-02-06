import { internalMutation, internalAction } from "../../_generated/server";
import { v } from "convex/values";
import { vEmailId, vEmailEvent } from "@convex-dev/resend";
import { resend, EMAIL_CONFIG } from "./resend";

// Internal action: Send welcome email (for use in workflows)
export const sendWelcomeEmail = internalAction({
  args: { userId: v.id("users"), email: v.string(), name: v.string() },
  handler: async (ctx, { email, name }): Promise<{ emailId: string | null }> => {
    const html = `<h1>Welcome to TurboKit!</h1><p>Hi ${name}, we're excited to have you on board.</p>`;
    const text = `Welcome to TurboKit, ${name}! We're excited to have you on board.`;
    const emailId = await resend.sendEmail(ctx, {
      from: EMAIL_CONFIG.from.default,
      to: email,
      subject: "Welcome to TurboKit!",
      html,
      text,
      replyTo: [EMAIL_CONFIG.replyTo],
    });
    return { emailId };
  },
});

// Internal action: Send notification email (for use in workflows)
export const sendNotificationEmail = internalAction({
  args: {
    userId: v.id("users"),
    email: v.string(),
    subject: v.string(),
    body: v.string(),
    html: v.optional(v.string()),
  },
  handler: async (ctx, { email, subject, body, html }): Promise<{ emailId: string | null }> => {
    const emailId = await resend.sendEmail(ctx, {
      from: EMAIL_CONFIG.from.notifications,
      to: email,
      subject,
      text: body,
      html: html || body,
      replyTo: [EMAIL_CONFIG.replyTo],
    });
    return { emailId };
  },
});

export const handleEvent = internalMutation({
  args: { id: vEmailId, event: vEmailEvent },
  handler: async (ctx, { id, event }) => {
    console.log(`Email ${id} event: ${event.type}`);
    const timestamp = Date.now();
    const log = async (action: string, metadata?: any) => ctx.db.insert("activities", { userId: "system" as any, action, resourceType: "email", resourceId: id, metadata, timestamp });
    switch (event.type) {
      case "email.sent": await log("email.sent"); break;
      case "email.delivered": await log("email.delivered"); break;
      case "email.bounced": await log("email.bounced", { bounceType: (event as any).bounce_type }); break;
      case "email.complained": await log("email.complained"); break;
      case "email.opened": await log("email.opened"); break;
      case "email.clicked": await log("email.clicked", { link: (event as any).link }); break;
    }
  },
});
