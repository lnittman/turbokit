import { Metadata } from 'next';
import type React from 'react';

import { DesignSystemProvider } from '@repo/design';
import { PresetProvider } from '@repo/design/presets';
import { PresetLoaderSetup } from '@/components/PresetLoaderSetup';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'turbokit',
  description: 'template project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background" suppressHydrationWarning>
        <DesignSystemProvider>
          <PresetLoaderSetup />
          <PresetProvider defaultPreset="koto">
            {children}
          </PresetProvider>
        </DesignSystemProvider>
      </body>
    </html>
  );
}
