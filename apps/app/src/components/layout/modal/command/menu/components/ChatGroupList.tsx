"use client";

import React from "react";

import { CaretRight, ChatDots, Empty } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { Button } from "@repo/design/components/ui/button";
import { cn } from "@repo/design/lib/utils";

import { useModals } from "@/hooks/use-modals";

interface ChatGroupListProps {
  filteredChatGroups: Record<string, any[]>;
  search: string;
  chats: any[] | undefined;
  activeItemId: string | null;
  pathname: string;
  handleSelectChat: (chatId: string) => void;
  closeCommandModal: () => void;
}

export function ChatGroupList({ 
  filteredChatGroups, 
  search, 
  chats,
  activeItemId,
  pathname,
  handleSelectChat,
  closeCommandModal
}: ChatGroupListProps) {
  const router = useRouter();
  const { setCommandHoveredItem } = useModals();
  
  // Empty state
  if (!chats || chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Empty weight="duotone" className="h-10 w-10 text-muted-foreground bg-accent/30 mb-2 p-2" />
        <p className="text-sm text-muted-foreground mb-2">you have no chats yet</p>
        <Button 
          onClick={() => {
            router.push('/');
            closeCommandModal();
          }}
          variant="outline" 
          className="text-xs rounded-none text-muted-foreground"
        >
          start a new chat
        </Button>
      </div>
    );
  }
  
  // No search results
  if (search.length > 0 && !Object.entries(filteredChatGroups).some(([_, groupChats]) => groupChats.length > 0)) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        no chats found for &quot;{search}&quot;
      </div>
    );
  }
  
  // Render chat groups
  return (
    <>
      {Object.entries(filteredChatGroups).map(([group, groupChats]) => 
        groupChats.length > 0 && (
          <div key={group} className="mb-2">
            <h4 className="px-2 py-1 text-xs text-muted-foreground">{group}</h4>
            <div className="space-y-1">
              {groupChats.map(chat => (
                <button
                  key={chat.id}
                  onMouseEnter={() => setCommandHoveredItem(chat.id, 'mouse')}
                  onFocus={() => setCommandHoveredItem(chat.id, 'keyboard')}
                  onClick={() => handleSelectChat(chat.id)}
                  className={cn(
                    "px-2 py-1.5 w-full cursor-pointer flex items-center justify-between transition-colors duration-300 text-muted-foreground hover:text-foreground/80 active:text-foreground",
                    activeItemId === chat.id ? "bg-accent" : "hover:bg-accent/50",
                    pathname.includes(`/c/${chat.id}`) ? "font-medium" : ""
                  )}
                >
                  <div className="flex items-center">
                    <ChatDots weight="duotone" className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="flex-1 truncate text-sm text-left">{chat.title}</span>
                  </div>
                  <CaretRight weight="bold" className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </>
  );
}
