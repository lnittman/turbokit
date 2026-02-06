"use client";

import { CaretLeft } from "@phosphor-icons/react";
import { cn } from "@repo/design/lib/utils";
import { useSetAtom } from "jotai";

import { popViewAtom } from "@/atoms/sidebar";

interface SidebarBackHeaderProps {
	title: string;
}

export function SidebarBackHeader({ title }: SidebarBackHeaderProps) {
	const popView = useSetAtom(popViewAtom);

	return (
		<div className="flex h-12 items-center px-2">
			<button
				type="button"
				onClick={() => popView()}
				className={cn(
					"flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
					"outline-none transition-colors duration-150 hover:duration-0",
					"bg-background-secondary text-foreground-secondary",
					"hover:bg-background-tertiary hover:text-foreground",
				)}
			>
				<CaretLeft weight="bold" className="h-3.5 w-3.5" />
				<span>{title}</span>
			</button>
		</div>
	);
}
