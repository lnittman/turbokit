"use client";

import React from "react";

import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { useIsMobile } from "@repo/design/hooks/use-is-mobile";

import { sidebarOpenAtom } from '@/atoms/layout';
import { Sidebar } from '@/components/layout/sidebar/Sidebar';
import { CommandMenuModal } from '@/components/layout/modal/command/menu';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps): React.ReactElement | null {
  const { isMobile, ready } = useIsMobile();

  const [isOpen] = useAtom(sidebarOpenAtom);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  if (!ready) return null;

  // For normal routes, render the full layout with sidebar
  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />

      <motion.main
        className="flex-1"
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : (isOpen ? 280 : 48)
        }}
        transition={{
          duration: 0.3,
          ease: [0.32, 0.72, 0, 1]
        }}
      >
        {children}
      </motion.main>

      {/* Portal components rendered at the root layout level for proper stacking context */}
      <CommandMenuModal />
    </div>
  );
} 
