"use client";

/**
 * NotificationPreferences Component
 *
 * Placeholder - Notifications backend not yet implemented
 * See packages/backend/convex/app/ for domain structure
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@spots/design/components/ui/card";

export function NotificationPreferences() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            Notification preferences coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
