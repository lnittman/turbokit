"use client";

import React from "react";

import { Sidebar } from '@/components/layout/sidebar/Sidebar';
import { CommandMenuModal } from '@/components/layout/modal/command/menu';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  overlay: React.ReactNode;
}

export default function AuthenticatedLayout({ children, overlay }: AuthenticatedLayoutProps): React.ReactElement {
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
      {overlay}
      <CommandMenuModal />
    </div>
  );
}
