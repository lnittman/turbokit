"use client";

import { Collapsible } from "@base-ui-components/react/collapsible";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@repo/design/lib/utils";

interface NavGroupProps {
	label: string;
	icon?: React.ReactNode;
	expanded: boolean;
	onExpandedChange: (expanded: boolean) => void;
	actions?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}

export function NavGroup({
	label,
	icon,
	expanded,
	onExpandedChange,
	actions,
	children,
	className,
}: NavGroupProps) {
	return (
		<Collapsible.Root
			open={expanded}
			onOpenChange={onExpandedChange}
			className={className}
		>
			<div
				className={cn(
					"group flex items-center",
					expanded ? "text-foreground" : "text-foreground-secondary",
					"hover:text-foreground",
				)}
			>
				<Collapsible.Trigger
					className={cn(
						"flex h-7 flex-1 items-center gap-1.5 py-0 pl-2 pr-2 text-left text-sm",
						"cursor-pointer select-none outline-none transition-none",
					)}
				>
					<span className="flex w-5 shrink-0 items-center text-base leading-none">
						{icon}
					</span>
					<div className="flex min-w-0 items-center gap-1">
						<span className="truncate font-medium">{label}</span>
						<CaretDown
							weight="bold"
							className={cn(
								"h-3 w-3 text-foreground-tertiary transition-transform duration-100",
								!expanded && "-rotate-90",
							)}
						/>
					</div>
					<span className="flex-1" />
				</Collapsible.Trigger>

				{actions && <div className="shrink-0 pr-2">{actions}</div>}
			</div>
			<Collapsible.Panel
				className={cn(
					"grid overflow-hidden",
					"transition-[grid-template-rows,opacity] duration-100",
					"[transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
					expanded
						? "grid-rows-[1fr] opacity-100"
						: "grid-rows-[0fr] opacity-0",
				)}
			>
				<div className="overflow-hidden">
					<div className="py-1 pl-6 pr-2">{children}</div>
				</div>
			</Collapsible.Panel>
		</Collapsible.Root>
	);
}
