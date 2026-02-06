"use client";

import { cn } from "@repo/design/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	navigationDirectionAtom,
	pushViewAtom,
	sidebarViewAtom,
} from "@/atoms/sidebar";
import {
	ACTION_CATEGORY_LABELS,
	type ActionCategory,
	type AppAction,
	useActionsForSurface,
} from "@/components/layout/actions/registry";

import { NavItem } from "./NavItem";
import { SidebarBackHeader } from "./SidebarBackHeader";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarSettings } from "./SidebarSettings";

const TRANSITION_DURATION = 0.25;
const EASE = [0.32, 0.72, 0, 1] as const;
const MAIN_CATEGORY_ORDER: ActionCategory[] = [
	"layouts",
	"navigation",
	"actions",
];

interface ActionGroup {
	category: ActionCategory;
	actions: AppAction[];
}

function groupActions(
	actions: AppAction[],
	order: ActionCategory[],
): ActionGroup[] {
	return order
		.map((category) => ({
			category,
			actions: actions.filter((action) => action.category === category),
		}))
		.filter((group) => group.actions.length > 0);
}

function MainView({
	navScrolled,
	onNavScrolledChange,
	actions,
}: {
	navScrolled: boolean;
	onNavScrolledChange: (scrolled: boolean) => void;
	actions: AppAction[];
}) {
	const groupedActions = useMemo(
		() => groupActions(actions, MAIN_CATEGORY_ORDER),
		[actions],
	);

	return (
		<>
			<SidebarSearch dividerVisible={navScrolled} />
			<div
				className="flex-1 overflow-y-auto px-2 py-2"
				onScroll={(e) => onNavScrolledChange(e.currentTarget.scrollTop > 0)}
			>
				<div className="space-y-3">
					{groupedActions.map((group) => (
						<section key={group.category} className="space-y-1">
							<div className="px-3 text-[11px] text-foreground-quaternary">
								{ACTION_CATEGORY_LABELS[group.category]}
							</div>
							<div className="space-y-0.5">
								{group.actions.map((action) => (
									<NavItem
										key={action.id}
										label={action.title}
										icon={action.icon}
										shortcut={action.sidebarShortcut}
										active={action.active}
										onClick={() => {
											void action.action();
										}}
									/>
								))}
							</div>
						</section>
					))}
				</div>
			</div>
		</>
	);
}

function SettingsView() {
	return (
		<>
			<SidebarBackHeader title="Settings" />
			<div className="flex-1 overflow-y-auto">
				<SidebarSettings />
			</div>
		</>
	);
}

export function SidebarTransition({ className }: { className?: string }) {
	const view = useAtomValue(sidebarViewAtom);
	const direction = useAtomValue(navigationDirectionAtom);
	const pushView = useSetAtom(pushViewAtom);
	const openSidebarSettings = useCallback(() => {
		pushView("settings");
	}, [pushView]);
	const mainActions = useActionsForSurface("sidebar-main", {
		openSidebarSettings,
	});
	const [navScrolled, setNavScrolled] = useState(false);

	useEffect(() => {
		if (view !== "main") setNavScrolled(false);
	}, [view]);

	return (
		<div className={cn("relative flex-1 overflow-hidden", className)}>
			<AnimatePresence mode="popLayout" initial={false} custom={direction}>
				{view === "main" ? (
					<motion.div
						key="main"
						custom={direction}
						initial={{ opacity: 0, x: -16, filter: "blur(6px)" }}
						animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
						exit={{ opacity: 0, x: -16, filter: "blur(6px)" }}
						transition={{ duration: TRANSITION_DURATION, ease: EASE }}
						className="absolute inset-0 flex flex-col"
					>
						<MainView
							navScrolled={navScrolled}
							onNavScrolledChange={setNavScrolled}
							actions={mainActions}
						/>
					</motion.div>
				) : (
					<motion.div
						key="settings"
						custom={direction}
						initial={{ opacity: 0, x: 16, filter: "blur(6px)" }}
						animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
						exit={{ opacity: 0, x: 16, filter: "blur(6px)" }}
						transition={{ duration: TRANSITION_DURATION, ease: EASE }}
						className="absolute inset-0 flex flex-col"
					>
						<SettingsView />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
