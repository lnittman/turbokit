import React from "react";

import { Wrench } from "@phosphor-icons/react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "@repo/design/lib/utils";

export function ManageToolsButton(): React.ReactElement {
  return (
    <DropdownMenuPrimitive.Item 
      className={cn(
        "relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none transition-colors text-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      )}
    >
      <Wrench weight="duotone" className="h-4 w-4 mr-1.5" />
      <span>manage tools</span>
    </DropdownMenuPrimitive.Item>
  );
} 
