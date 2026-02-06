"use client";

import { useMemo } from "react";

import {
	ACTION_CATEGORY_LABELS,
	type ActionCategory,
	useActionsForSurface,
} from "@/components/layout/actions/registry";
import { NavItem } from "./NavItem";

const CATEGORY_ORDER: ActionCategory[] = ["settings", "actions", "help"];

export function SidebarSettings() {
	const actions = useActionsForSurface("sidebar-settings");
	const groupedActions = useMemo(
		() =>
			CATEGORY_ORDER.map((category) => ({
				category,
				actions: actions.filter((action) => action.category === category),
			})).filter((group) => group.actions.length > 0),
		[actions],
	);

	return (
		<div className="space-y-3 p-2">
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
			<div className="border-t border-border" />
			<div className="px-3 text-[11px] text-foreground-quaternary">
				Links open in overlays/routes from this panel.
			</div>
		</div>
	);
}
