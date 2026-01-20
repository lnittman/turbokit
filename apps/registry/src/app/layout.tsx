import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'TurboKit Registry',
  description: 'Global preset registry for TurboKit',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
