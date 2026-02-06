"use client";

import type React from "react";
import type { IconWeight } from "./context";
import type { IconName } from "./names";
import { PhosphorIcon } from "./packs/phosphor";
import { StreamlinePlumpIcon } from "./packs/streamline-plump";

export type IconRenderer = (props: {
	name: IconName;
	className?: string;
	weight?: IconWeight;
}) => React.ReactNode;

const registry: Record<string, IconRenderer> = {
	phosphor: (props) => <PhosphorIcon {...props} />,
	streamline: (props) => <StreamlinePlumpIcon {...props} />,
};

export function registerIconPack(packName: string, renderer: IconRenderer) {
	registry[packName] = renderer;
}

export function getIconRenderer(packName: string): IconRenderer {
	return registry[packName] ?? registry.phosphor;
}
