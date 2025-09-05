import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import type { ReactNode, ReactElement } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'TurboKit Documentation',
    template: '%s | TurboKit Docs',
  },
  description: 'Build real-time Convex applications with AI-powered development tools',
  keywords: ['turbokit', 'convex', 'nextjs', 'real-time', 'ai', 'development'],
  authors: [{ name: 'TurboKit Team' }],
  creator: 'TurboKit',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://docs.turbokit.dev',
    title: 'TurboKit Documentation',
    description: 'Build real-time Convex applications with AI-powered development tools',
    siteName: 'TurboKit Docs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TurboKit Documentation',
    description: 'Build real-time Convex applications with AI-powered development tools',
    creator: '@turbokit',
  },
};

type LayoutProps = {
  readonly children: ReactNode;
};

export default function Layout({ children }: LayoutProps): ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <RootProvider
          theme={{
            enabled: true,
            defaultTheme: 'system',
          }}
        >
          {children}
        </RootProvider>
        <VercelAnalytics />
      </body>
    </html>
  );
}
