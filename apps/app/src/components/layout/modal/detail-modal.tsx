"use client";

import { X } from "@phosphor-icons/react";
import { Button } from "@repo/design/components/ui/button";
import { cn } from "@repo/design/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface DetailSection {
	label: string;
	content: unknown;
	maxHeight?: string;
}

interface DetailModalProps {
	isOpen: boolean;
	title: string;
	sections: DetailSection[];
	onClose: () => void;
}

export function DetailModal({
	isOpen,
	title,
	sections,
	onClose,
}: DetailModalProps) {
	const modalRef = useRef<HTMLDivElement>(null);

	// Handle escape key to close
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				e.preventDefault();
				onClose();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	// Handle backdrop click
	const handleBackdropClick = () => {
		onClose();
	};

	// Format JSON for display
	const formatContent = (data: unknown) => {
		if (typeof data === "object") {
			try {
				return JSON.stringify(data, null, 2);
			} catch (_error) {
				return String(data);
			}
		}
		return String(data);
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[100]">
					{/* Backdrop with blur */}
					<motion.div
						className="fixed inset-0 bg-background/60 backdrop-blur-md"
						onClick={handleBackdropClick}
						aria-hidden="true"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					/>

					{/* Modal dialog */}
					<motion.div
						className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform"
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
						transition={{ duration: 0.2 }}
						ref={modalRef}
					>
						<div className="rounded-lg bg-background shadow-lg overflow-hidden border border-border/50 flex flex-col">
							{/* Header with close button */}
							<div className="flex items-center justify-between border-b p-3 relative">
								<h3 className="text-foreground text-sm font-normal">{title}</h3>
								<button
									type="button"
									onClick={onClose}
									className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent/50 transition-colors"
								>
									<X
										weight="duotone"
										className="h-4 w-4 text-muted-foreground"
									/>
								</button>
							</div>

							{/* Content */}
							<div className="p-4">
								<div className="space-y-4">
									{sections.map((section) => (
										<div key={section.label}>
											<h4 className="text-xs text-muted-foreground mb-1">
												{section.label}
											</h4>
											<pre
												className={cn(
													"bg-accent/20 p-2 rounded text-sm text-foreground font-mono overflow-auto",
													section.maxHeight
														? `max-h-[${section.maxHeight}]`
														: "max-h-[150px]",
												)}
											>
												{formatContent(section.content)}
											</pre>
										</div>
									))}
								</div>

								{/* Button row */}
								<div className="flex justify-end mt-6">
									<Button
										type="button"
										variant="default"
										size="sm"
										onClick={onClose}
										className="text-xs"
									>
										close
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
