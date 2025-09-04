"use client";

import React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@repo/design/components/ui/command";
import { Button } from "@repo/design/components/ui/button";
import { Icon, IconNames } from "@repo/design/icons";
import type { IconName } from "@repo/design/icons/names";
import { cn } from "@repo/design/lib/utils";

export type GlobalSearchItem = {
  id: string;
  label: string;
  icon?: IconName;
  shortcut?: string;
  href?: string;
  onSelect?: () => void;
  group?: string;
};

export type GlobalSearchProps = {
  items?: GlobalSearchItem[];
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  placeholder?: string;
  className?: string;
};

export function GlobalSearch({
  items = [],
  open: controlledOpen,
  onOpenChange,
  placeholder = "Search…",
}: GlobalSearchProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isModK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isModK) {
        e.preventDefault();
        const next = !open;
        setUncontrolledOpen(next);
        onOpenChange?.(next);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  function setOpen(v: boolean) {
    setUncontrolledOpen(v);
    onOpenChange?.(v);
  }

  // Group items by group label
  const grouped = React.useMemo(() => {
    const map = new Map<string, GlobalSearchItem[]>();
    for (const it of items) {
      const key = it.group ?? "General";
      const list = map.get(key) ?? [];
      list.push(it);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Global search">
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {grouped.map(([group, list]) => (
          <CommandGroup key={group} heading={group}>
            {list.map((it) => (
              <CommandItem
                key={it.id}
                value={it.label}
                onSelect={() => {
                  setOpen(false);
                  try {
                    it.onSelect?.();
                    if (it.href) window.location.assign(it.href);
                  } catch {}
                }}
              >
                {it.icon && <Icon name={it.icon} className="text-muted-foreground" />}
                <span>{it.label}</span>
                {it.shortcut && <CommandShortcut>{it.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        {grouped.length > 0 && <CommandSeparator />}
      </CommandList>
    </CommandDialog>
  );
}

type SearchButtonProps = {
  onClick?: () => void;
  className?: string;
  label?: string;
  showKbd?: boolean;
};

export function SearchButton({ onClick, className, label = "Search", showKbd = true }: SearchButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "h-9 gap-2 pl-2 pr-2 text-sm text-muted-foreground hover:text-foreground",
        "hidden md:inline-flex",
        className,
      )}
      onClick={onClick}
      aria-label={label}
    >
      <Icon name={IconNames.Search} className="size-4" />
      <span className="hidden sm:inline">{label}</span>
      {showKbd && (
        <kbd className="ml-2 hidden items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:flex">
          ⌘K
        </kbd>
      )}
    </Button>
  );
}

export function SearchTrigger({
  items = [],
  placeholder,
  buttonClassName,
  label,
}: {
  items?: GlobalSearchItem[];
  placeholder?: string;
  buttonClassName?: string;
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <SearchButton className={buttonClassName} label={label} onClick={() => setOpen(true)} />
      <GlobalSearch items={items} open={open} onOpenChange={setOpen} placeholder={placeholder} />
    </>
  );
}
