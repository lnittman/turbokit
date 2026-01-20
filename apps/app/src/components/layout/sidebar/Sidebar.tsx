"use client";

import { useEffect } from 'react';
import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Plus, Palette } from '@phosphor-icons/react';

import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { cn } from '@repo/design/lib/utils';

import { sidebarOpenAtom, sidebarCollapsedAtom } from '@/atoms/layout';

import { UserMenu } from './components/user-menu';

export function Sidebar(): React.ReactElement {
  const { isMobile } = useIsMobile();
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  const [isCollapsed, setIsCollapsed] = useAtom(sidebarCollapsedAtom);
  const pathname = usePathname();

  // Mobile always starts closed
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, setIsOpen]);

  const navItems = [
    { href: '/', label: 'Home', icon: House },
    { href: '/presets', label: 'Presets', icon: Palette },
    { href: '/create', label: 'Create', icon: Plus },
  ];

  // Desktop sidebar - collapsible (64px collapsed, 256px expanded)
  if (!isMobile) {
    return (
      <aside className={cn(
        "flex fixed left-0 top-0 bottom-0 bg-muted/50 backdrop-blur-xl border-r border-border flex-col z-[200] transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Logo section with toggle */}
        <div className="h-16 flex items-center justify-between px-4">
          <span className={cn(
            "font-mono text-sm font-medium transition-opacity duration-300",
            isCollapsed && "opacity-0 w-0 overflow-hidden"
          )}>
            TurboKit
          </span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent/10 transition-all duration-[0ms] hover:transition-duration-[150ms] active:scale-[0.98]",
              isCollapsed && "mx-auto"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className="h-5 w-5 transition-transform duration-300"
              style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-sm',
                  'transition-all duration-[0ms] hover:transition-duration-[150ms]',
                  'hover:bg-accent/10 active:scale-[0.98]',
                  isActive
                    ? 'bg-accent/20 text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                  isCollapsed && 'justify-center px-0'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon weight={isActive ? 'fill' : 'regular'} className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  "transition-all duration-300",
                  isCollapsed && "opacity-0 w-0 overflow-hidden"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3">
          <UserMenu collapsed={isCollapsed} />
        </div>
      </aside>
    );
  }

  // Mobile sidebar - full-screen overlay
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[300] h-10 w-10 flex items-center justify-center rounded-lg bg-background border border-border hover:bg-muted"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <>
          <motion.div
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[250]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            className="lg:hidden fixed inset-x-4 top-20 bottom-4 bg-background border border-border rounded-2xl z-[260] flex flex-col overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-base',
                      'transition-all duration-[0ms] hover:transition-duration-[150ms]',
                      'hover:bg-accent/10 active:scale-[0.98]',
                      isActive
                        ? 'bg-accent/20 text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    <Icon weight={isActive ? 'fill' : 'regular'} className="h-6 w-6" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="border-t border-border p-4">
              <UserMenu />
            </div>
          </motion.div>
        </>
      )}
    </>
  );
} 
