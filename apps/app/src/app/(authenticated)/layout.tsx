"use client";

import React from "react";

import { useAtom } from "jotai";
import { useIsMobile } from "@repo/design/hooks/use-is-mobile";
import { cn } from "@repo/design/lib/utils";

import { Sidebar } from '@/components/layout/sidebar/Sidebar';
import { CommandMenuModal } from '@/components/layout/modal/command/menu';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard';
import { sidebarCollapsedAtom } from '@/atoms/layout';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps): React.ReactElement | null {
  const { isMobile, ready } = useIsMobile();
  const [isCollapsed] = useAtom(sidebarCollapsedAtom);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  if (!ready) return null;

  // For normal routes, render the full layout with sidebar
  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />

      <main className={cn(
        "transition-all duration-300 ease-in-out",
        isMobile ? "" : isCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {children}
      </main>

      {/* Portal components rendered at the root layout level for proper stacking context */}
      <CommandMenuModal />
    </div>
  );
} 
