"use client";

/**
 * NotificationsFeed Component
 *
 * Placeholder - Notifications backend not yet implemented
 * See packages/backend/convex/app/ for domain structure
 */

interface NotificationsFeedProps {
  onClose?: () => void;
}

export function NotificationsFeed({ onClose }: NotificationsFeedProps) {
  return (
    <div className="w-96 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Notifications</h3>
      </div>
      <div className="flex h-32 flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">
          Notifications feed coming soon.
        </p>
      </div>
    </div>
  );
}
