"use client";

import React from "react";
import { useIconSettings, IconProvider } from "./context";
import { IconNames, type IconName } from "./names";
import { getIconRenderer, registerIconPack } from "./registry";

export { IconNames } from "./names";
export type { IconName } from "./names";
export { IconProvider } from "./context";
export { registerIconPack } from "./registry";

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const { pack, weight } = useIconSettings();
  const Renderer = getIconRenderer(pack);
  return <>{Renderer({ name, className, weight })}</>;
}
