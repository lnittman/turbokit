'use client';

import type React from 'react';
import { PromptBar } from '@/components/shared/prompt-bar';

export default function Home(): React.ReactElement {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <PromptBar />
      </div>
    </div>
  );
}
