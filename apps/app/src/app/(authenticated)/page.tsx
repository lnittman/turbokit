"use client";

import type React from "react";

import { useAtom } from "jotai";

import { starterLayoutAtom } from "@/atoms/preferences";
import { turbokitConfig } from "@/config/turbokit.config";
import { LayoutSwitcher, StarterLayoutSurface } from "@/layouts";

export default function Home(): React.ReactElement {
  const [layout, setLayout] = useAtom(starterLayoutAtom);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="border-b border-border bg-background-secondary px-4 py-3 md:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-sm font-medium text-foreground">starter layouts</h1>
            <p className="text-xs text-foreground-tertiary">configurable shells for rapid project kickoff</p>
          </div>
          {turbokitConfig.layout.showSwitcher ? (
            <LayoutSwitcher value={layout} onChange={setLayout} />
          ) : null}
        </div>
      </header>

      <main className="min-h-0 flex-1">
        <StarterLayoutSurface layout={layout} />
      </main>
    </div>
  );
}
