"use client";

import {
	AnimatePresence,
	motion,
	type Transition,
	type Variant,
} from "framer-motion";
import * as React from "react";
import { cn } from "../../lib/utils";

interface AccordionContextValue {
	expandedValue: React.Key | null;
	toggleItem: (value: React.Key) => void;
	variants?: {
		expanded: Variant;
		collapsed: Variant;
	};
	transition?: Transition;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(
	undefined,
);

interface AccordionProps {
	children: React.ReactNode;
	className?: string;
	transition?: Transition;
	variants?: {
		expanded: Variant;
		collapsed: Variant;
	};
	expandedValue?: React.Key | null;
	onValueChange?: (value: React.Key | null) => void;
	defaultExpandedValue?: React.Key | null;
}

export function Accordion({
	children,
	className,
	transition,
	variants,
	expandedValue: controlledExpandedValue,
	onValueChange,
	defaultExpandedValue = null,
}: AccordionProps) {
	const [internalExpandedValue, setInternalExpandedValue] =
		React.useState<React.Key | null>(defaultExpandedValue);

	const expandedValue =
		controlledExpandedValue !== undefined
			? controlledExpandedValue
			: internalExpandedValue;

	const toggleItem = React.useCallback(
		(value: React.Key) => {
			const newValue = expandedValue === value ? null : value;

			if (controlledExpandedValue === undefined) {
				setInternalExpandedValue(newValue);
			}

			onValueChange?.(newValue);
		},
		[expandedValue, onValueChange, controlledExpandedValue],
	);

	const contextValue: AccordionContextValue = {
		expandedValue,
		toggleItem,
		variants,
		transition,
	};

	return (
		<AccordionContext.Provider value={contextValue}>
			<div className={cn("space-y-2", className)}>{children}</div>
		</AccordionContext.Provider>
	);
}

interface AccordionItemProps {
	value: React.Key;
	children: React.ReactNode;
	className?: string;
}

export function AccordionItem({
	value,
	children,
	className,
}: AccordionItemProps) {
	const context = React.useContext(AccordionContext);
	if (!context) {
		throw new Error("AccordionItem must be used within an Accordion");
	}

	const isExpanded = context.expandedValue === value;

	return (
		<div
			className={cn("border rounded-lg", className)}
			data-expanded={isExpanded || undefined}
		>
			{children}
		</div>
	);
}

interface AccordionTriggerProps {
	children: React.ReactNode;
	className?: string;
}

export function AccordionTrigger({
	children,
	className,
}: AccordionTriggerProps) {
	const context = React.useContext(AccordionContext);
	if (!context) {
		throw new Error("AccordionTrigger must be used within an AccordionItem");
	}

	const itemContext = React.useContext(AccordionItemContext);
	if (!itemContext) {
		throw new Error("AccordionTrigger must be used within an AccordionItem");
	}

	const isExpanded = context.expandedValue === itemContext.value;

	return (
		<button
			type="button"
			onClick={() => context.toggleItem(itemContext.value)}
			className={cn(
				"flex w-full items-center justify-between p-4 text-left font-medium transition-all hover:bg-accent/50",
				"group",
				className,
			)}
			aria-expanded={isExpanded}
		>
			{children}
		</button>
	);
}

interface AccordionContentProps {
	children: React.ReactNode;
	className?: string;
}

const AccordionItemContext = React.createContext<
	{ value: React.Key } | undefined
>(undefined);

export function AccordionContent({
	children,
	className,
}: AccordionContentProps) {
	const context = React.useContext(AccordionContext);
	if (!context) {
		throw new Error("AccordionContent must be used within an Accordion");
	}

	const itemContext = React.useContext(AccordionItemContext);
	if (!itemContext) {
		throw new Error("AccordionContent must be used within an AccordionItem");
	}

	const isExpanded = context.expandedValue === itemContext.value;

	const defaultVariants = {
		expanded: { height: "auto", opacity: 1 },
		collapsed: { height: 0, opacity: 0 },
	};

	const defaultTransition: Transition = {
		duration: 0.3,
		ease: "easeInOut",
	};

	return (
		<AnimatePresence initial={false}>
			{isExpanded && (
				<motion.div
					initial="collapsed"
					animate="expanded"
					exit="collapsed"
					variants={context.variants || defaultVariants}
					transition={context.transition || defaultTransition}
					className={cn("overflow-hidden", className)}
				>
					<div className="p-4 pt-0">{children}</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// Update AccordionItem to provide context
export function AccordionItemWithContext({
	value,
	children,
	className,
}: AccordionItemProps) {
	const context = React.useContext(AccordionContext);
	if (!context) {
		throw new Error("AccordionItem must be used within an Accordion");
	}

	const isExpanded = context.expandedValue === value;

	return (
		<AccordionItemContext.Provider value={{ value }}>
			<div
				className={cn("border rounded-lg", className)}
				data-expanded={isExpanded || undefined}
			>
				{children}
			</div>
		</AccordionItemContext.Provider>
	);
}

// Export the correct version
export { AccordionItemWithContext as AccordionItem };
