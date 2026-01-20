"use client";

import { User } from '@phosphor-icons/react';
import { cn } from '@repo/design/lib/utils';

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-sm",
      "transition-all duration-[0ms] hover:transition-duration-[150ms]",
      "hover:bg-accent/10 active:scale-[0.98] cursor-pointer",
      "text-muted-foreground hover:text-foreground",
      collapsed && "justify-center px-0"
    )}>
      <User className="h-5 w-5 flex-shrink-0" weight="regular" />
      <span className={cn(
        "transition-all duration-300",
        collapsed && "opacity-0 w-0 overflow-hidden"
      )}>
        Account
      </span>
    </div>
  );
}
