"use client";

import type { ReactNode } from "react";
import { DualCardOverlay } from "@/components/overlay/DualCardOverlay";

export default function CreateInterceptLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DualCardOverlay title="create" returnTo="/">
      {children}
    </DualCardOverlay>
  );
}
