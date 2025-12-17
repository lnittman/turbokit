"use client";

/**
 * NotificationPreferences Component
 *
 * Settings panel for managing notification preferences across channels.
 * Uses real-time Convex subscription for live updates.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@spots/design/components/ui/card";
import { Label } from "@spots/design/components/ui/label";
import { Separator } from "@spots/design/components/ui/separator";
import { Skeleton } from "@spots/design/components/ui/skeleton";
import { Switch } from "@spots/design/components/ui/switch";
import { useToast } from "@spots/design/hooks/use-toast";
import { api } from "@spots/backend/api";
import { useQuery, useMutation } from "convex/react";
import { Bell, Mail, Smartphone } from "lucide-react";

export function NotificationPreferences() {
  const preferences = useQuery(api.app.notifications.queries.getPreferences);
  const updatePreferences = useMutation(
    api.app.notifications.mutations.updatePreferences
  );
  const { toast } = useToast();

  const handleToggle = async (
    key: "email" | "push" | "inApp",
    value: boolean
  ) => {
    try {
      await updatePreferences({ [key]: value });
      toast({
        title: "Preferences updated",
        description: `${key === "inApp" ? "In-app" : key.charAt(0).toUpperCase() + key.slice(1)} notifications ${value ? "enabled" : "disabled"}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (preferences === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-10" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* In-App Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Bell className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="inApp">In-App Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Show notifications in the notification bell
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.inApp}
            id="inApp"
            onCheckedChange={(checked) => handleToggle("inApp", checked)}
          />
        </div>

        <Separator />

        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Smartphone className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="push">Push Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive push notifications on your devices
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.push}
            id="push"
            onCheckedChange={(checked) => handleToggle("push", checked)}
          />
        </div>

        <Separator />

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Mail className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="email">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive notification summaries via email
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.email}
            id="email"
            onCheckedChange={(checked) => handleToggle("email", checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
