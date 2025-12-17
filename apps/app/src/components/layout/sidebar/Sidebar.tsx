"use client";

import { House, Palette, Plus } from "@phosphor-icons/react";
import { useIsMobile } from "@spots/design/hooks/use-is-mobile";
import { cn } from "@spots/design/lib/utils";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect } from "react";

import { sidebarCollapsedAtom, sidebarOpenAtom } from "@/atoms/layout";

import { UserMenu } from "./components/user-menu";

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
    { href: "/", label: "Home", icon: House },
    { href: "/presets", label: "Presets", icon: Palette },
    { href: "/create", label: "Create", icon: Plus },
  ];

  // Desktop sidebar - collapsible (64px collapsed, 256px expanded)
  if (!isMobile) {
    return (
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-[200] flex flex-col border-border border-r bg-muted/50 backdrop-blur-xl transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo section with toggle */}
        <div className="flex h-16 items-center justify-between px-4">
          <span
            className={cn(
              "font-medium font-mono text-sm transition-opacity duration-300",
              isCollapsed && "w-0 overflow-hidden opacity-0"
            )}
          >
            TurboKit
          </span>
          <button
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-[0ms] hover:bg-accent/10 hover:transition-duration-[150ms] active:scale-[0.98]",
              isCollapsed && "mx-auto"
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <svg
              className="h-5 w-5 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              style={{
                transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
              }}
              viewBox="0 0 24 24"
            >
              <path
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-sm",
                  "transition-all duration-[0ms] hover:transition-duration-[150ms]",
                  "hover:bg-accent/10 active:scale-[0.98]",
                  isActive
                    ? "bg-accent/20 text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  isCollapsed && "justify-center px-0"
                )}
                href={item.href}
                key={item.href}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className="h-5 w-5 flex-shrink-0"
                  weight={isActive ? "fill" : "regular"}
                />
                <span
                  className={cn(
                    "transition-all duration-300",
                    isCollapsed && "w-0 overflow-hidden opacity-0"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-border border-t p-3">
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
        className="fixed top-4 left-4 z-[300] flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <>
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[250] bg-background/80 backdrop-blur-sm lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-x-4 top-20 bottom-4 z-[260] flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl lg:hidden"
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Navigation */}
            <nav className="flex-1 space-y-2 px-4 py-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 font-mono text-base",
                      "transition-all duration-[0ms] hover:transition-duration-[150ms]",
                      "hover:bg-accent/10 active:scale-[0.98]",
                      isActive
                        ? "bg-accent/20 text-foreground"
                        : "text-muted-foreground"
                    )}
                    href={item.href}
                    key={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon
                      className="h-6 w-6"
                      weight={isActive ? "fill" : "regular"}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="border-border border-t p-4">
              <UserMenu />
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
