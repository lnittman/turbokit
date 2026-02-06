"use client";

import { GearSix } from "@phosphor-icons/react";
import { cn } from "@repo/design/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
	navigationDirectionAtom,
	pushViewAtom,
	sidebarViewAtom,
} from "@/atoms/sidebar";

import { NavItem } from "./NavItem";
import { SidebarBackHeader } from "./SidebarBackHeader";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarSettings } from "./SidebarSettings";

const TRANSITION_DURATION = 0.25;
const EASE = [0.32, 0.72, 0, 1] as const;

function MainView({
	navScrolled,
	onNavScrolledChange,
	onNavigate,
}: {
	navScrolled: boolean;
	onNavScrolledChange: (scrolled: boolean) => void;
	onNavigate: () => void;
}) {
	return (
		<>
			<SidebarSearch dividerVisible={navScrolled} />
			{/* Main nav area — placeholder for project/page navigation */}
			<div
				className="flex-1 overflow-y-auto px-2 py-2"
				onScroll={(e) => onNavScrolledChange(e.currentTarget.scrollTop > 0)}
			>
				<div className="text-xs text-foreground-quaternary px-3 py-2">
					Navigation items will go here
				</div>
			</div>
			<div className="border-t border-border px-2 py-2">
				<NavItem
					label="Settings"
					icon={<GearSix weight="duotone" className="h-4 w-4" />}
					shortcut={["G", "S"]}
					onClick={onNavigate}
				/>
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
							onNavigate={() => pushView("settings")}
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
