"use client";

import React from "react";
import { useIconSettings, IconProvider } from "./context";
import { PhosphorIcon } from "./packs/phosphor";
import { StreamlinePlumpIcon } from "./packs/streamline-plump";
import { IconNames, type IconName } from "./names";

export { IconNames } from "./names";
export type { IconName } from "./names";
export { IconProvider } from "./context";

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const { pack, weight } = useIconSettings();
  if (pack === "streamline") {
    return <StreamlinePlumpIcon name={name} className={className} />;
  }
  return <PhosphorIcon name={name} className={className} weight={weight} />;
}
