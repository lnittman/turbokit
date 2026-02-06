"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@repo/design/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, { type ReactNode, useCallback, useMemo, useState } from "react";

export interface MenuItem {
	id: string;
	label: string;
	icon?: ReactNode;
	onClick: (e: React.MouseEvent | Event) => void;
	isDanger?: boolean;
	disabled?: boolean;
}

export interface MenuGroup {
	items: MenuItem[];
	showDivider?: boolean;
}

interface MenuProps {
	trigger: ReactNode;
	groups: MenuGroup[];
	side?: "top" | "right" | "bottom" | "left";
	align?: "start" | "center" | "end";
	sideOffset?: number;
	className?: string;
	contentClassName?: string;
	triggerClassName?: string;
	triggerActiveClassName?: string;
}

export function Menu({
	trigger,
	groups,
	side = "right",
	align = "start",
	sideOffset = 4,
	className,
	contentClassName,
	triggerClassName,
	triggerActiveClassName,
}: MenuProps) {
	const [isOpen, setIsOpen] = useState(false);

	// Handle trigger click to prevent navigation in Link elements
	const handleTriggerClick = useCallback((e: React.MouseEvent) => {
		// Only stop propagation to prevent parent actions
		e.stopPropagation();
	}, []);

	// Memoize the open change handler
	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (isOpen !== open) {
				setIsOpen(open);
			}
		},
		[isOpen],
	);

	// Render a single menu item - memoize for performance
	const renderMenuItem = useCallback(
		(item: MenuItem) => (
			<DropdownMenuPrimitive.Item
				key={item.id}
				onSelect={(e) => {
					// Stop propagation to prevent parent actions but don't prevent dropdown closing
					item.onClick?.(e);
				}}
				disabled={item.disabled}
				className={cn(
					"relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none transition-colors",
					item.isDanger ? "text-red-500" : "text-foreground",
					"focus:bg-accent focus:text-accent-foreground",
					"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				)}
			>
				{item.icon && <span className="mr-1.5">{item.icon}</span>}
				<span>{item.label}</span>
			</DropdownMenuPrimitive.Item>
		),
		[],
	);

	// Memoize the trigger class to avoid recreating on each render
	const computedTriggerClassName = useMemo(
		() => cn(triggerClassName, isOpen && triggerActiveClassName),
		[triggerClassName, triggerActiveClassName, isOpen],
	);

	return (
		<div className={cn("relative", className)}>
			<DropdownMenuPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
				<DropdownMenuPrimitive.Trigger asChild>
					<button
						type="button"
						onClick={handleTriggerClick}
						onMouseDown={(e) => e.stopPropagation()}
						className={computedTriggerClassName}
						aria-label="Menu"
					>
						{trigger}
					</button>
				</DropdownMenuPrimitive.Trigger>

				<AnimatePresence>
					{isOpen && (
						<DropdownMenuPrimitive.Portal forceMount>
							<DropdownMenuPrimitive.Content
								asChild
								side={side}
								align={align}
								sideOffset={sideOffset}
							>
								<motion.div
									className={cn(
										"z-50 min-w-[160px] overflow-hidden border border-border/20 bg-popover/95 backdrop-blur-sm p-1.5 shadow-xl",
										contentClassName,
									)}
									initial={{
										opacity: 0,
										scale: 0.95,
										x: side === "left" ? 10 : side === "right" ? -10 : 0,
										y: side === "top" ? 10 : side === "bottom" ? -10 : 0,
									}}
									animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
									exit={{
										opacity: 0,
										scale: 0.95,
										x: side === "left" ? 10 : side === "right" ? -10 : 0,
										y: side === "top" ? 10 : side === "bottom" ? -10 : 0,
									}}
									transition={{
										duration: 0.2,
										ease: [0.32, 0.72, 0, 1],
									}}
									onClick={(e) => e.stopPropagation()}
								>
									{groups.map((group, groupIndex) => {
										const groupKey = group.items
											.map((item) => item.id)
											.join("-");

										return (
											<React.Fragment key={groupKey}>
												{group.items.map(renderMenuItem)}
												{group.showDivider &&
													groupIndex < groups.length - 1 && (
														<DropdownMenuPrimitive.Separator
															key={`${groupKey}-divider`}
															className="my-1 h-px bg-border/20"
														/>
													)}
											</React.Fragment>
										);
									})}
								</motion.div>
							</DropdownMenuPrimitive.Content>
						</DropdownMenuPrimitive.Portal>
					)}
				</AnimatePresence>
			</DropdownMenuPrimitive.Root>
		</div>
	);
}
