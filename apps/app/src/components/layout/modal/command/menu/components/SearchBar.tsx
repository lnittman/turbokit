"use client";

import React, { RefObject } from "react";

import { MagnifyingGlass, X } from "@phosphor-icons/react";

interface SearchBarProps {
  inputRef: RefObject<HTMLInputElement | null>;
  search: string;
  closeCommandModal: () => void;
  setSearch: (value: string) => void;
}

export function SearchBar({ inputRef, search, closeCommandModal, setSearch }: SearchBarProps) {
  return (
    <div className="flex items-center border-b px-3 py-2 relative">
      <div className="flex items-center justify-center w-6">
        <MagnifyingGlass weight="duotone" className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      <input 
        ref={inputRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="search chats..."
        className="search-input flex h-9 w-full bg-transparent py-2 text-sm outline-none text-foreground disabled:cursor-not-allowed disabled:opacity-50 font-title"
      />

      <button 
        onClick={closeCommandModal}
        className="absolute right-3 h-7 w-7 flex items-center justify-center hover:bg-accent/50 transition-colors"
      >
        <X weight="duotone" className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
} 