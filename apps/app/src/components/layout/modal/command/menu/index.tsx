"use client";

import { Dialog } from "@base-ui-components/react/dialog";
import { MagnifyingGlass as Search } from "@phosphor-icons/react";
import { useAtom } from "jotai";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { commandModalAtom } from "@/atoms/layout";
import {
	ACTION_CATEGORY_LABELS,
	type AppAction,
	useActionsForSurface,
} from "@/components/layout/actions/registry";

export function CommandMenuModal(): React.ReactElement {
	const [commandModal, setCommandModal] = useAtom(commandModalAtom);
	const isOpen = commandModal.open;
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const commandItems = useActionsForSurface("command");

	const setIsOpen = useCallback(
		(open: boolean) => {
			setCommandModal((previous) => {
				if (previous.open === open) return previous;
				return open
					? { ...previous, open: true }
					: { open: false, activeItemId: null, searchQuery: "" };
			});
		},
		[setCommandModal],
	);

	const filteredCommands = useMemo(
		() =>
			commandItems.filter(
				(command) =>
					command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					command.description
						?.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					ACTION_CATEGORY_LABELS[command.category]
						.toLowerCase()
						.includes(searchQuery.toLowerCase()),
			),
		[commandItems, searchQuery],
	);

	const groupedCommands = useMemo(
		() =>
			filteredCommands.reduce(
				(accumulator, command) => {
					const category = command.category;
					if (!accumulator[category]) accumulator[category] = [];
					accumulator[category].push(command);
					return accumulator;
				},
				{} as Record<string, AppAction[]>,
			),
		[filteredCommands],
	);

	const executeCommand = useCallback(
		async (command: AppAction) => {
			await command.action();
			setIsOpen(false);
		},
		[setIsOpen],
	);

	useEffect(() => {
		if (!listRef.current) return;
		const items = listRef.current.querySelectorAll("[data-command-item]");
		const selected = items[selectedIndex];
		if (selected) {
			selected.scrollIntoView({ block: "nearest" });
		}
	}, [selectedIndex]);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			switch (event.key) {
				case "ArrowDown":
					event.preventDefault();
					setSelectedIndex((previous) =>
						previous < filteredCommands.length - 1 ? previous + 1 : 0,
					);
					break;
				case "ArrowUp":
					event.preventDefault();
					setSelectedIndex((previous) =>
						previous > 0 ? previous - 1 : filteredCommands.length - 1,
					);
					break;
				case "Enter":
					event.preventDefault();
					if (filteredCommands[selectedIndex]) {
						void executeCommand(filteredCommands[selectedIndex]);
					}
					break;
			}
		},
		[executeCommand, filteredCommands, selectedIndex],
	);

	useEffect(() => {
		if (isOpen) {
			setSearchQuery("");
			setSelectedIndex(0);
			requestAnimationFrame(() => inputRef.current?.focus());
		}
	}, [isOpen]);

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Portal>
				<Dialog.Backdrop className="tk-cmd-backdrop" />
				<Dialog.Popup className="tk-cmd-popup" onKeyDown={handleKeyDown}>
					<Dialog.Title className="sr-only">Command palette</Dialog.Title>

					<div className="tk-cmd-search">
						<Search className="tk-cmd-search-icon" />
						<input
							ref={inputRef}
							value={searchQuery}
							onChange={(event) => {
								setSearchQuery(event.target.value);
								setSelectedIndex(0);
							}}
							placeholder="search or run a command…"
							className="tk-cmd-input"
							autoComplete="off"
							spellCheck={false}
						/>
						<kbd className="tk-cmd-kbd">esc</kbd>
					</div>

					<div ref={listRef} className="tk-cmd-list">
						{Object.entries(groupedCommands).map(([category, commands]) => (
							<div key={category} className="tk-cmd-group">
								<div className="tk-cmd-group-label">{category}</div>
								{commands.map((command) => {
									const globalIndex = filteredCommands.indexOf(command);
									const isHighlighted = globalIndex === selectedIndex;

									return (
										<button
											type="button"
											key={command.id}
											data-command-item
											data-highlighted={isHighlighted || undefined}
											onClick={() => {
												void executeCommand(command);
											}}
											onMouseEnter={() => setSelectedIndex(globalIndex)}
											className="tk-cmd-item"
										>
											{command.icon && (
												<div className="tk-cmd-item-icon">{command.icon}</div>
											)}
											<div className="tk-cmd-item-content">
												<span className="tk-cmd-item-title">
													{command.title}
												</span>
												{command.description && (
													<span className="tk-cmd-item-desc">
														{command.description}
													</span>
												)}
											</div>
											{command.commandShortcut && (
												<kbd className="tk-cmd-kbd-sm">
													{command.commandShortcut}
												</kbd>
											)}
										</button>
									);
								})}
							</div>
						))}

						{filteredCommands.length === 0 && (
							<div className="tk-cmd-empty">
								No commands found for &ldquo;{searchQuery}&rdquo;
							</div>
						)}
					</div>

					<div className="tk-cmd-footer">
						<div className="tk-cmd-footer-hints">
							<span className="tk-cmd-footer-hint">
								<kbd className="tk-cmd-kbd-xs">↑</kbd>
								<kbd className="tk-cmd-kbd-xs">↓</kbd>
								navigate
							</span>
							<span className="tk-cmd-footer-hint">
								<kbd className="tk-cmd-kbd-xs">⏎</kbd>
								select
							</span>
							<span className="tk-cmd-footer-hint">
								<kbd className="tk-cmd-kbd-xs">esc</kbd>
								close
							</span>
						</div>
						<span className="tk-cmd-footer-count">
							{filteredCommands.length} results
						</span>
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
