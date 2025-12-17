import { Wrench } from "@phosphor-icons/react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@spots/design/lib/utils";
import type React from "react";

export function ManageToolsButton(): React.ReactElement {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center px-2 py-1.5 text-foreground text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      )}
    >
      <Wrench className="mr-1.5 h-4 w-4" weight="duotone" />
      <span>manage tools</span>
    </DropdownMenuPrimitive.Item>
  );
}
