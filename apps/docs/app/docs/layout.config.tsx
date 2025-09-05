import { pageTree } from '@/lib/source';
import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { BookOpen, Code, Database, Package, Rocket } from 'lucide-react';

export const layoutConfig: DocsLayoutProps = {
  tree: pageTree,
  nav: {
    title: 'TurboKit',
    transparentMode: 'top',
  },
  links: [
    {
      text: 'Documentation',
      url: '/docs',
      active: 'nested-url',
    },
    {
      text: 'Examples',
      url: '/examples',
    },
    {
      text: 'GitHub',
      url: 'https://github.com/turbokit/turbokit',
      external: true,
    },
  ],
  sidebar: {
    defaultOpenLevel: 1,
    banner: (
      <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg mb-4">
        <Rocket className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">v1.0.0 - Production Ready</span>
      </div>
    ),
    tabs: false,
    // Custom sidebar icons for different sections
    collapsible: true,
  },
};
