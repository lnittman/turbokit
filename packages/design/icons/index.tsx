"use client";

import { useIconSettings } from "./context";
import type { IconName } from "./names";
import { getIconRenderer } from "./registry";

export { IconProvider } from "./context";
export type { IconName } from "./names";
export { IconNames } from "./names";
export { registerIconPack } from "./registry";

export function Icon({
	name,
	className,
}: {
	name: IconName;
	className?: string;
}) {
	const { pack, weight } = useIconSettings();
	const Renderer = getIconRenderer(pack);
	return <>{Renderer({ name, className, weight })}</>;
}
