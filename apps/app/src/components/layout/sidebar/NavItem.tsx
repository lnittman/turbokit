"use client";

import { Tooltip } from "@base-ui-components/react/tooltip";
import type * as React from "react";
import { cn } from "@repo/design/lib/utils";

interface NavItemProps {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  selected?: boolean;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function NavItem({
  label,
  icon,
  shortcut,
  selected,
  active,
  onClick,
  className,
  children,
}: NavItemProps) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      data-selected={selected || undefined}
      data-active={active || undefined}
      className={cn(
        "flex h-7 w-full items-center gap-2 rounded-[8px] py-0 pl-3 pr-2 text-left text-sm",
        "cursor-pointer outline-none transition-none",
        selected
          ? "bg-background-secondary text-foreground"
          : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground",
        active && !selected && "text-foreground",
        className,
      )}
    >
      <span className="flex w-5 shrink-0 items-center text-base leading-none">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {children}
    </button>
  );

  if (!shortcut) {
    return button;
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={button} />
      <Tooltip.Portal>
        <Tooltip.Positioner side="right" sideOffset={8}>
          <Tooltip.Popup
            className={cn(
              "z-50 flex items-center gap-1.5 rounded-md px-2 py-1",
              "bg-background-secondary border border-border",
              "text-xs text-foreground-secondary",
              "shadow-lg",
              "origin-[var(--transform-origin)]",
              "transition-[transform,opacity] duration-100",
              "[transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
              "data-[instant]:duration-0",
              "data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0",
              "data-[ending-style]:scale-[0.96] data-[ending-style]:opacity-0",
            )}
          >
            {shortcut.map((key, i) => (
              <span key={key}>
                {i > 0 && <span className="text-foreground-tertiary">then</span>}
                <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-background-tertiary px-1 font-mono text-[11px] font-medium text-foreground">
                  {key}
                </kbd>
              </span>
            ))}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
