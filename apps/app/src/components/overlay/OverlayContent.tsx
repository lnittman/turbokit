"use client";

import {
	type ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";

interface OverlayContentProps {
	children: ReactNode;
	className?: string;
}

/**
 * Scroll-aware overlay content area.
 * Applies animated CSS mask fades at top/bottom when content overflows.
 * Uses @property for animated custom properties (registered in globals.css).
 */
export function OverlayContent({
	children,
	className = "",
}: OverlayContentProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [scrollState, setScrollState] = useState({
		canScrollUp: false,
		canScrollDown: false,
	});

	const checkScrollState = useCallback(() => {
		const el = containerRef.current;
		if (!el) return;
		const canScrollUp = el.scrollTop > 2;
		const canScrollDown = el.scrollHeight - el.scrollTop - el.clientHeight > 2;
		setScrollState((prev) => {
			if (
				prev.canScrollUp === canScrollUp &&
				prev.canScrollDown === canScrollDown
			) {
				return prev;
			}
			return { canScrollUp, canScrollDown };
		});
	}, []);

	// Check before paint
	useLayoutEffect(() => {
		checkScrollState();
	});

	// Listen for scroll and resize
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.addEventListener("scroll", checkScrollState, { passive: true });
		const observer = new ResizeObserver(checkScrollState);
		observer.observe(el);
		return () => {
			el.removeEventListener("scroll", checkScrollState);
			observer.disconnect();
		};
	}, [checkScrollState]);

	return (
		<div
			ref={containerRef}
			className={`tk-overlay-content ${className}`}
			style={
				{
					"--mask-fade-top": scrollState.canScrollUp ? "transparent" : "black",
					"--mask-fade-bottom": scrollState.canScrollDown
						? "transparent"
						: "black",
				} as React.CSSProperties
			}
		>
			{children}
		</div>
	);
}
