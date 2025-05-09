"use client";

import React from "react";

import { formatDistanceToNow } from "date-fns";

import { cn } from "@repo/design/lib/utils";

import { useChatData } from "@/hooks/chat/queries";

interface ChatPreviewProps {
  chatId: string;
}

export function ChatPreview({ chatId }: ChatPreviewProps) {
  const { chatData, isLoading } = useChatData(chatId);
  
  if (isLoading || !chatData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-pulse bg-accent/40 w-3/4 h-6 mb-2 rounded-none"></div>
        <div className="animate-pulse bg-accent/30 w-1/2 h-4 mb-4 rounded-none"></div>
        <div className="animate-pulse bg-accent/20 w-5/6 h-4 mb-1 rounded-none"></div>
        <div className="animate-pulse bg-accent/20 w-3/4 h-4 mb-1 rounded-none"></div>
        <div className="animate-pulse bg-accent/20 w-4/5 h-4 rounded-none"></div>
      </div>
    );
  }
  
  // Get first few messages for preview
  const previewMessages = chatData.messages?.slice(0, 3) || [];
  
  return (
    <div className="flex flex-col h-full py-4 px-4 overflow-hidden">
      <h3 className="text-foreground font-medium mb-1 truncate">{chatData.title}</h3>
      <p className="text-xs text-muted-foreground mb-4">
        {chatData.updatedAt ? formatDistanceToNow(new Date(chatData.updatedAt), { addSuffix: true }) : 'just now'}
      </p>
      
      <div className="space-y-3 overflow-hidden">
        {previewMessages.map((msg: any, index: number) => (
          <div key={index} className="text-sm text-foreground">
            <span className={cn(
              "text-xs uppercase mr-2",
              msg.type === 'user' ? "text-primary" : "text-muted-foreground"
            )}>
              {msg.type}:
            </span>
            <span className="text-muted-foreground text-xs whitespace-normal line-clamp-2">
              {msg.content}
            </span>
          </div>
        ))}
        
        {previewMessages.length < (chatData.messages?.length || 0) && (
          <p className="text-xs text-muted-foreground italic">
            + {(chatData.messages?.length || 0) - previewMessages.length} more messages
          </p>
        )}
      </div>
    </div>
  );
} 