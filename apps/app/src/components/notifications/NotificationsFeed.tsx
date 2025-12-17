"use client";

/**
 * NotificationsFeed Component
 *
 * Displays a list of notifications with read/unread states and actions.
 * Uses real-time Convex subscription for live updates.
 */

import { Button } from "@spots/design/components/ui/button";
import { ScrollArea } from "@spots/design/components/ui/scroll-area";
import { Separator } from "@spots/design/components/ui/separator";
import { Skeleton } from "@spots/design/components/ui/skeleton";
import { cn } from "@spots/design/lib/utils";
import { api } from "@spots/backend/api";
import { useQuery, useMutation } from "convex/react";
import { CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationsFeedProps {
  onClose?: () => void;
}

export function NotificationsFeed({ onClose }: NotificationsFeedProps) {
  const notifications = useQuery(api.app.notifications.queries.list, {
    limit: 20,
  });
  const markRead = useMutation(api.app.notifications.mutations.markRead);
  const markAllRead = useMutation(api.app.notifications.mutations.markAllRead);

  const hasUnread = notifications?.some((n) => !n.read);

  const handleNotificationClick = async (notification: NonNullable<typeof notifications>[number]) => {
    if (!notification.read) {
      await markRead({ notificationId: notification._id });
    }
    if (notification.link) {
      window.location.href = notification.link;
      onClose?.();
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead({});
  };

  // Loading state
  if (notifications === undefined) {
    return (
      <div className="w-full p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <div className="w-full p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="flex h-32 flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-sm">
            No notifications yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="font-semibold text-foreground">Notifications</h3>
        {hasUnread && (
          <Button
            className="h-auto gap-1 p-0 text-xs"
            onClick={handleMarkAllRead}
            size="sm"
            variant="link"
          >
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {notifications.map((notification) => (
            <button
              key={notification._id}
              className={cn(
                "flex w-full cursor-pointer gap-3 p-4 text-left transition-colors hover:bg-accent",
                !notification.read && "bg-accent/50"
              )}
              onClick={() => handleNotificationClick(notification)}
              type="button"
            >
              {/* Unread indicator */}
              <div className="flex h-full items-start pt-1">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    !notification.read ? "bg-primary" : "bg-transparent"
                  )}
                />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-sm",
                    !notification.read ? "font-semibold" : "font-normal"
                  )}
                >
                  {notification.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                  {notification.body}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(notification.createdAt, {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
