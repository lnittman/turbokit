"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Bell,
  FileText,
  GearSix,
  MagnifyingGlass as Search,
  Moon,
  Plus,
  Sidebar,
  SignOut,
  Sparkle,
  Sun,
  User,
} from "@phosphor-icons/react";
import { Dialog } from "@base-ui-components/react/dialog";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { commandModalAtom, sidebarCollapsedAtom } from "@/atoms/layout";
import { starterLayoutAtom } from "@/atoms/preferences";
import { turbokitConfig } from "@/config/turbokit.config";
import { STARTER_LAYOUT_LABELS, type StarterLayout } from "@/layouts";

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void | Promise<void>;
  category?: string;
}

export function CommandMenuModal(): React.ReactElement {
  const [commandModal, setCommandModal] = useAtom(commandModalAtom);
  const [layout, setLayout] = useAtom(starterLayoutAtom);
  const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
  const { resolvedTheme, setTheme } = useTheme();
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const isOpen = commandModal.open;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const setIsOpen = useCallback(
    (open: boolean) => {
      setCommandModal((previous) => {
        if (previous.open === open) return previous;
        return open
          ? { ...previous, open: true }
          : { open: false, activeItemId: null, searchQuery: "" };
      });
    },
    [setCommandModal]
  );

  const setLayoutAndNavigate = useCallback(
    (nextLayout: StarterLayout) => {
      setLayout(nextLayout);
      router.push("/");
    },
    [router, setLayout]
  );

  const commandItems = useMemo<CommandItem[]>(() => {
    const layoutCommands: CommandItem[] = turbokitConfig.layout.options.map((starter, index) => ({
      id: `layout-${starter}`,
      title: `open ${STARTER_LAYOUT_LABELS[starter]}`,
      description:
        starter === layout
          ? "currently active"
          : "switch starter surface",
      icon: <Sparkle className="h-4 w-4" />,
      shortcut: `⌘${index + 1}`,
      action: () => setLayoutAndNavigate(starter),
      category: "layouts",
    }));

    return [
      ...layoutCommands,
      {
        id: "nav-settings",
        title: "open settings",
        description: "account, appearance, notifications",
        icon: <GearSix className="h-4 w-4" />,
        shortcut: "⌘,",
        action: () => router.push("/settings"),
        category: "navigation",
      },
      {
        id: "nav-profile",
        title: "open profile",
        description: "view profile overlay",
        icon: <User className="h-4 w-4" />,
        action: () => router.push("/profile"),
        category: "navigation",
      },
      {
        id: "nav-notifications",
        title: "open notifications",
        description: "jump to notification preferences",
        icon: <Bell className="h-4 w-4" />,
        action: () => router.push("/settings?section=notifications"),
        category: "navigation",
      },
      {
        id: "nav-create",
        title: "create new",
        description: "open create overlay",
        icon: <Plus className="h-4 w-4" />,
        shortcut: "⌘N",
        action: () => router.push("/create"),
        category: "navigation",
      },
      {
        id: "action-theme",
        title: resolvedTheme === "dark" ? "switch to light" : "switch to dark",
        description: "toggle active theme",
        icon:
          resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          ),
        shortcut: "⌘T",
        action: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
        category: "actions",
      },
      {
        id: "action-sidebar",
        title: sidebarCollapsed ? "expand sidebar" : "collapse sidebar",
        description: "toggle shell navigation",
        icon: <Sidebar className="h-4 w-4" />,
        shortcut: "⌘B",
        action: () => setSidebarCollapsed((current) => !current),
        category: "actions",
      },
      {
        id: "action-signout",
        title: "sign out",
        description: "end current session",
        icon: <SignOut className="h-4 w-4" />,
        action: async () => {
          if (isClerkConfigured && typeof window !== "undefined" && (window as any).Clerk) {
            await (window as any).Clerk.signOut();
            return;
          }
          router.push("/signin");
        },
        category: "actions",
      },
      {
        id: "help-docs",
        title: "open documentation",
        description: "open docs in a new tab",
        icon: <FileText className="h-4 w-4" />,
        action: () => window.open("/docs", "_blank", "noopener,noreferrer"),
        category: "help",
      },
    ];
  }, [isClerkConfigured, layout, resolvedTheme, router, setLayoutAndNavigate, setSidebarCollapsed, setTheme, sidebarCollapsed]);

  const filteredCommands = useMemo(
    () =>
      commandItems.filter(
        (command) =>
          command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          command.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          command.category?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [commandItems, searchQuery]
  );

  const groupedCommands = useMemo(
    () =>
      filteredCommands.reduce(
        (accumulator, command) => {
          const category = command.category || "other";
          if (!accumulator[category]) accumulator[category] = [];
          accumulator[category].push(command);
          return accumulator;
        },
        {} as Record<string, CommandItem[]>
      ),
    [filteredCommands]
  );

  const executeCommand = useCallback(
    async (command: CommandItem) => {
      await command.action();
      setIsOpen(false);
    },
    [setIsOpen]
  );

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-command-item]");
    const selected = items[selectedIndex];
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((previous) =>
            previous < filteredCommands.length - 1 ? previous + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((previous) =>
            previous > 0 ? previous - 1 : filteredCommands.length - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (filteredCommands[selectedIndex]) {
            void executeCommand(filteredCommands[selectedIndex]);
          }
          break;
      }
    },
    [executeCommand, filteredCommands, selectedIndex]
  );

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="tk-cmd-backdrop" />
        <Dialog.Popup className="tk-cmd-popup" onKeyDown={handleKeyDown}>
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>

          <div className="tk-cmd-search">
            <Search className="tk-cmd-search-icon" />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSelectedIndex(0);
              }}
              placeholder="search or run a command…"
              className="tk-cmd-input"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="tk-cmd-kbd">esc</kbd>
          </div>

          <div ref={listRef} className="tk-cmd-list">
            {Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category} className="tk-cmd-group">
                <div className="tk-cmd-group-label">{category}</div>
                {commands.map((command) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const isHighlighted = globalIndex === selectedIndex;

                  return (
                    <button
                      key={command.id}
                      data-command-item
                      data-highlighted={isHighlighted || undefined}
                      onClick={() => {
                        void executeCommand(command);
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className="tk-cmd-item"
                    >
                      {command.icon && <div className="tk-cmd-item-icon">{command.icon}</div>}
                      <div className="tk-cmd-item-content">
                        <span className="tk-cmd-item-title">{command.title}</span>
                        {command.description && (
                          <span className="tk-cmd-item-desc">{command.description}</span>
                        )}
                      </div>
                      {command.shortcut && <kbd className="tk-cmd-kbd-sm">{command.shortcut}</kbd>}
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="tk-cmd-empty">No commands found for &ldquo;{searchQuery}&rdquo;</div>
            )}
          </div>

          <div className="tk-cmd-footer">
            <div className="tk-cmd-footer-hints">
              <span className="tk-cmd-footer-hint">
                <kbd className="tk-cmd-kbd-xs">↑</kbd>
                <kbd className="tk-cmd-kbd-xs">↓</kbd>
                navigate
              </span>
              <span className="tk-cmd-footer-hint">
                <kbd className="tk-cmd-kbd-xs">⏎</kbd>
                select
              </span>
              <span className="tk-cmd-footer-hint">
                <kbd className="tk-cmd-kbd-xs">esc</kbd>
                close
              </span>
            </div>
            <span className="tk-cmd-footer-count">{filteredCommands.length} results</span>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
