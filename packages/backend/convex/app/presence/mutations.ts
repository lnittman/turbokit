import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { presence } from "./presence";

export const heartbeat = mutation({
  args: { roomId: v.string(), userId: v.string(), sessionId: v.string(), interval: v.number() },
  handler: async (ctx, args) => presence.heartbeat(ctx, args.roomId, args.userId, args.sessionId, args.interval),
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => presence.disconnect(ctx, sessionToken),
});
