"use client";

import { Plus } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';

import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { cn } from '@repo/design/lib/utils';

import { sidebarOpenAtom } from '@/atoms/layout';

export function NewButton() {
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
            "h-8 flex items-center transition-colors duration-300 relative",
            "group hover:bg-accent/60 active:bg-accent", 
            "text-muted-foreground group-hover:text-foreground/80 group-active:text-foreground",
            pathname === "/" ? "bg-accent hover:bg-accent text-foreground" : ""
          )}
          onClick={handleClick}
          style={{
            width: isOpen ? 'auto' : '32px',
          }}
        >
          <div className="w-8 flex-none flex items-center justify-center">
            <Plus weight="duotone" className="h-4 w-4" />
          </div>

          <div className="h-full flex items-center justify-start">
            <span
              className={cn(
                "text-sm pl-1",
                "transition-all duration-300 ease-out opacity-0 whitespace-nowrap",
                isOpen && "opacity-100"
              )}
            >
              create new
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
} 