"use client";

import {
  CaretLeft,
  CaretRight,
  Sidebar as SidebarIcon,
} from "@phosphor-icons/react";
import { Button } from "@spots/design/components/ui/button";
import { cn } from "@spots/design/lib/utils";
import { useAtom } from "jotai";
import type React from "react";

import { sidebarOpenAtom } from "@/atoms/layout";

export function SidebarToggle(): React.ReactElement {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="fixed top-3 left-2 z-[400]">
      <Button
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        className="group flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition-all duration-[0ms] hover:bg-muted/80 hover:text-foreground hover:transition-duration-[150ms] active:bg-muted"
        onClick={toggle}
        variant="ghost"
      >
        {/* Different icon behavior for mobile vs desktop with smooth transitions */}
        <span className="relative flex h-5 w-5 items-center justify-center">
          {/* Sidebar icon - visible on desktop or mobile closed */}
          <SidebarIcon 
            className={cn(
              "absolute h-5 w-5 transition-opacity duration-200",
              isOpen ? "opacity-0" : "opacity-100 group-hover:opacity-0"
            )} 
            weight="duotone"
          />
          
          {/* Left Caret - for closing sidebar */}
          <CaretLeft 
            className={cn(
              "absolute h-5 w-5 transition-opacity duration-200",
              isOpen
                ? "opacity-100" // Always visible when open
                : "opacity-0" // Hidden when sidebar is closed
            )} 
            weight="duotone"
          />
          
          {/* Right Caret - for opening sidebar */}
          <CaretRight
            className={cn(
              "absolute h-5 w-5 transition-opacity duration-200",
              isOpen
                ? "opacity-0" // Hidden when sidebar is open
                : "opacity-0 group-hover:opacity-100" // Show on hover when closed
            )}
            weight="duotone"
          />
        </span>
      </Button>
    </div>
  );
}
