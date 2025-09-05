import './globals.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'TurboKit - Convex-Native Development Platform',
    template: '%s | TurboKit',
  },
  description: 'A modern monorepo template for building real-time applications with Convex, Next.js, and AI agents',
  keywords: ['turbokit', 'convex', 'nextjs', 'monorepo', 'turborepo', 'real-time', 'ai', 'template'],
  authors: [{ name: 'TurboKit' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://turbokit.dev',
    title: 'TurboKit',
    description: 'A modern monorepo template for building real-time applications',
    siteName: 'TurboKit',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RootProvider
          theme={{
            enabled: true,
            defaultTheme: 'system',
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}