import { atom } from "jotai";

// Sidebar view types
export type SidebarView = "main" | "settings";

// Sidebar view state with navigation stack
export const sidebarViewAtom = atom<SidebarView>("main");
export const sidebarViewStackAtom = atom<SidebarView[]>([]);

// Navigation direction for animations (forward = drill in, back = drill out)
export type NavigationDirection = "forward" | "back" | null;
export const navigationDirectionAtom = atom<NavigationDirection>(null);

// Derived atom for checking if we can go back
export const canGoBackAtom = atom(
	(get) => get(sidebarViewStackAtom).length > 0,
);

// Action atoms for navigation
export const pushViewAtom = atom(null, (get, set, view: SidebarView) => {
	const currentView = get(sidebarViewAtom);
	const stack = get(sidebarViewStackAtom);

	if (currentView === view) return;

	set(sidebarViewStackAtom, [...stack, currentView]);
	set(navigationDirectionAtom, "forward");
	set(sidebarViewAtom, view);
});

export const popViewAtom = atom(null, (get, set) => {
	const stack = get(sidebarViewStackAtom);
	if (stack.length === 0) return;

	const newStack = [...stack];
	const previousView = newStack.pop();
	if (!previousView) return;

	set(sidebarViewStackAtom, newStack);
	set(navigationDirectionAtom, "back");
	set(sidebarViewAtom, previousView);
});
