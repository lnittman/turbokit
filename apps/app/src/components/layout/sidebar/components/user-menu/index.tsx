"use client";

import { SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import {
  CaretDown,
  CaretUp,
  Desktop,
  Gear,
  Moon,
  SignOut,
  Sun,
} from "@phosphor-icons/react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@spots/design/components/ui/tabs";
import { useMediaQuery } from "@spots/design/hooks/use-media-query";
import { cn } from "@spots/design/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type React from "react";
import { useState } from "react";
import { sidebarOpenAtom } from "@/atoms/layout";
import { themeAtom } from "@/atoms/theme";

export function UserMenu(): React.ReactElement | null {
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!isClerkConfigured) return null;

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
    setTheme(value as "light" | "dark" | "system");
    setNextTheme(value);
  };

  // Navigate to settings page
  const handleOpenSettings = () => {
    setMenuOpen(false);
    router.push("/settings");
  };

  if (!isLoaded) return null;

  return (
    <motion.div
      animate={{
        opacity: isDesktop ? 1 : isOpen ? 1 : 0,
        pointerEvents: isDesktop || isOpen ? "auto" : "none",
      }}
      initial={false}
      transition={{ duration: 0.3 }}
    >
      <DropdownMenuPrimitive.Root onOpenChange={setMenuOpen} open={menuOpen}>
        <DropdownMenuPrimitive.Trigger asChild>
          <button
            className={cn(
              "group relative flex h-8 w-full items-center transition-colors",
              isOpen && "hover:bg-accent/50",
              menuOpen && isOpen && "bg-accent/40"
            )}
            style={{ width: "260px" }}
          >
            <div className="flex w-8 flex-none items-center justify-center">
              <motion.div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center border border-border/40 bg-background font-medium text-foreground text-xs transition-all duration-150 hover:border-border"
                )}
              >
                {initials}
              </motion.div>
            </div>

            <AnimatePresence>
              <div
                className={cn(
                  "opacity-0 transition-opacity duration-150",
                  isOpen && "opacity-100"
                )}
                style={{
                  opacity: isOpen ? 1 : 0,
                  transition: "opacity 0.15s ease-in-out",
                }}
              >
                <motion.span
                  animate={{ opacity: 1 }}
                  className={cn(
                    "pl-1 text-muted-foreground text-sm transition-colors duration-150 group-hover:text-foreground",
                    menuOpen && "text-foreground"
                  )}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                >
                  {user?.firstName || "User"}
                </motion.span>

                <div className="-translate-y-1/2 absolute top-1/2 right-2">
                  <AnimatePresence initial={false} mode="wait">
                    {menuOpen ? (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        initial={{ opacity: 0, y: 2 }}
                        key="up"
                        transition={{ duration: 0.15 }}
                      >
                        <CaretUp
                          className="h-4 w-4 text-muted-foreground group-hover:text-foreground"
                          weight="duotone"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 2 }}
                        initial={{ opacity: 0, y: -2 }}
                        key="down"
                        transition={{ duration: 0.15 }}
                      >
                        <CaretDown
                          className="h-4 w-4 text-muted-foreground group-hover:text-foreground"
                          weight="duotone"
                        />
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
                align={isOpen ? "center" : "start"}
                asChild
                className={cn(
                  "z-[500] min-w-[262px] overflow-hidden border border-border/20 bg-popover/95 p-1.5 shadow-xl backdrop-blur-sm",
                  "data-[side=bottom]:origin-top data-[side=top]:origin-bottom"
                )}
                side="top"
                sideOffset={8}
              >
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  initial={{ opacity: 0, y: 8 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.8,
                  }}
                >
                  <div className="mb-1 border-slate-500/10 border-b px-2 py-1.5">
                    <p className="font-medium text-foreground text-sm">
                      {user?.fullName}
                    </p>
                    <p className="mt-0.5 text-muted-foreground text-xs">
                      {user?.emailAddresses?.[0]?.emailAddress}
                    </p>
                  </div>

                  <DropdownMenuPrimitive.Item
                    className={cn(
                      "relative flex cursor-pointer select-none items-center px-2 py-1.5 text-foreground/90 text-sm outline-none transition-colors duration-300 focus:text-foreground",
                      "mt-1 transition-colors duration-300 focus:bg-accent focus:text-accent-foreground",
                      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    )}
                    onClick={handleOpenSettings}
                  >
                    <Gear className="mr-2 h-4 w-4" weight="duotone" />
                    <span>settings</span>
                  </DropdownMenuPrimitive.Item>

                  {/* Divider before theme switcher */}
                  <div className="my-1.5 border-slate-500/10 border-t" />

                  {/* Theme selector using Tabs component - no title */}
                  <Tabs
                    className="flex flex-col"
                    defaultValue={theme}
                    onValueChange={handleThemeChange}
                    value={theme}
                  >
                    <TabsList className="relative grid h-9 w-full grid-cols-3 gap-1 bg-accent/30 p-1">
                      {/* Tab triggers with static icons (no animations) */}
                      <TabsTrigger
                        className="z-10 flex h-full w-full items-center justify-center transition-all duration-300 hover:bg-background/60 focus:outline-none"
                        value="light"
                      >
                        <Sun
                          className={cn(
                            "h-4 w-4 transition-colors duration-300",
                            theme === "light"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                          weight="duotone"
                        />
                      </TabsTrigger>
                      <TabsTrigger
                        className="z-10 flex h-full w-full items-center justify-center transition-all duration-300 hover:bg-background/60 focus:outline-none"
                        value="dark"
                      >
                        <Moon
                          className={cn(
                            "h-4 w-4 transition-colors duration-300",
                            theme === "dark"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                          weight="duotone"
                        />
                      </TabsTrigger>
                      <TabsTrigger
                        className="z-10 flex h-full w-full items-center justify-center transition-all duration-300 hover:bg-background/60 focus:outline-none"
                        value="system"
                      >
                        <Desktop
                          className={cn(
                            "h-4 w-4 transition-colors duration-300",
                            theme === "system"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                          weight="duotone"
                        />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Divider after theme switcher */}
                  <div className="my-1.5 border-slate-500/10 border-t" />

                  <SignOutButton>
                    <DropdownMenuPrimitive.Item
                      className={cn(
                        "relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none transition-colors duration-300",
                        "mt-1 text-red-500/90 focus:bg-red-500/10 focus:text-red-500",
                        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      )}
                    >
                      <SignOut className="mr-2 h-4 w-4" weight="duotone" />
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
