import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { vEmailId, vEmailEvent } from "@convex-dev/resend";

export const handleEvent = internalMutation({
  args: { id: vEmailId, event: vEmailEvent },
  handler: async (ctx, { id, event }) => {
    console.log(`Email ${id} event: ${event.type}`);
    const timestamp = Date.now();
    const log = async (action: string, metadata?: any) => ctx.db.insert("activities", { userId: ctx.db.system() as any, action, resourceType: "email", resourceId: id, metadata, timestamp });
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

