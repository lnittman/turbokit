"use client";

import { User } from "@phosphor-icons/react";
import { cn } from "@spots/design/lib/utils";

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-sm",
        "transition-all duration-[0ms] hover:transition-duration-[150ms]",
        "cursor-pointer hover:bg-accent/10 active:scale-[0.98]",
        "text-muted-foreground hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <User className="h-5 w-5 flex-shrink-0" weight="regular" />
      <span
        className={cn(
          "transition-all duration-300",
          collapsed && "w-0 overflow-hidden opacity-0"
        )}
      >
        Account
      </span>
    </div>
  );
}
