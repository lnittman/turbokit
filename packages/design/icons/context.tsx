"use client";

import type React from "react";
import { createContext, useContext } from "react";

export type IconPack = "phosphor" | "streamline";
export type IconWeight =
	| "thin"
	| "light"
	| "regular"
	| "bold"
	| "fill"
	| "duotone";

export interface IconSettings {
	pack: IconPack;
	weight?: IconWeight;
}

const IconContext = createContext<IconSettings>({
	pack: "phosphor",
	weight: "duotone",
});

export function IconProvider({
	settings,
	children,
}: {
	settings?: Partial<IconSettings>;
	children: React.ReactNode;
}) {
	const value: IconSettings = {
		pack: settings?.pack ?? "phosphor",
		weight: settings?.weight ?? "duotone",
	};
	return <IconContext.Provider value={value}>{children}</IconContext.Provider>;
}

export function useIconSettings(): IconSettings {
	return useContext(IconContext);
}
