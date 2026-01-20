"use client";

import { Plus } from '@phosphor-icons/react';
import type React from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { cn } from '@repo/design/lib/utils';

import { sidebarOpenAtom } from '@/atoms/layout';

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
        initial={false}
        animate={{
          opacity: isDesktop ? 1 : (isOpen ? 1 : 0),
          pointerEvents: isDesktop || isOpen ? 'auto' : 'none'
        }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/"
          className={cn(
            "h-8 flex items-center gap-3 rounded-sm px-2 relative",
            "group transition-all duration-[0ms] hover:transition-duration-[150ms]",
            "hover:bg-muted/80 active:bg-muted",
            "text-muted-foreground group-hover:text-foreground",
            pathname === "/" ? "bg-muted text-foreground" : ""
          )}
          onClick={handleClick}
        >
          <div className="flex-none flex items-center justify-center">
            <Plus weight="duotone" className="h-4 w-4" />
          </div>

          {isOpen && (
            <span className="text-sm font-mono whitespace-nowrap">
              create new
            </span>
          )}
        </Link>
      </motion.div>
    </div>
  );
} 
