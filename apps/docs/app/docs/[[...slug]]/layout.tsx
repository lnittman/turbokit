import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { layoutConfig } from '../layout.config';

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsLayout {...layoutConfig}>{children}</DocsLayout>;
}
