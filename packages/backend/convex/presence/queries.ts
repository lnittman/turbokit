import { query } from "../_generated/server";
import { v } from "convex/values";
import { presence } from "./presence";

export const list = query({
  args: { roomToken: v.string() },
  handler: async (ctx, { roomToken }) => presence.list(ctx, roomToken),
});
