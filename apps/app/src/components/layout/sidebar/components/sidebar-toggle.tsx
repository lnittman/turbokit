"use client";

import { 
  CaretLeft,
  CaretRight,
  Sidebar as SidebarIcon
} from '@phosphor-icons/react';
import { useAtom } from 'jotai';
import type React from 'react';

import { Button } from '@repo/design/components/ui/button';
import { cn } from '@repo/design/lib/utils';

import { sidebarOpenAtom } from '@/atoms/layout';

export function SidebarToggle(): React.ReactElement {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  
  const toggle = () => setIsOpen(!isOpen);
  
  return (
    <div className="fixed top-3 left-2 z-[400]">
      <Button
        onClick={toggle}
        className="h-8 w-8 flex items-center justify-center rounded-sm hover:bg-muted/80 active:bg-muted group text-muted-foreground hover:text-foreground transition-all duration-[0ms] hover:transition-duration-[150ms]"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        variant="ghost"
      >
        {/* Different icon behavior for mobile vs desktop with smooth transitions */}
        <span className="relative flex items-center justify-center w-5 h-5">
          {/* Sidebar icon - visible on desktop or mobile closed */}
          <SidebarIcon 
            weight="duotone" 
            className={cn(
              "h-5 w-5 absolute transition-opacity duration-200",
              isOpen ? "opacity-0" : "opacity-100 group-hover:opacity-0"
            )}
          />
          
          {/* Left Caret - for closing sidebar */}
          <CaretLeft 
            weight="duotone" 
            className={cn(
              "h-5 w-5 absolute transition-opacity duration-200",
              isOpen
                ? "opacity-100" // Always visible when open
                : "opacity-0" // Hidden when sidebar is closed
            )}
          />
          
          {/* Right Caret - for opening sidebar */}
          <CaretRight 
            weight="duotone" 
            className={cn(
              "h-5 w-5 absolute transition-opacity duration-200",
              !isOpen
                ? "opacity-0 group-hover:opacity-100" // Only visible on hover when closed
                : "opacity-0" // Hidden when sidebar is open
            )}
          />
        </span>
      </Button>
    </div>
  );
} 
