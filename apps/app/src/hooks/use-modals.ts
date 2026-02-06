import { useAtom } from "jotai";
import {
	commandHoverAtom,
	commandModalAtom,
	type DetailSection,
	deleteModalAtom,
	detailModalAtom,
	inviteModalAtom,
	renameModalAtom,
	shareModalAtom,
} from "@/atoms/layout";

export type ItemType = "chat" | "project";

export function useModals() {
	const [deleteModal, setDeleteModal] = useAtom(deleteModalAtom);
	const [renameModal, setRenameModal] = useAtom(renameModalAtom);
	const [shareModal, setShareModal] = useAtom(shareModalAtom);
	const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);
	const [detailModal, setDetailModal] = useAtom(detailModalAtom);
	const [commandModal, setCommandModal] = useAtom(commandModalAtom);
	const [commandHover, setCommandHover] = useAtom(commandHoverAtom);

	return {
		// Modal state
		modals: {
			delete: deleteModal,
			rename: renameModal,
			share: shareModal,
			invite: inviteModal,
			detail: detailModal,
			command: commandModal,
			commandHover,
		},

		// Modal management
		openDeleteModal: (itemId: string, itemType: ItemType = "chat") =>
			setDeleteModal({ open: true, itemId, itemType }),

		closeDeleteModal: () =>
			setDeleteModal((prev) => {
				if (!prev.open) return prev;
				return { open: false, itemId: null, itemType: "chat" };
			}),

		openRenameModal: (itemId: string, itemType: ItemType = "chat") =>
			setRenameModal({ open: true, itemId, itemType }),

		closeRenameModal: () =>
			setRenameModal((prev) => {
				if (!prev.open) return prev;
				return { open: false, itemId: null, itemType: "chat" };
			}),

		// Share is only for chats, not projects
		openShareModal: (itemId: string) =>
			setShareModal({ open: true, itemId, itemType: "chat" }),

		closeShareModal: () =>
			setShareModal((prev) => {
				if (!prev.open) return prev;
				return { open: false, itemId: null, itemType: "chat" };
			}),

		openInviteModal: (itemId: string, itemType: ItemType = "chat") =>
			setInviteModal({ open: true, itemId, itemType }),

		closeInviteModal: () =>
			setInviteModal((prev) => {
				if (!prev.open) return prev;
				return { open: false, itemId: null, itemType: "chat" };
			}),

		// Detail modal
		openDetailModal: (title: string, sections: DetailSection[]) =>
			setDetailModal({ open: true, title, sections }),

		closeDetailModal: () =>
			setDetailModal((prev) => {
				if (!prev.open) return prev;
				return { open: false, title: "", sections: [] };
			}),

		// Command modal
		openCommandModal: (initialQuery: string = "") =>
			setCommandModal({
				open: true,
				activeItemId: null,
				searchQuery: initialQuery,
			}),

		closeCommandModal: () =>
			setCommandModal((prev) => {
				// Only update if the modal is currently open to prevent infinite loops
				if (!prev.open) return prev;
				return { open: false, activeItemId: null, searchQuery: "" };
			}),

		setCommandActiveItem: (itemId: string | null) =>
			setCommandModal((prev) => {
				// Only update if the itemId has changed to prevent infinite loops
				if (prev.activeItemId === itemId) return prev;
				return { ...prev, activeItemId: itemId };
			}),

		setCommandSearchQuery: (query: string) =>
			setCommandModal((prev) => {
				// Only update if the query has changed to prevent infinite loops
				if (prev.searchQuery === query) return prev;
				return { ...prev, searchQuery: query };
			}),

		// Command modal hover state management
		setCommandHoveredItem: (
			itemId: string | null,
			source: "mouse" | "keyboard" | null = "mouse",
		) => {
			if (
				commandHover.hoveredItemId === itemId &&
				commandHover.source === source
			)
				return;

			// Update hover state
			setCommandHover({ hoveredItemId: itemId, source });

			// Update active item in main state only if we have a valid item ID
			// Critical: Don't set to null on mouse leave, which causes the preview to disappear
			if (itemId !== null) {
				setCommandModal((prev) => ({ ...prev, activeItemId: itemId }));
			}
		},

		clearCommandHover: () => {
			// Just clear the hover state, don't affect the active item
			setCommandHover({ hoveredItemId: null, source: null });
		},
	};
}
