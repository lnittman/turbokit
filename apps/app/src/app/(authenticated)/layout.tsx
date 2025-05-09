"use client";

import React from "react";

import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { useIsMobile } from "@repo/design/hooks/use-is-mobile";

import { sidebarOpenAtom } from '@/atoms/layout';
import { Sidebar } from '@/components/layout/sidebar/Sidebar';
import { CommandMenuModal } from '@/components/layout/modal/command/menu';
import { DeleteModal } from '@/components/layout/modal/delete-modal';
import { RenameModal } from '@/components/layout/modal/rename-modal';
import { ShareModal } from '@/components/layout/modal/share-modal';
import { InviteModal } from '@/components/layout/modal/invite-modal';
import { DetailModal } from '@/components/layout/modal/detail-modal';
import { useModals } from '@/hooks/use-modals';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { isMobile, ready } = useIsMobile();

  const [isOpen] = useAtom(sidebarOpenAtom);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Get modal state and management
  const {
    modals,
    closeDeleteModal,
    closeRenameModal,
    closeShareModal,
    closeInviteModal,
    closeDetailModal
  } = useModals();

  if (!ready) return null;

  // For normal routes, render the full layout with sidebar
  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />

      <motion.main
        className="flex-1"
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : (isOpen ? 280 : 48)
        }}
        transition={{
          duration: 0.3,
          ease: [0.32, 0.72, 0, 1]
        }}
      >
        {children}
      </motion.main>

      {/* Portal components rendered at the root layout level for proper stacking context */}
      <CommandMenuModal />

      {/* Chat/Project Modals */}
      <DeleteChatModal
        isOpen={modals.delete.open}
        onClose={closeDeleteModal}
        itemId={modals.delete.itemId}
        itemType={modals.delete.itemType}
      />

      <RenameModal
        isOpen={modals.rename.open}
        onClose={closeRenameModal}
        itemId={modals.rename.itemId}
        itemType={modals.rename.itemType}
      />

      <ShareChatModal
        isOpen={modals.share.open}
        onClose={closeShareModal}
        chatId={modals.share.itemId || ''}
      />

      <InviteModal
        isOpen={modals.invite.open}
        onClose={closeInviteModal}
        itemId={modals.invite.itemId || ''}
        itemType={modals.invite.itemType}
        roleOptions={[]}
      />

      <DetailModal
        isOpen={modals.detail.open}
        onClose={closeDetailModal}
        title={modals.detail.title}
        sections={modals.detail.sections}
      />
    </div>
  );
} 