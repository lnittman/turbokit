"use client";

import React from "react";
import { IconProvider, useIconSettings } from "./context";
import { type IconName, IconNames } from "./names";
import { getIconRenderer, registerIconPack } from "./registry";

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
