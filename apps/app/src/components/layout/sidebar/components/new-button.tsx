"use client";

import { Plus } from "@phosphor-icons/react";
import { useMediaQuery } from "@spots/design/hooks/use-media-query";
import { cn } from "@spots/design/lib/utils";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";

import { sidebarOpenAtom } from "@/atoms/layout";

export function NewButton(): React.ReactElement {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const toggle = () => setIsOpen(!isOpen);
  const pathname = usePathname();

  const handleClick = () => {
    if (!isDesktop) toggle();
  };

  return (
    <div className="px-2" style={{ width: 276 }}>
      <motion.div
        animate={{
          opacity: isDesktop ? 1 : isOpen ? 1 : 0,
          pointerEvents: isDesktop || isOpen ? "auto" : "none",
        }}
        initial={false}
        transition={{ duration: 0.3 }}
      >
        <Link
          className={cn(
            "relative flex h-8 items-center gap-3 rounded-sm px-2",
            "group transition-all duration-[0ms] hover:transition-duration-[150ms]",
            "hover:bg-muted/80 active:bg-muted",
            "text-muted-foreground group-hover:text-foreground",
            pathname === "/" ? "bg-muted text-foreground" : ""
          )}
          href="/"
          onClick={handleClick}
        >
          <div className="flex flex-none items-center justify-center">
            <Plus className="h-4 w-4" weight="duotone" />
          </div>

          {isOpen && (
            <span className="whitespace-nowrap font-mono text-sm">
              create new
            </span>
          )}
        </Link>
      </motion.div>
    </div>
  );
}
