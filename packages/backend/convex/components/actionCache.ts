import { ActionCache } from "@convex-dev/action-cache";
import { components } from "../_generated/api";

export const createActionCache = (config: any) => new ActionCache(components.actionCache as any, config as any);
