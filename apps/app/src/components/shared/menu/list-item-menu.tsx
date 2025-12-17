"use client";

import {
  Archive,
  DotsThree,
  FolderSimple,
  PencilSimple,
  Share,
  Trash,
  UserPlus,
} from "@phosphor-icons/react";
import type React from "react";
import { useMemo } from "react";

import { type ItemType, useModals } from "@/hooks/use-modals";

import { Menu, type MenuGroup } from ".";

interface ListItemMenuProps {
  itemId: string;
  itemType?: ItemType;
  showAddToCollection?: boolean;
  showShare?: boolean;
  showRename?: boolean;
  showInvite?: boolean;
  showArchive?: boolean;
  showDelete?: boolean;
}

export function ListItemMenu({
  itemId,
  itemType = "project",
  showAddToCollection = true,
  showShare = true,
  showRename = true,
  showInvite = true,
  showArchive = true,
  showDelete = true,
}: ListItemMenuProps) {
  // Use the modals hook
  const { openDeleteModal, openRenameModal, openShareModal, openInviteModal } =
    useModals();

  const handleAddToCollection = (e: React.MouseEvent | Event) => {
    // Prevent event from propagating to parent elements
    e.stopPropagation();

    console.log("Add to collection:", itemId);
  };

  const handleRename = (e: React.MouseEvent | Event) => {
    // Prevent event from propagating to parent elements
    e.stopPropagation();

    openRenameModal(itemId, itemType);
  };

  const handleShare = (e: React.MouseEvent | Event) => {
    // Prevent event from propagating to parent elements
    e.stopPropagation();

    openShareModal(itemId);
  };

  const handleInvite = (e: React.MouseEvent | Event) => {
    // Prevent event from propagating to parent elements
    e.stopPropagation();

    openInviteModal(itemId, itemType);
  };

  const handleArchive = (e: React.MouseEvent | Event) => {
    // Prevent event from propagating to parent elements
    e.stopPropagation();

    console.log("Archive:", itemId);
  };

  const handleShowDeleteConfirmation = (e: React.MouseEvent | Event) => {
    // Prevent event from propagating to parent elements
    e.stopPropagation();

    openDeleteModal(itemId, itemType);
  };

  // Define menu groups and items
  const menuGroups = useMemo<MenuGroup[]>(() => {
    const mainItems = [];

    if (showAddToCollection) {
      mainItems.push({
        id: "add-to-collection",
        label: "add to collection",
        icon: <FolderSimple className="h-4 w-4" weight="duotone" />,
        onClick: handleAddToCollection,
      });
    }

    if (showShare) {
      mainItems.push({
        id: "share",
        label: "share",
        icon: <Share className="h-4 w-4" weight="duotone" />,
        onClick: handleShare,
      });
    }

    if (showRename) {
      mainItems.push({
        id: "rename",
        label: "rename",
        icon: <PencilSimple className="h-4 w-4" weight="duotone" />,
        onClick: handleRename,
      });
    }

    if (showInvite) {
      mainItems.push({
        id: "invite",
        label: "invite",
        icon: <UserPlus className="h-4 w-4" weight="duotone" />,
        onClick: handleInvite,
      });
    }

    if (showArchive) {
      mainItems.push({
        id: "archive",
        label: "archive",
        icon: <Archive className="h-4 w-4" weight="duotone" />,
        onClick: handleArchive,
      });
    }

    const mainGroup: MenuGroup = {
      items: mainItems,
      showDivider: showDelete,
    };

    const groups = [mainGroup];

    if (showDelete) {
      const dangerGroup: MenuGroup = {
        items: [
          {
            id: "delete",
            label: "delete",
            icon: <Trash className="h-4 w-4 text-red-500" weight="duotone" />,
            onClick: handleShowDeleteConfirmation,
            isDanger: true,
          },
        ],
      };
      groups.push(dangerGroup);
    }

    return groups;
  }, [
    showAddToCollection,
    showShare,
    showRename,
    showInvite,
    showArchive,
    showDelete,
  ]);

  return (
    <Menu
      groups={menuGroups}
      trigger={<DotsThree className="h-5 w-5" weight="duotone" />}
      triggerActiveClassName="opacity-100 bg-accent text-foreground"
      triggerClassName="h-6 w-6 flex items-center justify-center text-muted-foreground transition-all hover:bg-accent/90 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300"
    />
  );
}
