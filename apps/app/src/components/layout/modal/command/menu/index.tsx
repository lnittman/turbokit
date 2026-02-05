"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

import {
  MagnifyingGlass as Search,
  Sparkle as Sparkles,
  GearSix as Settings,
  User,
  FileText,
  Bell,
} from "@phosphor-icons/react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui-components/react/dialog";

import { commandModalAtom } from "@/atoms/layout";

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category?: string;
}

// Default command items
const defaultCommands: CommandItem[] = [
  {
    id: "search",
    title: "Search",
    description: "Search across all content",
    icon: <Search className="w-4 h-4" />,
    shortcut: "⌘K",
    action: () => {},
    category: "General",
  },
  {
    id: "create",
    title: "Create New",
    description: "Create a new item",
    icon: <Sparkles className="w-4 h-4" />,
    shortcut: "⌘N",
    action: () => {},
    category: "Actions",
  },
  {
    id: "settings",
    title: "Settings",
    description: "Open settings",
    icon: <Settings className="w-4 h-4" />,
    shortcut: "⌘,",
    action: () => {},
    category: "Navigation",
  },
  {
    id: "profile",
    title: "Profile",
    description: "View your profile",
    icon: <User className="w-4 h-4" />,
    action: () => {},
    category: "Navigation",
  },
  {
    id: "docs",
    title: "Documentation",
    description: "View documentation",
    icon: <FileText className="w-4 h-4" />,
    action: () => window.open("/docs", "_blank"),
    category: "Help",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "View notifications",
    icon: <Bell className="w-4 h-4" />,
    action: () => {},
    category: "Navigation",
  },
];

export function CommandMenuModal(): React.ReactElement {
  const [commandModal, setCommandModal] = useAtom(commandModalAtom);
  const isOpen = commandModal.open;
  const setIsOpen = useCallback(
    (open: boolean) => {
      setCommandModal((prev) => {
        if (prev.open === open) return prev;
        return open
          ? { ...prev, open: true }
          : { open: false, activeItemId: null, searchQuery: "" };
      });
    },
    [setCommandModal]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filteredCommands = useMemo(
    () =>
      defaultCommands.filter(
        (command) =>
          command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          command.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          command.category?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const groupedCommands = useMemo(
    () =>
      filteredCommands.reduce(
        (acc, command) => {
          const category = command.category || "Other";
          if (!acc[category]) acc[category] = [];
          acc[category].push(command);
          return acc;
        },
        {} as Record<string, CommandItem[]>
      ),
    [filteredCommands]
  );

  const executeCommand = useCallback(
    (command: CommandItem) => {
      command.action();
      setIsOpen(false);
    },
    [setIsOpen]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-command-item]");
    const selected = items[selectedIndex];
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
      }
    },
    [selectedIndex, filteredCommands, executeCommand]
  );

  // Reset state when opened
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
        <Dialog.Popup
          className="tk-cmd-popup"
          onKeyDown={handleKeyDown}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>

          {/* Search input */}
          <div className="tk-cmd-search">
            <Search className="tk-cmd-search-icon" />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search or run a command…"
              className="tk-cmd-input"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="tk-cmd-kbd">esc</kbd>
          </div>

          {/* Command list */}
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
                      onClick={() => executeCommand(command)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className="tk-cmd-item"
                    >
                      {command.icon && (
                        <div className="tk-cmd-item-icon">{command.icon}</div>
                      )}
                      <div className="tk-cmd-item-content">
                        <span className="tk-cmd-item-title">{command.title}</span>
                        {command.description && (
                          <span className="tk-cmd-item-desc">
                            {command.description}
                          </span>
                        )}
                      </div>
                      {command.shortcut && (
                        <kbd className="tk-cmd-kbd-sm">{command.shortcut}</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="tk-cmd-empty">
                No commands found for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>

          {/* Footer */}
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
            <span className="tk-cmd-footer-count">
              {filteredCommands.length} results
            </span>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
