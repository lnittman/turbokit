"use client";

import { ArrowUp } from "@phosphor-icons/react";
import { Button } from "@repo/design/components/ui/button";
import { Textarea } from "@repo/design/components/ui/textarea";
import { cn } from "@repo/design/lib/utils";
import type React from "react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

export function PromptBar(): React.ReactElement {
	const [input, setInput] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const [rows, setRows] = useState(1);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea based on content
	useEffect(() => {
		if (textareaRef.current) {
			// Calculate rows based on scroll height
			const lineHeight = 24; // Approximate line height in pixels
			const maxRows = 16;
			const scrollHeight = textareaRef.current.scrollHeight;
			const calculatedRows = Math.min(
				Math.max(1, Math.ceil(scrollHeight / lineHeight)),
				maxRows,
			);
			setRows(calculatedRows);
		}
	}, []);

	const handleSubmit = async () => {
		if (!input.trim()) return;

		// TODO: Implement your submission logic here
		console.log("Submitting:", input);

		// Clear input after submission
		setInput("");
		setRows(1);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		// Cmd/Ctrl+Enter or Shift+Enter to submit
		if ((e.metaKey || e.ctrlKey || e.shiftKey) && e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		}
	};

	const canSubmit = input.trim().length > 0;

	return (
		<div
			className={cn(
				"relative z-50 flex w-full flex-col justify-between rounded-sm border bg-muted/40 transition-colors",
				isFocused
					? "border-primary/10"
					: "border-border/50 hover:border-border",
			)}
		>
			<div className="flex items-center gap-2 p-3">
				<Textarea
					ref={textareaRef}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					placeholder="What would you like to do?"
					rows={rows}
					className={cn(
						"!border-0 !ring-0 !shadow-none bg-transparent px-0 py-0",
						"resize-none min-h-[24px] max-h-[384px]",
						"placeholder:text-muted-foreground/60",
						"focus-visible:ring-0 focus-visible:ring-offset-0",
						"leading-6",
					)}
					style={{
						height: "auto",
						overflow: rows >= 16 ? "auto" : "hidden",
					}}
				/>

				<Button
					onClick={handleSubmit}
					disabled={!canSubmit}
					size="icon"
					className={cn(
						"h-8 w-8 flex-shrink-0 rounded-sm transition-colors flex items-center justify-center",
						canSubmit
							? "bg-primary hover:bg-primary/90 text-primary-foreground"
							: "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
					)}
				>
					<ArrowUp weight="bold" className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
