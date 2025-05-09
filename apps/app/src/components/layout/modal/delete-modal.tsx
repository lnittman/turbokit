"use client";

import React from "react";

import { X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from 'next/navigation';

import { Button } from "@repo/design/components/ui/button";

import { useChatData } from '@/hooks/chat/queries';
import { useDeleteChatMutation } from '@/hooks/chat/mutations';
import { useProjects } from '@/hooks/project/queries';
import { useProjectMutations } from '@/hooks/project/mutations';
import { useModals } from '@/hooks/use-modals';

interface DeleteModalProps {
  isOpen: boolean;
  itemId: string | null;
  itemType?: 'chat' | 'project';
  onClose: () => void;
}

export function DeleteModal({ 
  isOpen, 
  onClose, 
  itemId,
  itemType = 'chat'
}: DeleteModalProps) {
  const router = useRouter();
  const { closeDeleteModal } = useModals();

  const { chatData } = useChatData(itemType === 'chat' ? itemId : null);
  
  const { deleteChat, isDeleting: isDeletingChat } = useDeleteChatMutation();
  const { deleteProject, isDeleting: isDeletingProject } = useProjectMutations();
  const { mutateProjects } = useProjects();

  const isDeleting = isDeletingChat || isDeletingProject;
  const title = itemType === 'project' ? 'this project' : chatData?.title || 'this chat';

  const handleConfirm = async () => {
    if (!itemId) return;
    
    try {
      if (itemType === 'project') {
        await deleteProject(itemId);
      } else {
        await deleteChat({ chatId: itemId });
        if (window.location.pathname.includes(`/c/${itemId}`)) {
          router.push('/'); 
        }
      }
      await mutateProjects();
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleBackdropClick = () => {
    if (!isDeleting) {
      onClose();
    }
  };

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
          >
            <div className="rounded-lg bg-background shadow-lg overflow-hidden border border-border/50 flex flex-col">
              <div className="flex items-center justify-between border-b p-3 relative">
                <h3 className="text-foreground text-sm font-normal">delete {itemType}?</h3>
                <button 
                  onClick={onClose}
                  className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent/50 transition-colors"
                  disabled={isDeleting}
                >
                  <X weight="duotone" className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-foreground mb-2">
                  this will delete <span className="font-medium">{title}</span>.
                </p>

                <p className="text-xs text-muted-foreground mb-4">
                  visit <span className="underline">settings</span> to delete any memories saved during this chat.
                </p>
                
                <div className="flex justify-end gap-2 mt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={onClose}
                    disabled={isDeleting}
                    className="text-xs w-24"
                  >
                    cancel
                  </Button>

                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    onClick={handleConfirm}
                    disabled={isDeleting}
                    className="text-xs w-24"
                  >
                    {isDeleting ? "deleting..." : "delete"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 