"use client";

import Link from 'next/link';
import { User } from '@phosphor-icons/react';
import { Tooltip } from '@base-ui-components/react/tooltip';
import { cn } from '@repo/design/lib/utils';

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  const link = (
    <Link
      href="/profile"
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-sm",
        "transition-all duration-[0ms] hover:transition-duration-[150ms]",
        "hover:bg-accent/10 active:scale-[0.98]",
        "text-muted-foreground hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <User className="h-5 w-5 flex-shrink-0" weight="regular" />
      <span className={cn(
        "transition-all duration-300",
        collapsed && "opacity-0 w-0 overflow-hidden"
      )}>
        Account
      </span>
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip.Provider delay={300} closeDelay={0}>
      <Tooltip.Root>
        <Tooltip.Trigger render={link} aria-label="Account" />
        <Tooltip.Portal>
          <Tooltip.Positioner side="right" sideOffset={8}>
            <Tooltip.Popup className="tk-sidebar-tooltip">
              Account
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
