"use client";
import { AutumnProvider } from "autumn-js/react";
import { useConvex } from "convex/react";
import { api } from "@repo/backend/api";

export function AutumnWrapper({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  return (
    <AutumnProvider convex={convex} convexApi={(api as any).autumn}>
      {children}
    </AutumnProvider>
  );
}

