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
  overlay: React.ReactNode;
}

export default function AuthenticatedLayout({ children, overlay }: AuthenticatedLayoutProps): React.ReactElement | null {
  const { isMobile, ready } = useIsMobile();
  const [isCollapsed] = useAtom(sidebarCollapsedAtom);

  useKeyboardShortcuts();

  if (!ready) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />

      <main className={cn(
        "transition-all duration-300 ease-in-out",
        isMobile ? "" : isCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {children}
      </main>

      {/* Overlay slot (parallel route) */}
      {overlay}

      {/* Portal components */}
      <CommandMenuModal />
    </div>
  );
}
