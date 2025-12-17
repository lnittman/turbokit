"use client";

import {
  Bell,
  FileText,
  MagnifyingGlass as Search,
  GearSix as Settings,
  Sparkle as Sparkles,
  User,
} from "@phosphor-icons/react";
import { Dialog, DialogContent } from "@spots/design/components/ui/dialog";
import { Input } from "@spots/design/components/ui/input";
import { useMediaQuery } from "@spots/design/hooks/use-media-query";
import { cn } from "@spots/design/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { commandMenuOpenAtom } from "@/atoms/layout";

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category?: string;
}

// Default command items - replace with your domain-specific items
const defaultCommands: CommandItem[] = [
  {
    id: "search",
    title: "Search",
    description: "Search across all content",
    icon: <Search className="h-4 w-4" />,
    shortcut: "⌘K",
    action: () => console.log("Search"),
    category: "General",
  },
  {
    id: "create",
    title: "Create New",
    description: "Create a new item",
    icon: <Sparkles className="h-4 w-4" />,
    shortcut: "⌘N",
    action: () => console.log("Create"),
    category: "Actions",
  },
  {
    id: "settings",
    title: "Settings",
    description: "Open settings",
    icon: <Settings className="h-4 w-4" />,
    shortcut: "⌘,",
    action: () => console.log("Settings"),
    category: "Navigation",
  },
  {
    id: "profile",
    title: "Profile",
    description: "View your profile",
    icon: <User className="h-4 w-4" />,
    action: () => console.log("Profile"),
    category: "Navigation",
  },
  {
    id: "docs",
    title: "Documentation",
    description: "View documentation",
    icon: <FileText className="h-4 w-4" />,
    action: () => window.open("/docs", "_blank"),
    category: "Help",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "View notifications",
    icon: <Bell className="h-4 w-4" />,
    action: () => console.log("Notifications"),
    category: "Navigation",
  },
];

export function CommandMenuModal(): React.ReactElement {
  const [isOpen, setIsOpen] = useAtom(commandMenuOpenAtom);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter commands based on search query
  const filteredCommands = defaultCommands.filter(
    (command) =>
      command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group commands by category
  const groupedCommands = filteredCommands.reduce(
    (acc, command) => {
      const category = command.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(command);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setIsOpen(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, setIsOpen]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div className="flex h-[500px] flex-col">
          {/* Search Header */}
          <div className="border-border border-b p-4">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="h-12 border-0 pr-4 pl-10 text-base focus-visible:ring-0"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search..."
                ref={inputRef}
                value={searchQuery}
              />
            </div>
          </div>

          {/* Command List */}
          <div className="flex-1 overflow-y-auto p-2">
            {Object.entries(groupedCommands).map(([category, commands]) => (
              <div className="mb-4" key={category}>
                <div className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
                  {category}
                </div>
                {commands.map((command, index) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <motion.button
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                        isSelected ? "bg-accent" : "hover:bg-accent/50"
                      )}
                      initial={{ opacity: 0, y: -10 }}
                      key={command.id}
                      onClick={() => {
                        command.action();
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      transition={{ delay: index * 0.02 }}
                    >
                      {command.icon && (
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border bg-background">
                          {command.icon}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">
                          {command.title}
                        </div>
                        {command.description && (
                          <div className="truncate text-muted-foreground text-xs">
                            {command.description}
                          </div>
                        )}
                      </div>
                      {command.shortcut && (
                        <kbd className="rounded border border-border bg-background px-2 py-0.5 text-xs">
                          {command.shortcut}
                        </kbd>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No commands found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-border border-t px-4 py-2 text-muted-foreground text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-xs">
                  ↑
                </kbd>
                <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-xs">
                  ↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-xs">
                  ⏎
                </kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-xs">
                  ESC
                </kbd>
                Close
              </span>
            </div>
            <div>{filteredCommands.length} results</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
