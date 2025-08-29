import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { vEmailId, vEmailEvent } from "@convex-dev/resend";

export const handleEvent = internalMutation({
  args: {
    id: vEmailId,
    event: vEmailEvent,
  },
  handler: async (ctx, { id, event }) => {
    console.log(`Email ${id} event: ${event.type}`);
    
    // Store activity in our activities table
    const timestamp = Date.now();
    
    // Handle different event types
    switch(event.type) {
      case "email.sent":
        await ctx.db.insert("activities", {
          userId: ctx.db.system() as any, // System action
          action: "email.sent",
          resourceType: "email",
          resourceId: id,
          metadata: { type: event.type },
          timestamp,
        });
        break;
        
      case "email.delivered":
        await ctx.db.insert("activities", {
          userId: ctx.db.system() as any,
          action: "email.delivered",
          resourceType: "email",
          resourceId: id,
          metadata: { type: event.type },
          timestamp,
        });
        break;
        
      case "email.bounced":
        // Handle bounce - maybe update user record
        await ctx.db.insert("activities", {
          userId: ctx.db.system() as any,
          action: "email.bounced",
          resourceType: "email",
          resourceId: id,
          metadata: { 
            type: event.type,
            bounceType: (event as any).bounce_type,
          },
          timestamp,
        });
        console.error(`Email bounced: ${id}`);
        break;
        
      case "email.complained":
        // Handle spam complaint - important for reputation
        await ctx.db.insert("activities", {
          userId: ctx.db.system() as any,
          action: "email.complained",
          resourceType: "email",
          resourceId: id,
          metadata: { type: event.type },
          timestamp,
        });
        console.error(`Spam complaint for email: ${id}`);
        break;
        
      case "email.opened":
        await ctx.db.insert("activities", {
          userId: ctx.db.system() as any,
          action: "email.opened",
          resourceType: "email",
          resourceId: id,
          metadata: { type: event.type },
          timestamp,
        });
        break;
        
      case "email.clicked":
        await ctx.db.insert("activities", {
          userId: ctx.db.system() as any,
          action: "email.clicked",
          resourceType: "email",
          resourceId: id,
          metadata: { 
            type: event.type,
            link: (event as any).link,
          },
          timestamp,
        });
        break;
    }
  },
});