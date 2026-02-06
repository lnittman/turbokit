import type {
	CanvasStarterData,
	ChatStarterData,
	DashboardStarterData,
	FeedStarterData,
	KanbanStarterData,
	LayoutTone,
} from "./seams";

const green: LayoutTone = "var(--te-green)";
const blue: LayoutTone = "var(--te-blue)";
const red: LayoutTone = "var(--te-red)";
const yellow: LayoutTone = "var(--te-yellow)";
const orange: LayoutTone = "var(--te-orange)";

export const DEMO_DASHBOARD: DashboardStarterData = {
	metrics: [
		{ label: "ACTIVE USERS", value: "2,847", delta: "+12.3% from last week", tone: green },
		{ label: "REVENUE", value: "$48.2K", delta: "+8.1% from last month", tone: green },
		{ label: "OPEN ISSUES", value: "23", delta: "-4 since yesterday", tone: blue },
		{ label: "DEPLOY RATE", value: "3.2/day", delta: "stable", tone: yellow },
	],
	activityBars: Array.from({ length: 24 }, (_, i) => ({
		id: `bar-${i}`,
		value: Math.round(20 + Math.sin(i * 0.5) * 30 + Math.random() * 25),
	})),
	recentItems: [
		{ id: "r1", title: "Auth middleware refactor", meta: "packages/auth · 2h ago", status: "merged", tone: green },
		{ id: "r2", title: "Dashboard metric cards", meta: "apps/app · 4h ago", status: "in review", tone: yellow },
		{ id: "r3", title: "Fix notification badge count", meta: "packages/backend · 6h ago", status: "open", tone: blue },
		{ id: "r4", title: "Schema migration v3", meta: "packages/backend · 1d ago", status: "deployed", tone: green },
		{ id: "r5", title: "Sidebar nav regression", meta: "apps/app · 1d ago", status: "blocked", tone: red },
	],
};

export const DEMO_FEED: FeedStarterData = {
	filters: ["all", "product", "system", "team"],
	events: [
		{ id: "f1", type: "product", title: "New layout switcher shipped", summary: "Users can now toggle between dashboard, feed, chat, kanban, and canvas views from the sidebar.", tone: blue, time: "2m ago" },
		{ id: "f2", type: "system", title: "Deploy succeeded", summary: "turbokit-app deployed to production (v1.4.2). Build time: 28s.", tone: green, time: "15m ago" },
		{ id: "f3", type: "team", title: "Sprint 2 kickoff", summary: "Focus areas: UX polish, command palette improvements, and docs truth pass.", tone: yellow, time: "1h ago" },
		{ id: "f4", type: "product", title: "Command palette v1.1", summary: "Added keyboard-safe shortcuts and improved search across action categories.", tone: blue, time: "3h ago" },
		{ id: "f5", type: "system", title: "Convex schema updated", summary: "Added notifications table with indexes for userId and createdAt.", tone: orange, time: "5h ago" },
		{ id: "f6", type: "team", title: "Design review complete", summary: "Approved token refinements for functional color palette. Shipping Monday.", tone: green, time: "8h ago" },
		{ id: "f7", type: "system", title: "CI pipeline green", summary: "All 4 quality gates passing: lint, typecheck, build, test.", tone: green, time: "1d ago" },
	],
	canLoadMore: true,
};

export const DEMO_CHAT: ChatStarterData = {
	messages: [
		{ id: "c1", role: "user", body: "Can you help me set up the notification system?", time: "10:32 AM" },
		{ id: "c2", role: "assistant", body: "Sure. The notification system lives in `packages/backend/convex/app/notifications/`. You'll need to:\n\n1. Import `NotificationBell` in your header\n2. Configure push notification env vars (FCM/APNs/VAPID)\n3. Set up the Clerk webhook for user sync\n\nWant me to walk through each step?", time: "10:32 AM" },
		{ id: "c3", role: "user", body: "Yes, let's start with the NotificationBell component.", time: "10:33 AM" },
		{ id: "c4", role: "assistant", body: "Add it to your authenticated shell:\n\n```tsx\nimport { NotificationBell } from \"@/components/notifications\";\n\n// In your header/nav\n<NotificationBell />\n```\n\nThis gives you the bell icon with unread badge and a popover feed. It subscribes to real-time updates automatically via Convex.", time: "10:33 AM" },
	],
	isStreaming: false,
	connectionLabel: "connected",
};

export const DEMO_KANBAN: KanbanStarterData = {
	columns: [
		{
			id: "col-backlog",
			title: "Backlog",
			cards: [
				{ id: "k1", title: "Add dark mode toggle to settings", priority: "P3", tone: blue },
				{ id: "k2", title: "Write E2E tests for auth flow", priority: "P2", tone: yellow },
			],
		},
		{
			id: "col-todo",
			title: "To Do",
			cards: [
				{ id: "k3", title: "Implement notification preferences", priority: "P1", tone: red },
				{ id: "k4", title: "Fix sidebar collapse animation", priority: "P2", tone: yellow },
			],
		},
		{
			id: "col-progress",
			title: "In Progress",
			cards: [
				{ id: "k5", title: "Starter layouts demo data", priority: "P2", tone: orange },
			],
		},
		{
			id: "col-done",
			title: "Done",
			cards: [
				{ id: "k6", title: "Platform contract v1", priority: "P1", tone: green },
				{ id: "k7", title: "Shared infra migration", priority: "P1", tone: green },
				{ id: "k8", title: "Telemetry hardening", priority: "P2", tone: green },
			],
		},
	],
};

export const DEMO_CANVAS: CanvasStarterData = {
	nodes: [
		{ id: "n1", title: "Auth", x: 80, y: 120, tone: green, status: "complete" },
		{ id: "n2", title: "Backend", x: 320, y: 80, tone: green, status: "complete" },
		{ id: "n3", title: "Design System", x: 280, y: 240, tone: blue, status: "active" },
		{ id: "n4", title: "Notifications", x: 540, y: 160, tone: yellow, status: "planned" },
		{ id: "n5", title: "AI Agent", x: 520, y: 320, tone: orange, status: "planned" },
		{ id: "n6", title: "Payments", x: 760, y: 200, tone: red, status: "blocked" },
	],
	initialZoom: 100,
	minZoom: 50,
	maxZoom: 200,
};
