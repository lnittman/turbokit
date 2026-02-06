"use client";

import { Tooltip } from "@base-ui-components/react/tooltip";
import { cn } from "@repo/design/lib/utils";
import { useAtomValue } from "jotai";
import type React from "react";

import { sidebarCollapsedAtom } from "@/atoms/layout";

import { SidebarTransition } from "./SidebarTransition";

const SIDEBAR_WIDTH = 260;

export function Sidebar(): React.ReactElement | null {
	const collapsed = useAtomValue(sidebarCollapsedAtom);

	if (collapsed) {
		return null;
	}

	return (
		<Tooltip.Provider delay={300} closeDelay={0}>
			<aside
				style={{ width: SIDEBAR_WIDTH }}
				className={cn(
					"relative flex h-full shrink-0 flex-col border-r border-border bg-background",
				)}
			>
				<SidebarTransition />
			</aside>
		</Tooltip.Provider>
	);
}
