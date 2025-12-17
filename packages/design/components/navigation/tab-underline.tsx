"use client";

import { cn } from "@spots/design/lib/utils";
import React from "react";

type TabItem = {
  key: string;
  label: React.ReactNode;
  href?: string;
  disabled?: boolean;
};

export type TabUnderlineNavProps = {
  items: TabItem[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  className?: string;
  underlineClassName?: string;
};

export function TabUnderlineNav({
  items,
  activeKey,
  onSelect,
  className,
  underlineClassName,
}: TabUnderlineNavProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = React.useState<{
    left: number;
    width: number;
  } | null>(null);
  const [hoverKey, setHoverKey] = React.useState<string | null>(null);

  function updateIndicator(targetKey: string | null) {
    const key = targetKey ?? activeKey ?? items[0]?.key;
    if (!key) return;
    const el = itemRefs.current[key];
    const container = containerRef.current;
    if (!(el && container)) return;

    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setIndicator({
      left: elRect.left - containerRect.left,
      width: elRect.width,
    });
  }

  React.useLayoutEffect(() => {
    updateIndicator(null);
    // Reposition on resize
    const ro = new ResizeObserver(() => updateIndicator(hoverKey));
    const container = containerRef.current;
    if (container) ro.observe(container);
    // Also observe each item
    Object.values(itemRefs.current).forEach((n) => n && ro.observe(n));
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, items.map((i) => i.key).join("|")]);

  return (
    <div
      className={cn(
        "relative flex items-center gap-6 border-border border-b",
        className
      )}
      onMouseLeave={() => {
        setHoverKey(null);
        updateIndicator(null);
      }}
      ref={containerRef}
      role="tablist"
    >
      {items.map((item) => {
        const selected = (hoverKey ?? activeKey ?? items[0]?.key) === item.key;
        return (
          <button
            aria-controls={`panel-${item.key}`}
            aria-selected={activeKey === item.key}
            className={cn(
              "whitespace-nowrap rounded-md px-0.5 py-3 text-muted-foreground text-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              selected && "text-foreground",
              item.disabled && "cursor-not-allowed opacity-50"
            )}
            disabled={item.disabled}
            key={item.key}
            onClick={(e) => {
              onSelect?.(item.key);
              if (item.href) {
                // Best-effort navigation without coupling to Next.js
                try {
                  window.location.assign(item.href);
                } catch (err) {
                  // noop
                }
              }
            }}
            onMouseEnter={() => {
              setHoverKey(item.key);
              updateIndicator(item.key);
            }}
            ref={(n) => {
              itemRefs.current[item.key] = n;
            }}
            role="tab"
          >
            {item.label}
          </button>
        );
      })}

      {/* Underline indicator */}
      {indicator && (
        <div
          aria-hidden
          className={cn(
            "absolute bottom-0 h-0.5 rounded bg-foreground",
            underlineClassName
          )}
          style={{
            width: indicator.width,
            transform: `translateX(${indicator.left}px)`,
            transition:
              "transform 200ms cubic-bezier(0.2, 0, 0, 1), width 200ms cubic-bezier(0.2, 0, 0, 1)",
          }}
        />
      )}
    </div>
  );
}
