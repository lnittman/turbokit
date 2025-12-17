"use client";

/**
 * NotificationBell Component
 *
 * Placeholder - Notifications backend not yet implemented
 * See packages/backend/convex/app/ for domain structure
 */

import { Button } from "@spots/design/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@spots/design/components/ui/popover";
import { Bell } from "lucide-react";
import { useState } from "react";

export function NotificationBell() {
  const [open, setOpen] = useState(false);

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
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4">
        <div className="text-center">
          <h4 className="mb-2 font-semibold">Notifications</h4>
          <p className="text-muted-foreground text-sm">
            Notifications coming soon.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
