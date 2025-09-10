import { action } from "../_generated/server";
import { v } from "convex/values";
import { resend, EMAIL_CONFIG } from "./resend";
import { checkRateLimit } from "../lib/rateLimiter";

export const sendWelcomeEmail = action({
  args: { userId: v.id("users"), email: v.string(), name: v.string() },
  handler: async (ctx, { userId, email, name }) => {
    await checkRateLimit(ctx, "emailSend", userId);
    const html = `<h1>Welcome to TurboKit!</h1><p>Hi ${name}, we're excited to have you on board.</p>`;
    const text = `Welcome to TurboKit, ${name}! We're excited to have you on board.`;
    const emailId = await resend.sendEmail(ctx, { from: EMAIL_CONFIG.from.default, to: email, subject: "Welcome to TurboKit!", html, text, replyTo: [EMAIL_CONFIG.replyTo] });
    return { emailId };
  },
});

export const sendPasswordResetEmail = action({
  args: { userId: v.id("users"), email: v.string(), name: v.string(), resetToken: v.string() },
  handler: async (ctx, { userId, email, name, resetToken }) => {
    await checkRateLimit(ctx, "emailSend", userId);
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/auth/reset-password?token=${resetToken}`;
    const html = `<h1>Reset Your Password</h1><p>Hi ${name},</p><p><a href="${resetLink}">Click here to reset your password</a></p>`;
    const text = `Hi ${name}, Click here to reset your password: ${resetLink}`;
    const emailId = await resend.sendEmail(ctx, { from: EMAIL_CONFIG.from.default, to: email, subject: "Reset your password", html, text, replyTo: [EMAIL_CONFIG.replyTo] });
    return { emailId };
  },
});

export const sendNotificationEmail = action({
  args: { userId: v.id("users"), email: v.string(), subject: v.string(), body: v.string(), html: v.optional(v.string()) },
  handler: async (ctx, { userId, email, subject, body, html }) => {
    await checkRateLimit(ctx, "emailSend", userId);
    const emailId = await resend.sendEmail(ctx, { from: EMAIL_CONFIG.from.notifications, to: email, subject, text: body, html: html || body, replyTo: [EMAIL_CONFIG.replyTo] });
    return { emailId };
  },
});
