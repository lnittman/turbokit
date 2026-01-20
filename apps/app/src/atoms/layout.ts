import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// UI preferences (layout-related)
export interface UIPreferences {
  showTimestamps: boolean;
  compactMode: boolean;
}

export const uiPreferencesAtom = atomWithStorage<UIPreferences>('uiPreferences', {
  showTimestamps: true,
  compactMode: false,
});

// Command menu open state
export const commandMenuOpenAtom = atom<boolean>(false);

// Settings modal open state
export const settingsModalOpenAtom = atom<boolean>(false);

// Sidebar state
export const sidebarOpenAtom = atom<boolean>(false); // Mobile menu open state
export const sidebarCollapsedAtom = atom<boolean>(false); // Desktop collapsed state (false = expanded 256px, true = collapsed 64px)

// Generic modal state interface for items with an ID
export interface ItemModalState {
  open: boolean;
  itemId: string | null;
  itemType: 'chat' | 'project';
}

// Command menu modal state
export interface CommandModalState {
  open: boolean;
  activeItemId: string | null;
  searchQuery: string;
}

export const commandModalAtom = atom<CommandModalState>({
  open: false,
  activeItemId: null,
  searchQuery: ''
});

// Command menu hover state - separate from activeItemId to prevent loops
export interface CommandHoverState {
  hoveredItemId: string | null;
  // source indicates what caused the hover (mouse or keyboard)
  source: 'mouse' | 'keyboard' | null;
}

export const commandHoverAtom = atom<CommandHoverState>({
  hoveredItemId: null,
  source: null
});

// Chat and project modal states (using the generic interface)
export const deleteModalAtom = atom<ItemModalState>({
  open: false, 
  itemId: null,
  itemType: 'chat'
});

export const renameModalAtom = atom<ItemModalState>({
  open: false, 
  itemId: null,
  itemType: 'chat'
});

export const shareModalAtom = atom<ItemModalState>({
  open: false, 
  itemId: null,
  itemType: 'chat'
});

export const inviteModalAtom = atom<ItemModalState>({
  open: false, 
  itemId: null,
  itemType: 'chat'
});

// Tool detail modal state
export interface DetailModalState {
  open: boolean;
  title: string;
  sections: { label: string; content: any; maxHeight?: string }[];
}

export const detailModalAtom = atom<DetailModalState>({
  open: false,
  title: '',
  sections: []
}); 
