"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";

export type StarterSeamStatus = "loading" | "ready" | "empty" | "error";

export type StarterSeamState<TData> = {
	status: StarterSeamStatus;
	data: TData;
	errorMessage?: string;
};

export type LayoutTone =
	| "var(--te-green)"
	| "var(--te-blue)"
	| "var(--te-red)"
	| "var(--te-yellow)"
	| "var(--te-orange)";

export type DashboardMetric = {
	label: string;
	value: string;
	delta: string;
	tone: LayoutTone;
};

export type DashboardActivityBar = {
	id: string;
	value: number;
	tone?: LayoutTone;
};

export type DashboardRecentItem = {
	id: string;
	title: string;
	meta: string;
	status: string;
	tone: LayoutTone;
};

export type DashboardStarterData = {
	metrics: DashboardMetric[];
	activityBars: DashboardActivityBar[];
	recentItems: DashboardRecentItem[];
};

export type FeedType = "all" | "product" | "system" | "team";

export type FeedEvent = {
	id: string;
	type: FeedType;
	title: string;
	summary: string;
	tone: LayoutTone;
	time: string;
};

export type FeedStarterData = {
	filters: FeedType[];
	events: FeedEvent[];
	canLoadMore: boolean;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
	id: string;
	role: ChatRole;
	body: string;
	time: string;
};

export type ChatStarterData = {
	messages: ChatMessage[];
	isStreaming: boolean;
	connectionLabel: string;
};

export type KanbanCard = {
	id: string;
	title: string;
	priority: string;
	tone: LayoutTone;
};

export type KanbanColumn = {
	id: string;
	title: string;
	cards: KanbanCard[];
};

export type KanbanStarterData = {
	columns: KanbanColumn[];
};

export type CanvasNode = {
	id: string;
	title: string;
	x: number;
	y: number;
	tone: LayoutTone;
	status: string;
};

export type CanvasStarterData = {
	nodes: CanvasNode[];
	initialZoom: number;
	minZoom: number;
	maxZoom: number;
};

export type StarterLayoutSeams = {
	useDashboard: () => StarterSeamState<DashboardStarterData>;
	useFeed: () => StarterSeamState<FeedStarterData>;
	useChat: () => StarterSeamState<ChatStarterData>;
	useKanban: () => StarterSeamState<KanbanStarterData>;
	useCanvas: () => StarterSeamState<CanvasStarterData>;
};

const EMPTY_DASHBOARD_DATA: DashboardStarterData = {
	metrics: [],
	activityBars: [],
	recentItems: [],
};

const EMPTY_FEED_DATA: FeedStarterData = {
	filters: ["all", "product", "system", "team"],
	events: [],
	canLoadMore: false,
};

const EMPTY_CHAT_DATA: ChatStarterData = {
	messages: [],
	isStreaming: false,
	connectionLabel: "disconnected",
};

const EMPTY_KANBAN_DATA: KanbanStarterData = {
	columns: [],
};

const EMPTY_CANVAS_DATA: CanvasStarterData = {
	nodes: [],
	initialZoom: 100,
	minZoom: 50,
	maxZoom: 200,
};

/**
 * Demo data provides realistic content so layouts render out of the box.
 * Replace these defaults with real Convex queries when wiring your app.
 */
import {
	DEMO_CANVAS,
	DEMO_CHAT,
	DEMO_DASHBOARD,
	DEMO_FEED,
	DEMO_KANBAN,
} from "./demo-data";

const defaultStarterLayoutSeams: StarterLayoutSeams = {
	useDashboard: () => ({ status: "ready", data: DEMO_DASHBOARD }),
	useFeed: () => ({ status: "ready", data: DEMO_FEED }),
	useChat: () => ({ status: "ready", data: DEMO_CHAT }),
	useKanban: () => ({ status: "ready", data: DEMO_KANBAN }),
	useCanvas: () => ({ status: "ready", data: DEMO_CANVAS }),
};

const StarterLayoutSeamContext = createContext<StarterLayoutSeams>(
	defaultStarterLayoutSeams,
);

export function StarterLayoutSeamProvider({
	seams,
	children,
}: {
	seams: Partial<StarterLayoutSeams>;
	children: React.ReactNode;
}): React.ReactElement {
	const value = useMemo(
		() => ({ ...defaultStarterLayoutSeams, ...seams }),
		[seams],
	);

	return (
		<StarterLayoutSeamContext.Provider value={value}>
			{children}
		</StarterLayoutSeamContext.Provider>
	);
}

export function useDashboardStarterSeam(): StarterSeamState<DashboardStarterData> {
	return useContext(StarterLayoutSeamContext).useDashboard();
}

export function useFeedStarterSeam(): StarterSeamState<FeedStarterData> {
	return useContext(StarterLayoutSeamContext).useFeed();
}

export function useChatStarterSeam(): StarterSeamState<ChatStarterData> {
	return useContext(StarterLayoutSeamContext).useChat();
}

export function useKanbanStarterSeam(): StarterSeamState<KanbanStarterData> {
	return useContext(StarterLayoutSeamContext).useKanban();
}

export function useCanvasStarterSeam(): StarterSeamState<CanvasStarterData> {
	return useContext(StarterLayoutSeamContext).useCanvas();
}
