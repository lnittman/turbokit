"use client";

import { useEffect, useState } from 'react';
import type React from 'react';

import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { useIsMobile } from '@repo/design/hooks/use-is-mobile';

import { sidebarOpenAtom } from '@/atoms/layout';

import { NewButton } from './components/new-button';
import { SidebarToggle } from './components/sidebar-toggle';
import { SidebarHeader } from './components/sidebar-header';
import { SidebarContent } from './components/sidebar-content';
import { UserMenu } from './components/user-menu';
import { CommandMenuModal } from '../modal/command/menu';

export function Sidebar(): React.ReactElement {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);

  // Track if initial load is complete to prevent animations on first render
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Persist sidebar state for desktop and ensure mobile starts closed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // On initial load
      if (!isMobile) {
        // For desktop: retrieve from localStorage or default to open
        const savedState = localStorage.getItem('sidebarOpen');
        if (savedState !== null) {
          setIsOpen(savedState === 'true');
        }
      } else {
        // For mobile: always start closed
        setIsOpen(false);
      }
      
      // Mark initial load as complete after a short delay to ensure state is applied
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, setIsOpen]);
  
  // Save sidebar state to localStorage when it changes (desktop only)
  useEffect(() => {
    if (initialLoadComplete && !isMobile && typeof window !== 'undefined') {
      localStorage.setItem('sidebarOpen', isOpen.toString());
    }
  }, [isOpen, isMobile, initialLoadComplete]);

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {isOpen && isMobile && (
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Command menu (domain-agnostic) */}
      <CommandMenuModal />

      {/* Sidebar toggle button */}
      <SidebarToggle />

      {/* Unified sidebar - adapts between mobile and desktop */}
      <motion.div
        className="fixed top-0 bottom-0 left-0 border-r border-border z-200 flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--sidebar)' }}
        initial={{ 
          width: isMobile ? (isOpen ? 280 : 48) : 0,
          borderRightWidth: isMobile || isOpen ? "1px" : "0px"
        }}
        animate={{
          width: isMobile ? (isOpen ? 280 : 48) : (isOpen ? 280 : 0),
          borderRightWidth: isMobile || isOpen ? "1px" : "0px",
          transition: {
            duration: initialLoadComplete ? 0.3 : 0,
            ease: [0.32, 0.72, 0, 1]
          }
        }}
      >
        <div className="flex flex-col h-full">
          {/* Top space with search button */}
          <SidebarHeader />
          
          {/* New button */}
          <NewButton />
          
          {/* Content area with Projects and Chats */}
          <SidebarContent />

          {/* User menu at the bottom */}
          <div className="pt-2 pb-2 px-2">
            <UserMenu />
          </div>
        </div>
      </motion.div>
    </>
  );
} 
