import { type HomeLayoutProps } from 'fumadocs-ui/home-layout';
import { type DocsLayoutProps } from 'fumadocs-ui/layout';
import { Icon as DocIcon, IconNames } from '@repo/design/icons';

// Navigation configuration for the documentation site
export const baseOptions: HomeLayoutProps = {
  nav: {
    title: (
      <div className="flex items-center gap-2">
        <DocIcon name={IconNames.Sparkles} className="h-5 w-5 text-primary" />
        <span className="font-bold">TurboKit</span>
      </div>
    ),
    url: '/',
  },
  links: [
    {
      text: 'Documentation',
      url: '/docs',
      icon: <DocIcon name={IconNames.Book} className="h-4 w-4" />,
    },
    {
      text: 'Components',
      url: '/docs/components',
      icon: <DocIcon name={IconNames.Package} className="h-4 w-4" />,
    },
    {
      text: 'GitHub',
      url: 'https://github.com/turbokit/turbokit',
      external: true,
    },
  ],
};

export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: {
    // This will be populated from the MDX files
  },
  sidebar: {
    defaultOpenLevel: 2,
    banner: (
      <div className="mb-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4">
        <div className="flex items-start gap-2">
          <DocIcon name={IconNames.Sparkles} className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Welcome to TurboKit</p>
            <p className="text-xs text-muted-foreground mt-1">
              Build real-time apps with Convex and AI assistance
            </p>
          </div>
        </div>
      </div>
    ),
  },
  // Enable search
  search: {
    enabled: true,
    placeholder: 'Search documentation...',
  },
  // TOC configuration
  toc: {
    enabled: true,
    footer: (
      <div className="mt-8 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Need help? Join our{' '}
          <a href="https://discord.gg/turbokit" className="text-primary hover:underline">
            Discord
          </a>
        </p>
      </div>
    ),
  },
};
