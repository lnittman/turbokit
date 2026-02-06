import { atomWithStorage } from "jotai/utils";

import { turbokitConfig } from "@/config/turbokit.config";
import type { StarterLayout } from "@/layouts/types";

export type AccentColor = "red" | "yellow" | "blue" | "green" | "orange";
export type FontScale = "sm" | "md" | "lg";

export const starterLayoutAtom = atomWithStorage<StarterLayout>(
	"turbokit:starter-layout",
	turbokitConfig.layout.default,
);

export const accentColorAtom = atomWithStorage<AccentColor>(
	"turbokit:accent-color",
	"orange",
);

export const fontScaleAtom = atomWithStorage<FontScale>(
	"turbokit:font-scale",
	"md",
);
