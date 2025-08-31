import { Metadata } from 'next';

import { DesignSystemProvider } from '@repo/design';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'turbokit',
  description: 'template project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background" suppressHydrationWarning>
        <DesignSystemProvider>
          {children}
        </DesignSystemProvider>
      </body>
    </html>
  );
}
