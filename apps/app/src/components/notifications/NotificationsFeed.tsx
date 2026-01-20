"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/api";
import { Button } from "@repo/design/components/ui/button";
import { ScrollArea } from "@repo/design/components/ui/scroll-area";
import { Separator } from "@repo/design/components/ui/separator";
import { cn } from "@repo/design/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck } from "lucide-react";

interface NotificationsFeedProps {
  onClose?: () => void;
}

export function NotificationsFeed({ onClose }: NotificationsFeedProps) {
  const notifications = useQuery(api.app.notifications.queries.list, { limit: 20 });
  const markRead = useMutation(api.app.notifications.mutations.markRead);
  const markAllRead = useMutation(api.app.notifications.mutations.markAllRead);

  const handleNotificationClick = async (notification: NonNullable<typeof notifications>[number]) => {
    // Mark as read if unread
    if (!notification.read) {
      await markRead({ notificationId: notification._id });
    }

    // Navigate to link if provided
    if (notification.link) {
      window.location.href = notification.link;
      onClose?.();
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  if (notifications === undefined) {
    return (
      <div className="w-96 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const hasUnread = notifications.some((n: typeof notifications[number]) => !n.read);

  return (
    <div className="w-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Notifications</h3>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="h-8 text-xs"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[400px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-muted-foreground text-sm">
              No notifications yet
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification: typeof notifications[number]) => (
              <button
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "w-full text-left p-4 transition-colors hover:bg-accent/50",
                  !notification.read && "bg-accent/20"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Icon (if provided) */}
                  {notification.icon && (
                    <div className="mt-0.5 text-muted-foreground">
                      {/* You can map icon names to actual icon components here */}
                      <div className="h-5 w-5 rounded-full bg-primary/10" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium text-foreground line-clamp-1",
                          !notification.read && "font-semibold"
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(notification.createdAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
