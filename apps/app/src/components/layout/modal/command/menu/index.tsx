"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

import { Plus, ChatDots, CaretRight } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from 'jotai';
import { useRouter, usePathname } from "next/navigation";

import { Dialog } from '@repo/design/components/ui/dialog';
import { useMediaQuery } from "@repo/design/hooks/use-media-query";
import { cn } from "@repo/design/lib/utils";

import { commandMenuOpenAtom } from '@/atoms/layout';
import { useModals } from "@/hooks/use-modals";
import { useChats } from "@/hooks/chat/queries";

import { SearchBar } from "./components/SearchBar";
import { ChatGroupList } from "./components/ChatGroupList";
import { ChatPreview } from "./components/ChatPreview";
import { CommandOverlay } from '../overlay';

const customStyles = `
  .search-input::placeholder {
    color: var(--foreground);
    opacity: 0.6;
  }
  
  .preview-section {
    background-color: var(--accent);
    border-left: 1px solid var(--border);
  }
  
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Group chats by date - copied from Sidebar for consistency
const groupChatsByDate = (chats: any[] | undefined) => {
  // Handle undefined or empty chats array
  if (!chats || !Array.isArray(chats)) {
    // Return empty groups if chats is undefined
    return {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Previous 30 Days': [],
      'Older': []
    };
  }

  // Filter chats to only include those with at least one message
  const chatsWithMessages = chats.filter(chat => chat.messages && chat.messages.length > 0);
  
  const groups: Record<string, any[]> = {
    'Today': [],
    'Yesterday': [],
    'Previous 7 Days': [],
    'Previous 30 Days': [],
    'Older': []
  };

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(now);
  lastMonth.setDate(lastMonth.getDate() - 30);

  chatsWithMessages.forEach(chat => {
    const chatDate = new Date(chat.updatedAt);
    
    if (chatDate.toDateString() === now.toDateString()) {
      groups['Today'].push(chat);
    } else if (chatDate.toDateString() === yesterday.toDateString()) {
      groups['Yesterday'].push(chat);
    } else if (chatDate > lastWeek) {
      groups['Previous 7 Days'].push(chat);
    } else if (chatDate > lastMonth) {
      groups['Previous 30 Days'].push(chat);
    } else {
      groups['Older'].push(chat);
    }
  });

  return groups;
};

export function CommandMenuModal() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const pathname = usePathname();
  const router = useRouter();

  const { chats } = useChats();

  const { modals, closeCommandModal, setCommandActiveItem, setCommandSearchQuery, openCommandModal, setCommandHoveredItem } = useModals();

  const { open, activeItemId, searchQuery } = modals.command;
  const { hoveredItemId, source } = modals.commandHover;
  
  const inputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  
  // Ref to track currently active index for keyboard navigation
  const [focusIndex, setFocusIndex] = useState(-1);
  
  // Group chats by date
  const chatGroups = useMemo(() => groupChatsByDate(chats), [chats]);

  // Filter chat groups based on search
  const filteredChatGroups = useMemo(() => Object.fromEntries(
    Object.entries(chatGroups).map(([group, groupChats]) => [
      group, 
      groupChats.filter(chat => chat.title.toLowerCase().includes(search.toLowerCase()))
    ])
  ), [chatGroups, search]);
  
  // Get all navigable items flattened into a single array
  const navigableItems = useMemo(() => {
    const items = ['new-chat'];
    
    Object.values(filteredChatGroups).forEach(group => {
      group.forEach(chat => {
        items.push(chat.id);
      });
    });
    
    return items;
  }, [filteredChatGroups]);
  
  // Navigate to selected chat - memoize to stabilize
  const handleSelectChat = useCallback((chatId: string) => {
    closeCommandModal();
    router.push(`/c/${chatId}`);
  }, [closeCommandModal, router]);

  // Handle creating a new chat - memoize to stabilize
  const handleNewChat = useCallback(() => {
    closeCommandModal();
    router.push('/');
  }, [closeCommandModal, router]);
  
  // When filter/search changes, reset focus to first item
  useEffect(() => {
    if (open && navigableItems.length > 0) {
      // Select the first item when the modal opens or search changes
      setFocusIndex(0);
      const firstItem = navigableItems[0];
      if (firstItem) {
        setCommandActiveItem(firstItem);
      }
    }
  }, [search, open, navigableItems, setCommandActiveItem]);
  
  // Update search in Jotai state when local state changes
  useEffect(() => {
    // Only update if the searchQuery in the modal state is different from our local state
    if (searchQuery !== search) {
      setCommandSearchQuery(search);
    }
  }, [search, setCommandSearchQuery, searchQuery]);

  // Initialize from modal state when opening
  useEffect(() => {
    if (open) {
      // Only update local state if it's different from searchQuery
      if (search !== searchQuery) {
        setSearch(searchQuery);
      }
      
      // Focus on the input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [open, searchQuery, search]);

  // Sync focus index with active item if they get out of sync
  useEffect(() => {
    if (activeItemId && navigableItems.includes(activeItemId)) {
      const index = navigableItems.indexOf(activeItemId);
      if (index !== focusIndex) {
        setFocusIndex(index);
      }
    }
  }, [activeItemId, navigableItems, focusIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          openCommandModal("");
        }
        return;
      }
      
      switch (e.key) {
        case "k":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            closeCommandModal();
          }
          break;
          
        case "Escape":
          e.preventDefault();
          closeCommandModal();
          break;
          
        case "ArrowDown":
          e.preventDefault();
          if (navigableItems.length > 0) {
            // Calculate next index
            const nextIndex = (focusIndex + 1) % navigableItems.length;
            setFocusIndex(nextIndex);
            
            // Set the active item directly - more reliable than going through hover state
            const nextItem = navigableItems[nextIndex];
            if (nextItem) {
              setCommandActiveItem(nextItem);
            }
          }
          break;
          
        case "ArrowUp":
          e.preventDefault();
          if (navigableItems.length > 0) {
            // Calculate previous index
            const prevIndex = (focusIndex - 1 + navigableItems.length) % navigableItems.length;
            setFocusIndex(prevIndex);
            
            // Set the active item directly - more reliable than going through hover state
            const prevItem = navigableItems[prevIndex];
            if (prevItem) {
              setCommandActiveItem(prevItem);
            }
          }
          break;
          
        case "Enter":
          e.preventDefault();
          if (activeItemId === 'new-chat') {
            handleNewChat();
          } else if (activeItemId) {
            handleSelectChat(activeItemId);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closeCommandModal, openCommandModal, navigableItems, activeItemId, handleNewChat, handleSelectChat, focusIndex, setCommandActiveItem]);

  const [openAtom, setOpenAtom] = useAtom(commandMenuOpenAtom);

  const handleOpenChange = (newOpenState: boolean) => {
    setOpenAtom(newOpenState);
  };

  // Only render if on desktop
  if (!isDesktop) {
    return null;
  }

  return (
    <Dialog open={openAtom} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {openAtom && (
          <>
            {/* Include custom styles */}
            <style jsx global>{customStyles}</style>
            <div className="fixed inset-0 z-[600]">
              {/* Backdrop with blur */}
              <motion.div 
                className="fixed inset-0 bg-background/60 backdrop-blur-md" 
                onClick={closeCommandModal}
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Command dialog */}
              <motion.div 
                className="fixed left-1/2 top-1/2 h-[70vh] max-h-[600px] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 transform rounded-none"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex h-full rounded-none border border-border bg-background shadow-md overflow-hidden">
                  {/* Left side - search and results */}
                  <div className="w-1/2 flex flex-col">
                    {/* Search bar */}
                    <SearchBar 
                      search={search}
                      setSearch={setSearch}
                      closeCommandModal={closeCommandModal}
                      inputRef={inputRef}
                    />
                    
                    {/* New chat button - fixed position */}
                    <div className="px-2 py-2 bg-background border-b">
                      <button
                        onClick={handleNewChat}
                        onMouseEnter={() => setCommandHoveredItem('new-chat', 'mouse')}
                        onFocus={() => setCommandHoveredItem('new-chat', 'keyboard')}
                        className={cn(
                          "flex items-center gap-2 w-full p-2 rounded-none transition-colors",
                          activeItemId === 'new-chat' ? "bg-accent/70" : "bg-accent/30 hover:bg-accent/50"
                        )}
                      >
                        <div className="h-6 w-6 bg-accent/40 flex items-center justify-center rounded-none">
                          <Plus weight="duotone" className="h-4 w-4 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">new chat</div>
                        </div>
                        <CaretRight weight="bold" className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                    
                    {/* Chat list with gradient overlays */}
                    <div className="relative flex-1 overflow-hidden">
                      {/* Top fade gradient */}
                      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-[1] pointer-events-none"></div>
                      
                      <div className="h-full overflow-y-auto no-scrollbar py-2 px-2 pb-8">
                        <ChatGroupList 
                          filteredChatGroups={filteredChatGroups}
                          search={search}
                          chats={chats}
                          activeItemId={activeItemId}
                          pathname={pathname}
                          handleSelectChat={handleSelectChat}
                          closeCommandModal={closeCommandModal}
                        />
                      </div>
                      
                      {/* Bottom fade gradient */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
                    </div>
                  </div>
                  
                  {/* Right side - preview */}
                  <div className="w-1/2 preview-section overflow-hidden">
                    {activeItemId === 'new-chat' ? (
                      <div className="flex flex-col items-center justify-center h-full p-6">
                        <div className="h-16 w-16 bg-accent/40 flex items-center justify-center rounded-none mb-4">
                          <Plus weight="duotone" className="h-8 w-8 text-foreground/80" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">Start a new chat</h3>
                        <p className="text-center text-muted-foreground max-w-xs">
                          Create a new conversation with just a prompt. Your chat history will be saved for later.
                        </p>
                      </div>
                    ) : activeItemId ? (
                      // Show chat preview
                      <ChatPreview chatId={activeItemId} />
                    ) : (
                      // Default state when nothing is selected
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <ChatDots weight="duotone" className="h-10 w-10 mb-4 opacity-50" />
                        <p className="text-sm">Select a chat to preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <CommandOverlay />
    </Dialog>
  );
} 