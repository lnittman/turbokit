export const STARTER_LAYOUTS = [
	"dashboard",
	"feed",
	"chat",
	"kanban",
	"canvas",
] as const;

export type StarterLayout = (typeof STARTER_LAYOUTS)[number];

export const STARTER_LAYOUT_LABELS: Record<StarterLayout, string> = {
	dashboard: "dashboard",
	feed: "feed",
	chat: "chat",
	kanban: "kanban",
	canvas: "canvas",
};
