import { Presence as PresenceComponent } from "@convex-dev/presence";
import { components } from "../_generated/api";

// Singleton Presence component instance
export const presence = new PresenceComponent(components.presence);

