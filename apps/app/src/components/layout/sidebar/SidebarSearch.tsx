"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@repo/design/lib/utils";
import { useAtom } from "jotai";

import { commandModalAtom } from "@/atoms/layout";

export function SidebarSearch({
	dividerVisible,
}: {
	dividerVisible?: boolean;
}) {
	const [, setCommandModal] = useAtom(commandModalAtom);

	return (
		<div
			className={cn(
				"flex h-12 items-center px-2",
				dividerVisible && "border-b border-border/60",
			)}
		>
			<button
				type="button"
				onClick={() =>
					setCommandModal({ open: true, activeItemId: null, searchQuery: "" })
				}
				className={cn(
					"flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
					"outline-none transition-colors",
					"bg-background-secondary text-foreground-secondary",
					"hover:bg-background-tertiary hover:text-foreground",
				)}
			>
				<MagnifyingGlass weight="bold" className="h-3.5 w-3.5" />
				<span>Search</span>
			</button>
		</div>
	);
}
