/**
 * Admin Layout
 *
 * Wraps all admin pages with admin-specific navigation and access control
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { Icon, IconNames } from "@repo/design/icons";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name={IconNames.ArrowLeft} className="h-4 w-4" />
              Back to App
            </Link>
            <span className="text-foreground font-mono font-medium">Admin</span>
          </div>

          <nav className="flex items-center gap-1">
            <Link
              href="/admin/presets"
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10 text-foreground"
            >
              Presets
            </Link>
          </nav>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
