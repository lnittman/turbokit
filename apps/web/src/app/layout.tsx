import type { Metadata } from 'next';
import { DesignSystemProvider } from '@repo/design';
import '@repo/design/styles/globals.css';

export const metadata: Metadata = {
  title: 'TurboKit - Convex-Native Development Platform',
  description: 'Build real-time applications with Convex, Next.js, and AI-powered development tools',
  keywords: ['convex', 'nextjs', 'real-time', 'ai development', 'turbokit'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <DesignSystemProvider>
          {children}
        </DesignSystemProvider>
      </body>
    </html>
  );
}