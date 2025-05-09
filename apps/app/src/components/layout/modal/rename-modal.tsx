"use client";

import React, { useState, useRef, useEffect } from "react";

import { X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@repo/design/components/ui/button";
import { Input } from "@repo/design/components/ui/input";

import { useChatData } from '@/hooks/chat/queries';
import { useRenameChatMutation } from '@/hooks/chat/mutations';
import { useProjects } from '@/hooks/project/queries';
import { useProjectMutations } from '@/hooks/project/mutations';
import { useModals } from '@/hooks/use-modals';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  itemType?: 'chat' | 'project';
}

export function RenameModal({ 
  isOpen, 
  onClose, 
  itemId,
  itemType = 'chat'
}: RenameModalProps) {
  const { closeRenameModal } = useModals();
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [newTitle, setNewTitle] = useState("");

  const { chatData, mutateChat: localMutateChat } = useChatData(itemType === 'chat' ? itemId : null);
  
  const { renameChat, isRenaming: isRenamingChat } = useRenameChatMutation();
  const { updateProject, isUpdating: isUpdatingProject } = useProjectMutations();
  const { mutateProjects } = useProjects();
  
  const isRenaming = isRenamingChat || isUpdatingProject;
  const currentTitle = itemType === 'project' ? 'Project Name' : chatData?.title || '';

  useEffect(() => {
    if (isOpen) {
      setNewTitle(currentTitle);
      
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      
      focusTimeoutRef.current = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const length = currentTitle.length;
          inputRef.current.setSelectionRange(length, length);
        }
      }, 50);
      
      return () => {
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
        }
      };
    }
  }, [isOpen, currentTitle]);
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isRenaming) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newTitle.trim();

    if (!itemId || !trimmedTitle || trimmedTitle === currentTitle) {
      if (trimmedTitle === currentTitle) onClose();
      return; 
    }
    
    try {
      if (itemType === 'project') {
        await updateProject(itemId, trimmedTitle);
      } else {
        await renameChat({ chatId: itemId, title: trimmedTitle });
        localMutateChat((currentData) => 
          currentData ? ({ ...currentData, title: trimmedTitle }) : undefined, 
          false
        );
      }
      await mutateProjects();
      closeRenameModal();
    } catch (error) {
      console.error("Failed to rename:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isRenaming) {
        e.preventDefault();
        if (document.activeElement === inputRef.current) {
          inputRef.current?.blur();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isRenaming]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <motion.div 
            className="fixed inset-0 bg-background/60 backdrop-blur-md" 
            onClick={handleBackdropClick}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
          <motion.div 
            className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-background shadow-lg overflow-hidden border border-border/50 flex flex-col">
              <div className="flex items-center justify-between border-b p-3 relative">
                <h3 className="text-foreground text-sm font-normal">
                  rename {itemType}
                </h3>

                <button 
                  onClick={onClose}
                  className="h-7 w-7 flex items-center justify-center hover:bg-accent/50 transition-colors"
                  disabled={isRenaming}
                >
                  <X weight="duotone" className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              
              <div className="p-4">
                <p className="text-muted-foreground text-sm mb-4">
                  choose a new title for this {itemType}
                </p>
                
                <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
                  <div className="w-full mb-4 h-[44px] flex items-center relative border border-input overflow-hidden">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="enter a new title"
                      className="w-full text-foreground h-full py-0 px-3 leading-normal box-border border-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 absolute inset-0"
                      style={{ 
                        lineHeight: '1.5',
                        fontSize: '0.875rem'
                      }}
                      disabled={isRenaming}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      disabled={isRenaming}
                      className="text-xs text-foreground w-20"
                    >
                      cancel
                    </Button>

                    <Button 
                      type="submit" 
                      variant="power" 
                      size="sm"
                      disabled={!newTitle.trim() || isRenaming || newTitle === currentTitle}
                      className="text-xs text-primary-foreground w-20 rounded-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isRenaming ? "saving..." : "save"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
