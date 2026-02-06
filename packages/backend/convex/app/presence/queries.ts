import { v } from "convex/values";
import { query } from "../../_generated/server";
import { presence } from "./presence";

export const list = query({
	args: { roomToken: v.string() },
	handler: async (ctx, { roomToken }) => presence.list(ctx, roomToken),
});
