"use client";

/**
 * NotificationBell Component
 *
 * A notification bell icon with unread badge that opens a popover feed.
 * Uses real-time Convex subscription for live updates.
 */

import { Badge } from "@spots/design/components/ui/badge";
import { Button } from "@spots/design/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@spots/design/components/ui/popover";
import { api } from "@spots/backend/api";
import { useQuery } from "convex/react";
import { Bell } from "lucide-react";
import { useState } from "react";
import { NotificationsFeed } from "./NotificationsFeed";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = useQuery(api.app.notifications.queries.countUnread);

  const displayCount = unreadCount
    ? unreadCount > 99
      ? "99+"
      : unreadCount.toString()
    : null;

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Notifications"
          className="relative"
          size="icon"
          variant="ghost"
        >
          <Bell className="h-5 w-5" />
          {displayCount && (
            <Badge
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs"
              variant="default"
            >
              {displayCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <NotificationsFeed onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
