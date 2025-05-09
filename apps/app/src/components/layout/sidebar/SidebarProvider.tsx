"use client";

import { useAtom } from "jotai";
import { useMediaQuery } from "@repo/design/hooks/use-media-query";
import { useEffect, useState } from "react";
import { sidebarOpenAtom } from "@/src/store/ui/layout";

// Simple utility functions to use the sidebar state
export function useSidebar() {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // State to track if initial setup is done to prevent flicker
  const [isInitialised, setIsInitialised] = useState(false);

  useEffect(() => {
    // Only run this effect once after initial mount and media query is stable
    if (!isInitialised) {
      if (!isDesktop) {
        // Ensure sidebar is closed on mobile initially
        setIsOpen(false);
      } else {
        // On desktop, check localStorage or default to closed
        const storedValue = localStorage.getItem('sidebarOpenAtom');
        if (storedValue === null) { // Only force closed if no stored state exists
           setIsOpen(false); 
        }
      }
      setIsInitialised(true);
    }
  }, [isDesktop, setIsOpen, isInitialised]);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  // Render null until initialised to prevent flash of incorrect state
  if (!isInitialised && !isDesktop) {
    return { isOpen: false, toggle: () => {}, setIsOpen, isInitialised: false };
  }

  return { isOpen, toggle, setIsOpen, isInitialised: true };
} 