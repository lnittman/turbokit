import type React from "react";

import type { StarterLayout } from "@/layouts/types";

import { CanvasLayout } from "./canvas-layout";
import { ChatLayout } from "./chat-layout";
import { DashboardLayout } from "./dashboard-layout";
import { FeedLayout } from "./feed-layout";
import { KanbanLayout } from "./kanban-layout";

const LAYOUT_COMPONENTS: Record<StarterLayout, () => React.ReactElement> = {
	dashboard: DashboardLayout,
	feed: FeedLayout,
	chat: ChatLayout,
	kanban: KanbanLayout,
	canvas: CanvasLayout,
};

export function StarterLayoutSurface({
	layout,
}: {
	layout: StarterLayout;
}): React.ReactElement {
	const LayoutComponent = LAYOUT_COMPONENTS[layout];
	return <LayoutComponent />;
}

export { LayoutSwitcher } from "./layout-switcher";
export {
	type CanvasNode,
	type CanvasStarterData,
	type ChatMessage,
	type ChatStarterData,
	type DashboardStarterData,
	type FeedEvent,
	type FeedStarterData,
	type FeedType,
	type KanbanColumn,
	type KanbanStarterData,
	StarterLayoutSeamProvider,
	type StarterLayoutSeams,
	type StarterSeamState,
	type StarterSeamStatus,
} from "./seams";
export {
	STARTER_LAYOUT_LABELS,
	STARTER_LAYOUTS,
	type StarterLayout,
} from "./types";
