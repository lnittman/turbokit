import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import { BookOpen, Code, Database, Package, Rocket } from "lucide-react";
import { pageTree } from "@/lib/source";

export const layoutConfig: DocsLayoutProps = {
  tree: pageTree,
  nav: {
    title: "TurboKit",
    transparentMode: "top",
  },
  links: [
    {
      text: "Documentation",
      url: "/docs",
      active: "nested-url",
    },
    {
      text: "Examples",
      url: "/examples",
    },
    {
      text: "GitHub",
      url: "https://github.com/turbokit/turbokit",
      external: true,
    },
  ],
  sidebar: {
    defaultOpenLevel: 1,
    banner: (
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/5 p-3">
        <Rocket className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">v1.0.0 - Production Ready</span>
      </div>
    ),
    tabs: false,
    // Custom sidebar icons for different sections
    collapsible: true,
  },
};
