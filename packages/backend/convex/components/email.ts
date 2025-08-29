import { Resend } from "@convex-dev/resend";
import { components, internal } from "../_generated/api";

export const resend = new Resend(components.resend, {
  onEmailEvent: internal.functions.internal.emailEvents.handleEvent,
  testMode: process.env.NODE_ENV !== "production",
});

// Common email configuration
export const EMAIL_CONFIG = {
  from: {
    default: "TurboKit <noreply@turbokit.dev>",
    support: "TurboKit Support <support@turbokit.dev>",
    notifications: "TurboKit <notifications@turbokit.dev>",
  },
  replyTo: "support@turbokit.dev",
} as const;