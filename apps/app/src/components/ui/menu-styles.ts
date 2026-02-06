import { cn } from "@repo/design/lib/utils";

export const menuPopupStyles = cn(
	"z-50 min-w-[180px] rounded-xl border border-border bg-background-secondary p-1",
	"shadow-lg outline-none",
	"transition-[opacity,transform] duration-150",
	"[transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
	"origin-[var(--transform-origin)]",
	"data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
	"data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
);

export const menuItemStyles = cn(
	"flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2",
	"text-sm text-foreground-secondary outline-none",
	"data-[highlighted]:bg-background-tertiary data-[highlighted]:text-foreground",
);

export const menuSeparatorStyles = "my-1 h-px bg-border";
