import { useEffect } from "react";

import { useModals } from "@/hooks/use-modals";

/**
 * Hook for handling application-wide keyboard shortcuts
 */
export function useKeyboardShortcuts() {
	const { modals, openCommandModal, closeCommandModal } = useModals();

	// Register global keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Command+K to toggle command menu
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();

				if (modals.command.open) {
					closeCommandModal();
				} else {
					openCommandModal();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [modals.command.open, openCommandModal, closeCommandModal]);

	return {
		isCommandMenuOpen: modals.command.open,
	};
}
