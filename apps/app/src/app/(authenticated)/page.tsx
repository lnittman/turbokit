"use client";

import type React from "react";
import { PromptBar } from "@/components/shared/prompt-bar";

export default function Home(): React.ReactElement {
  return (
    <div className="flex min-h-screen w-full flex-col items-center p-4 pt-[20vh]">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Discover spots</h1>
          <p className="mt-2 text-muted-foreground">
            Find the perfect places based on your interests
          </p>
        </div>
        <PromptBar />
      </div>
    </div>
  );
}
