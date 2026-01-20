"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/design/components/ui/card";
import { Switch } from "@repo/design/components/ui/switch";
import { Label } from "@repo/design/components/ui/label";
import { Separator } from "@repo/design/components/ui/separator";
import { useToast } from "@repo/design/hooks/use-toast";

export function NotificationPreferences() {
  const preferences = useQuery(api.app.notifications.queries.getPreferences);
  const updatePreferences = useMutation(api.app.notifications.mutations.updatePreferences);
  const { toast } = useToast();

  const handleToggle = async (field: "email" | "push" | "inApp", value: boolean) => {
    try {
      await updatePreferences({ [field]: value });
      toast({
        title: "Preferences updated",
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} notifications ${value ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      toast({
        title: "Failed to update preferences",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (preferences === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Loading preferences...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-12 bg-muted animate-pulse rounded" />
          <div className="h-12 bg-muted animate-pulse rounded" />
          <div className="h-12 bg-muted animate-pulse rounded" />
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
          <div className="space-y-0.5">
            <Label htmlFor="in-app" className="text-base font-medium">
              In-App Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Show notifications in the notification bell
            </p>
          </div>
          <Switch
            id="in-app"
            checked={preferences.inApp}
            onCheckedChange={(checked: boolean) => handleToggle("inApp", checked)}
          />
        </div>

        <Separator />

        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push" className="text-base font-medium">
              Push Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications on your devices
            </p>
          </div>
          <Switch
            id="push"
            checked={preferences.push}
            onCheckedChange={(checked: boolean) => handleToggle("push", checked)}
          />
        </div>

        <Separator />

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email" className="text-base font-medium">
              Email Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch
            id="email"
            checked={preferences.email}
            onCheckedChange={(checked: boolean) => handleToggle("email", checked)}
          />
        </div>

        {/* Future: Per-type preferences could go here */}
        {preferences.types && Object.keys(preferences.types).length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Notification Types</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Customize specific notification types
                </p>
              </div>
              {Object.entries(preferences.types as Record<string, boolean>).map(
                ([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between pl-4">
                    <Label htmlFor={`type-${type}`} className="text-sm font-normal">
                      {type.replace(/\./g, " › ").replace(/_/g, " ")}
                    </Label>
                    <Switch
                      id={`type-${type}`}
                      checked={enabled}
                      onCheckedChange={async (checked: boolean) => {
                        try {
                          await updatePreferences({
                            types: {
                              ...preferences.types,
                              [type]: checked,
                            },
                          });
                          toast({
                            title: "Preference updated",
                            description: `${type} notifications ${checked ? "enabled" : "disabled"}`,
                          });
                        } catch (error) {
                          toast({
                            title: "Failed to update preference",
                            description: "Please try again later",
                            variant: "destructive",
                          });
                        }
                      }}
                    />
                  </div>
                )
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
