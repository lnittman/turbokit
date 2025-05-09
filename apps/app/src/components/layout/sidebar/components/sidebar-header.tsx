"use client";

import { MagnifyingGlass } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { commandMenuOpenAtom } from '@/atoms/layout';
import { sidebarOpenAtom } from '@/atoms/layout';

export function SidebarHeader() {
  const [isOpen] = useAtom(sidebarOpenAtom);
  const [, setCommandMenuOpen] = useAtom(commandMenuOpenAtom);

  return (
    <div className="h-14 relative flex justify-between items-center px-2" style={{ width: 276 }}>
      {/* Button spacer to maintain layout when toggle button is outside */}
      <div className="h-8 w-8"></div>
      
      {/* Search button - always in DOM but fades in/out */}
      <motion.button
        onClick={() => setCommandMenuOpen(true)}
        className="h-8 w-8 flex items-center justify-center hover:bg-accent/60 active:bg-accent group transition-all duration-300"
        aria-label="Search"
        initial={false}
        animate={{ 
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none' 
        }}
        transition={{ duration: 0.3 }}
      >
        <MagnifyingGlass 
          weight="duotone" 
          className="h-5 w-5 text-muted-foreground group-hover:text-foreground/75 group-active:text-foreground transition-all duration-300" 
        />
      </motion.button>
    </div>
  );
} 