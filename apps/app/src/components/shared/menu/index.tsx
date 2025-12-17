"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@spots/design/lib/utils";
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
    [isOpen]
  );

  // Render a single menu item - memoize for performance
  const renderMenuItem = useCallback(
    (item: MenuItem) => (
      <DropdownMenuPrimitive.Item
        className={cn(
          "relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none transition-colors",
          item.isDanger ? "text-red-500" : "text-foreground",
          "focus:bg-accent focus:text-accent-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        )}
        disabled={item.disabled}
        key={item.id}
        onSelect={(e) => {
          // Stop propagation to prevent parent actions but don't prevent dropdown closing
          item.onClick?.(e);
        }}
      >
        {item.icon && <span className="mr-1.5">{item.icon}</span>}
        <span>{item.label}</span>
      </DropdownMenuPrimitive.Item>
    ),
    []
  );

  // Memoize the trigger class to avoid recreating on each render
  const computedTriggerClassName = useMemo(
    () => cn(triggerClassName, isOpen && triggerActiveClassName),
    [triggerClassName, triggerActiveClassName, isOpen]
  );

  return (
    <div
      className={cn("relative", className)}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <DropdownMenuPrimitive.Root onOpenChange={handleOpenChange} open={isOpen}>
        <DropdownMenuPrimitive.Trigger asChild>
          <button
            aria-label="Menu"
            className={computedTriggerClassName}
            onClick={handleTriggerClick}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {trigger}
          </button>
        </DropdownMenuPrimitive.Trigger>

        <AnimatePresence>
          {isOpen && (
            <DropdownMenuPrimitive.Portal forceMount>
              <DropdownMenuPrimitive.Content
                align={align}
                asChild
                side={side}
                sideOffset={sideOffset}
              >
                <motion.div
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  className={cn(
                    "z-50 min-w-[160px] overflow-hidden border border-border/20 bg-popover/95 p-1.5 shadow-xl backdrop-blur-sm",
                    contentClassName
                  )}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    x: side === "left" ? 10 : side === "right" ? -10 : 0,
                    y: side === "top" ? 10 : side === "bottom" ? -10 : 0,
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                    x: side === "left" ? 10 : side === "right" ? -10 : 0,
                    y: side === "top" ? 10 : side === "bottom" ? -10 : 0,
                  }}
                  onClick={(e) => e.stopPropagation()}
                  transition={{
                    duration: 0.2,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                >
                  {groups.map((group, groupIndex) => (
                    <React.Fragment key={groupIndex}>
                      {group.items.map(renderMenuItem)}
                      {group.showDivider && groupIndex < groups.length - 1 && (
                        <DropdownMenuPrimitive.Separator
                          className="my-1 h-px bg-border/20"
                          key={`divider-${groupIndex}`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </motion.div>
              </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
          )}
        </AnimatePresence>
      </DropdownMenuPrimitive.Root>
    </div>
  );
}
