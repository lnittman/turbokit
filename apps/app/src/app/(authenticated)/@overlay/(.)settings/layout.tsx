"use client";

import type { ReactNode } from "react";
import { DualCardOverlay } from "@/components/overlay/DualCardOverlay";

export default function SettingsInterceptLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DualCardOverlay title="settings" returnTo="/">
      {children}
    </DualCardOverlay>
  );
}
