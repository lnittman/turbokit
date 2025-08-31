"use client";

import React from "react";
import { useIconSettings, IconProvider } from "./context";
import { PhosphorIcon, type IconName } from "./packs/phosphor";
import { StreamlinePlumpIcon } from "./packs/streamline-plump";

export type { IconName } from "./packs/phosphor";
export { IconProvider } from "./context";

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const { pack, weight } = useIconSettings();
  if (pack === "streamline") {
    return <StreamlinePlumpIcon name={name} className={className} />;
  }
  return <PhosphorIcon name={name} className={className} weight={weight} />;
}

