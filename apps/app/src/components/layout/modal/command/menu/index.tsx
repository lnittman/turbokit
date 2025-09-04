"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

import { MagnifyingGlass as Search, Sparkle as Sparkles, GearSix as Settings, User, FileText, Bell } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from 'jotai';
import { useRouter } from "next/navigation";

import { Dialog, DialogContent } from '@repo/design/components/ui/dialog';
import { Input } from '@repo/design/components/ui/input';
import { useMediaQuery } from "@repo/design/hooks/use-media-query";
import { cn } from "@repo/design/lib/utils";

import { commandMenuOpenAtom } from '@/atoms/layout';

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
    id: 'search',
    title: 'Search',
    description: 'Search across all content',
    icon: <Search className="w-4 h-4" />,
    shortcut: '⌘K',
    action: () => console.log('Search'),
    category: 'General'
  },
  {
    id: 'create',
    title: 'Create New',
    description: 'Create a new item',
    icon: <Sparkles className="w-4 h-4" />,
    shortcut: '⌘N',
    action: () => console.log('Create'),
    category: 'Actions'
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Open settings',
    icon: <Settings className="w-4 h-4" />,
    shortcut: '⌘,',
    action: () => console.log('Settings'),
    category: 'Navigation'
  },
  {
    id: 'profile',
    title: 'Profile',
    description: 'View your profile',
    icon: <User className="w-4 h-4" />,
    action: () => console.log('Profile'),
    category: 'Navigation'
  },
  {
    id: 'docs',
    title: 'Documentation',
    description: 'View documentation',
    icon: <FileText className="w-4 h-4" />,
    action: () => window.open('/docs', '_blank'),
    category: 'Help'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'View notifications',
    icon: <Bell className="w-4 h-4" />,
    action: () => console.log('Notifications'),
    category: 'Navigation'
  }
];

export function CommandMenuModal(): React.ReactElement {
  const [isOpen, setIsOpen] = useAtom(commandMenuOpenAtom);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter commands based on search query
  const filteredCommands = defaultCommands.filter(command => 
    command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    const category = command.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(command);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setIsOpen(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="flex flex-col h-[500px]">
          {/* Search Header */}
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search..."
                className="pl-10 pr-4 h-12 border-0 focus-visible:ring-0 text-base"
              />
            </div>
          </div>

          {/* Command List */}
          <div className="flex-1 overflow-y-auto p-2">
            {Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category} className="mb-4">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {category}
                </div>
                {commands.map((command, index) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const isSelected = globalIndex === selectedIndex;
                  
                  return (
                    <motion.button
                      key={command.id}
                      onClick={() => {
                        command.action();
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors",
                        isSelected ? "bg-accent" : "hover:bg-accent/50"
                      )}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      {command.icon && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center">
                          {command.icon}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{command.title}</div>
                        {command.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {command.description}
                          </div>
                        )}
                      </div>
                      {command.shortcut && (
                        <kbd className="px-2 py-0.5 text-xs bg-background border border-border rounded">
                          {command.shortcut}
                        </kbd>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}
            
            {filteredCommands.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No commands found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">⏎</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">ESC</kbd>
                Close
              </span>
            </div>
            <div>
              {filteredCommands.length} results
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
