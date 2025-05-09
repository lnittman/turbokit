"use client";

import React, { useState } from "react";

import { SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import { SignOut, CaretDown, CaretUp, Gear, Moon, Sun, Desktop } from "@phosphor-icons/react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@repo/design/components/ui/tabs";
import { useMediaQuery } from "@repo/design/hooks/use-media-query";
import { cn } from "@repo/design/lib/utils";

import { themeAtom } from "@/atoms/theme";
import { sidebarOpenAtom } from "@/atoms/layout";

export function UserMenu() {
  const { isLoaded } = useAuth();
  const { setTheme: setNextTheme } = useTheme();
  const { user } = useUser();

  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [isOpen] = useAtom(sidebarOpenAtom);
  const [theme, setTheme] = useAtom(themeAtom);

  const [menuOpen, setMenuOpen] = useState(false);

  // Get user initials for avatar fallback
  const initials = user?.fullName
    ? user.fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
    : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || "?";

  const handleThemeChange = (value: string) => {
    // Update both state stores
    setTheme(value as 'light' | 'dark' | 'system');
    setNextTheme(value);
  };

  // Navigate to settings page
  const handleOpenSettings = () => {
    setMenuOpen(false);
    router.push('/settings');
  };

  if (!isLoaded) return null;

  return (
    <motion.div 
      initial={false}
      animate={{ 
        opacity: isDesktop ? 1 : (isOpen ? 1 : 0),
        pointerEvents: isDesktop || isOpen ? 'auto' : 'none'
      }}
      transition={{ duration: 0.3 }}
    >
      <DropdownMenuPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuPrimitive.Trigger asChild>
          <button
            className={cn(
              "h-8 flex items-center transition-colors w-full relative group",
              isOpen && "hover:bg-accent/50",
              menuOpen && isOpen && "bg-accent/40"
            )}
            style={{ width: "260px" }}
          >
            <div className="w-8 flex-none flex items-center justify-center">
              <motion.div
                className={cn(
                  "h-8 w-8 bg-background text-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 border border-border/40 hover:border-border transition-all duration-150",
                )}
              >
                {initials}
              </motion.div>
            </div>
            
            <AnimatePresence>
                <div 
                style={{
                  opacity: isOpen ? 1 : 0,
                  transition: "opacity 0.15s ease-in-out"
                }}
                className={cn(
                  "opacity-0 transition-opacity duration-150",
                  isOpen && "opacity-100"
                )}>
                  <motion.span
                    className={cn(
                      "text-sm pl-1 text-muted-foreground group-hover:text-foreground transition-colors duration-150",
                      menuOpen && "text-foreground"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                  >
                    {user?.firstName || "User"}
                  </motion.span>
                  
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <AnimatePresence mode="wait" initial={false}>
                      {menuOpen ? (
                        <motion.div
                          key="up"
                          initial={{ opacity: 0, y: 2 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -2 }}
                          transition={{ duration: 0.15 }}
                        >
                          <CaretUp weight="duotone" className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="down"
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 2 }}
                          transition={{ duration: 0.15 }}
                        >
                          <CaretDown weight="duotone" className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
            </AnimatePresence>
          </button>
        </DropdownMenuPrimitive.Trigger>

        <AnimatePresence>
          {menuOpen && (
            <DropdownMenuPrimitive.Portal forceMount>
              <DropdownMenuPrimitive.Content
                asChild
                className={cn(
                  "z-[500] min-w-[262px] overflow-hidden border border-border/20 bg-popover/95 backdrop-blur-sm p-1.5 shadow-xl",
                  "data-[side=bottom]:origin-top data-[side=top]:origin-bottom"
                )}
                align={isOpen ? "center" : "start"}
                side="top"
                sideOffset={8}
              >
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.8
                  }}
                >
                  <div className="px-2 py-1.5 mb-1 border-b border-slate-500/10">
                    <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user?.emailAddresses?.[0]?.emailAddress}</p>
                  </div>

                  <DropdownMenuPrimitive.Item
                    className={cn(
                      "relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none transition-colors duration-300 text-foreground/90 focus:text-foreground",
                      "focus:bg-accent focus:text-accent-foreground mt-1 transition-colors duration-300",
                      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    )}
                    onClick={handleOpenSettings}
                  >
                    <Gear className="w-4 h-4 mr-2" weight="duotone" />
                    <span>settings</span>
                  </DropdownMenuPrimitive.Item>

                  {/* Divider before theme switcher */}
                  <div className="my-1.5 border-t border-slate-500/10"></div>

                  {/* Theme selector using Tabs component - no title */}
                  <Tabs
                    defaultValue={theme}
                    value={theme}
                    onValueChange={handleThemeChange}
                    className="flex flex-col"
                  >
                    <TabsList className="bg-accent/30 w-full h-9 p-1 grid grid-cols-3 gap-1 relative">
                      {/* Tab triggers with static icons (no animations) */}
                      <TabsTrigger
                        value="light"
                        className="h-full w-full transition-all duration-300 hover:bg-background/60 focus:outline-none flex items-center justify-center z-10"
                      >
                        <Sun
                          weight="duotone"
                          className={cn(
                            "h-4 w-4 transition-colors duration-300",
                            theme === 'light' ? "text-foreground" : "text-muted-foreground"
                          )}
                        />
                      </TabsTrigger>
                      <TabsTrigger
                        value="dark"
                        className="h-full w-full transition-all duration-300 hover:bg-background/60 focus:outline-none flex items-center justify-center z-10"
                      >
                        <Moon
                          weight="duotone"
                          className={cn(
                            "h-4 w-4 transition-colors duration-300",
                            theme === 'dark' ? "text-foreground" : "text-muted-foreground"
                          )}
                        />
                      </TabsTrigger>
                      <TabsTrigger
                        value="system"
                        className="h-full w-full transition-all duration-300 hover:bg-background/60 focus:outline-none flex items-center justify-center z-10"
                      >
                        <Desktop
                          weight="duotone"
                          className={cn(
                            "h-4 w-4 transition-colors duration-300",
                            theme === 'system' ? "text-foreground" : "text-muted-foreground"
                          )}
                        />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Divider after theme switcher */}
                  <div className="my-1.5 border-t border-slate-500/10"></div>

                  <SignOutButton>
                    <DropdownMenuPrimitive.Item
                      className={cn(
                        "relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none transition-colors duration-300",
                        "focus:bg-red-500/10 focus:text-red-500 mt-1 text-red-500/90",
                        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      )}
                    >
                      <SignOut className="w-4 h-4 mr-2" weight="duotone" />
                      <span>log out</span>
                    </DropdownMenuPrimitive.Item>
                  </SignOutButton>
                </motion.div>
              </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
          )}
        </AnimatePresence>
      </DropdownMenuPrimitive.Root>
    </motion.div>
  );
} 