"use client";

import {
	Bell,
	FileText,
	GearSix,
	Moon,
	Palette,
	Plus,
	Sidebar,
	SignOut,
	Sparkle,
	Sun,
	User,
} from "@phosphor-icons/react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type React from "react";
import { useCallback, useMemo } from "react";

import { sidebarCollapsedAtom } from "@/atoms/layout";
import { starterLayoutAtom } from "@/atoms/preferences";
import { turbokitConfig } from "@/config/turbokit.config";
import { STARTER_LAYOUT_LABELS, type StarterLayout } from "@/layouts";

export type ActionSurface = "command" | "sidebar-main" | "sidebar-settings";
export type ActionCategory =
	| "layouts"
	| "navigation"
	| "settings"
	| "actions"
	| "help";

export const ACTION_CATEGORY_LABELS: Record<ActionCategory, string> = {
	layouts: "layouts",
	navigation: "navigation",
	settings: "settings",
	actions: "actions",
	help: "help",
};

export interface AppAction {
	id: string;
	title: string;
	description?: string;
	icon?: React.ReactNode;
	category: ActionCategory;
	surfaces: ActionSurface[];
	commandShortcut?: string;
	sidebarShortcut?: string[];
	active?: boolean;
	action: () => void | Promise<void>;
}

interface UseActionRegistryOptions {
	openSidebarSettings?: () => void;
}

type ClerkWindow = Window & {
	Clerk?: {
		signOut: () => Promise<void>;
	};
};

export function useActionRegistry(
	options: UseActionRegistryOptions = {},
): AppAction[] {
	const [layout, setLayout] = useAtom(starterLayoutAtom);
	const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
	const { resolvedTheme, setTheme } = useTheme();
	const router = useRouter();
	const isClerkConfigured = Boolean(
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
	);

	const setLayoutAndNavigate = useCallback(
		(nextLayout: StarterLayout) => {
			setLayout(nextLayout);
			router.push("/");
		},
		[router, setLayout],
	);

	const openSettingsSection = useCallback(
		(section: "account" | "appearance" | "notifications") => {
			router.push(`/settings?section=${section}`);
		},
		[router],
	);

	return useMemo(() => {
		const layoutActions: AppAction[] = turbokitConfig.layout.options.map(
			(starter, index) => ({
				id: `layout-${starter}`,
				title: `open ${STARTER_LAYOUT_LABELS[starter]}`,
				description:
					starter === layout ? "currently active" : "switch starter surface",
				icon: <Sparkle className="h-4 w-4" />,
				category: "layouts",
				surfaces: ["command", "sidebar-main"],
				commandShortcut: `⌘${index + 1}`,
				sidebarShortcut: [`⌘${index + 1}`],
				active: starter === layout,
				action: () => setLayoutAndNavigate(starter),
			}),
		);

		const actions: AppAction[] = [
			...layoutActions,
			{
				id: "nav-settings",
				title: "open settings",
				description: "account, appearance, notifications",
				icon: <GearSix className="h-4 w-4" />,
				category: "navigation",
				surfaces: ["command"],
				commandShortcut: "⌘,",
				action: () => router.push("/settings"),
			},
			{
				id: "nav-profile",
				title: "open profile",
				description: "view profile overlay",
				icon: <User className="h-4 w-4" />,
				category: "navigation",
				surfaces: ["command", "sidebar-main"],
				action: () => router.push("/profile"),
			},
			{
				id: "nav-create",
				title: "create new",
				description: "open create overlay",
				icon: <Plus className="h-4 w-4" />,
				category: "navigation",
				surfaces: ["command", "sidebar-main"],
				commandShortcut: "⌘N",
				action: () => router.push("/create"),
			},
			{
				id: "settings-account",
				title: "account",
				description: "manage profile and identity",
				icon: <GearSix className="h-4 w-4" />,
				category: "settings",
				surfaces: ["command", "sidebar-settings"],
				action: () => openSettingsSection("account"),
			},
			{
				id: "settings-appearance",
				title: "appearance",
				description: "theme, accent, and density",
				icon: <Palette className="h-4 w-4" />,
				category: "settings",
				surfaces: ["command", "sidebar-settings"],
				action: () => openSettingsSection("appearance"),
			},
			{
				id: "settings-notifications",
				title: "notifications",
				description: "manage push and in-app preferences",
				icon: <Bell className="h-4 w-4" />,
				category: "settings",
				surfaces: ["command", "sidebar-settings"],
				action: () => openSettingsSection("notifications"),
			},
			{
				id: "action-theme",
				title: resolvedTheme === "dark" ? "switch to light" : "switch to dark",
				description: "toggle active theme",
				icon:
					resolvedTheme === "dark" ? (
						<Sun className="h-4 w-4" />
					) : (
						<Moon className="h-4 w-4" />
					),
				category: "actions",
				surfaces: ["command", "sidebar-settings"],
				commandShortcut: "⌘T",
				action: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
			},
			{
				id: "action-sidebar",
				title: sidebarCollapsed ? "expand sidebar" : "collapse sidebar",
				description: "toggle shell navigation",
				icon: <Sidebar className="h-4 w-4" />,
				category: "actions",
				surfaces: ["command"],
				commandShortcut: "⌘B",
				action: () => setSidebarCollapsed((current) => !current),
			},
			{
				id: "action-signout",
				title: "sign out",
				description: "end current session",
				icon: <SignOut className="h-4 w-4" />,
				category: "actions",
				surfaces: ["command", "sidebar-settings"],
				action: async () => {
					const clerk =
						typeof window === "undefined"
							? undefined
							: (window as ClerkWindow).Clerk;

					if (isClerkConfigured && typeof window !== "undefined" && clerk) {
						await clerk.signOut();
						return;
					}
					router.push("/signin");
				},
			},
			{
				id: "help-docs",
				title: "open documentation",
				description: "open docs in a new tab",
				icon: <FileText className="h-4 w-4" />,
				category: "help",
				surfaces: ["command", "sidebar-settings"],
				action: () => {
					window.open("/docs", "_blank", "noopener,noreferrer");
				},
			},
		];

		if (options.openSidebarSettings) {
			actions.push({
				id: "sidebar-open-settings",
				title: "settings",
				description: "open sidebar settings panel",
				icon: <GearSix className="h-4 w-4" />,
				category: "navigation",
				surfaces: ["sidebar-main"],
				sidebarShortcut: ["G", "S"],
				action: options.openSidebarSettings,
			});
		}

		return actions;
	}, [
		isClerkConfigured,
		layout,
		openSettingsSection,
		options.openSidebarSettings,
		resolvedTheme,
		router,
		setLayoutAndNavigate,
		setSidebarCollapsed,
		setTheme,
		sidebarCollapsed,
	]);
}

export function useActionsForSurface(
	surface: ActionSurface,
	options: UseActionRegistryOptions = {},
): AppAction[] {
	const actions = useActionRegistry(options);

	return useMemo(
		() => actions.filter((action) => action.surfaces.includes(surface)),
		[actions, surface],
	);
}
