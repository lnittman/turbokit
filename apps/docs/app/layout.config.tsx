import { Icon as DocIcon, IconNames } from "@repo/design/icons";
import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { HomeLayoutProps } from "fumadocs-ui/layouts/home";
import { pageTree } from "@/lib/source";

// Navigation configuration for the documentation site
export const baseOptions: HomeLayoutProps = {
  nav: {
    title: (
      <div className="flex items-center gap-2">
        <DocIcon className="h-5 w-5 text-primary" name={IconNames.Sparkles} />
        <span className="font-bold">TurboKit</span>
      </div>
    ),
    url: "/",
  },
  links: [
    {
      text: "Documentation",
      url: "/docs",
      icon: <DocIcon className="h-4 w-4" name={IconNames.Book} />,
    },
    {
      text: "Components",
      url: "/docs/components",
      icon: <DocIcon className="h-4 w-4" name={IconNames.Package} />,
    },
    {
      text: "GitHub",
      url: "https://github.com/turbokit/turbokit",
      external: true,
    },
  ],
};

export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: pageTree,
  sidebar: {
    defaultOpenLevel: 2,
    banner: (
      <div className="mb-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4">
        <div className="flex items-start gap-2">
          <DocIcon
            className="mt-0.5 h-5 w-5 text-primary"
            name={IconNames.Sparkles}
          />
          <div>
            <p className="font-semibold text-sm">Welcome to TurboKit</p>
            <p className="mt-1 text-muted-foreground text-xs">
              Build real-time apps with Convex and AI assistance
            </p>
          </div>
        </div>
      </div>
    ),
  },
  // Additional options can be provided via layout components
};
