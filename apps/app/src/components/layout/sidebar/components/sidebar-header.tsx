"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import type React from "react";
import { commandMenuOpenAtom, sidebarOpenAtom } from "@/atoms/layout";

export function SidebarHeader(): React.ReactElement {
  const [isOpen] = useAtom(sidebarOpenAtom);
  const [, setCommandMenuOpen] = useAtom(commandMenuOpenAtom);

  return (
    <div
      className="relative flex h-14 items-center justify-between px-2"
      style={{ width: 276 }}
    >
      {/* Button spacer to maintain layout when toggle button is outside */}
      <div className="h-8 w-8" />

      {/* Search button - always in DOM but fades in/out */}
      <motion.button
        animate={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        aria-label="Search"
        className="group flex h-8 w-8 items-center justify-center rounded-sm transition-all duration-[0ms] hover:bg-muted/80 hover:transition-duration-[150ms] active:bg-muted"
        initial={false}
        onClick={() => setCommandMenuOpen(true)}
        transition={{ duration: 0.2 }}
      >
        <MagnifyingGlass
          className="h-5 w-5 text-muted-foreground transition-all duration-[0ms] group-hover:text-foreground group-hover:transition-duration-[150ms]"
          weight="duotone"
        />
      </motion.button>
    </div>
  );
}
