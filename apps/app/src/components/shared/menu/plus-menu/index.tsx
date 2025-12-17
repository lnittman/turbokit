"use client";

import { Plus } from "@phosphor-icons/react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Button } from "@spots/design/components/ui/button";
import { cn } from "@spots/design/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

import { ManageToolsButton } from "./components/manage-tools-button";
import { ScreenshotButton } from "./components/screenshot-button";
import { UploadFileButton } from "./components/upload-file-button";

interface PlusMenuProps {
  disabled?: boolean;
}

export function PlusMenu({ disabled = false }: PlusMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showHoverEffect, setShowHoverEffect] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowHoverEffect(true);
    } else if (!isHovering) {
      setShowHoverEffect(false);
    }
  }, [isOpen, isHovering]);

  return (
    <DropdownMenuPrimitive.Root onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-none border text-muted-foreground transition-all duration-300",
            showHoverEffect
              ? "border-input bg-muted"
              : "border-input/40 bg-muted/40 hover:border-input hover:bg-muted hover:text-foreground"
          )}
          disabled={disabled}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          size="icon"
          type="button"
          variant="outline"
        >
          <Plus
            className={`h-4 w-4 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-45" : "rotate-0"}`}
            weight="duotone"
          />
        </Button>
      </DropdownMenuPrimitive.Trigger>
      <AnimatePresence>
        {isOpen && (
          <DropdownMenuPrimitive.Portal forceMount>
            <DropdownMenuPrimitive.Content
              align="start"
              alignOffset={0}
              asChild
              side="bottom"
              sideOffset={8}
            >
              <motion.div
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="z-50 min-w-[180px] overflow-hidden border border-border/20 bg-popover/95 p-1.5 shadow-md backdrop-blur-sm"
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{
                  duration: 0.2,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                <UploadFileButton />
                <ScreenshotButton />
                <ManageToolsButton />
              </motion.div>
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        )}
      </AnimatePresence>
    </DropdownMenuPrimitive.Root>
  );
}
