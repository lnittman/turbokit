"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/api";
import { Bell } from "lucide-react";
import { Button } from "@repo/design/components/ui/button";
import { Badge } from "@repo/design/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/design/components/ui/popover";
import { NotificationsFeed } from "./NotificationsFeed";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = useQuery(api.app.notifications.queries.countUnread);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount !== undefined && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <NotificationsFeed onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
