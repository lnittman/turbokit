/**
 * Admin Layout
 *
 * Wraps all admin pages with admin-specific navigation and access control
 */

import { Icon, IconNames } from "@spots/design/icons";
import Link from "next/link";
import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-border border-b bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
              href="/"
            >
              <Icon className="h-4 w-4" name={IconNames.ArrowLeft} />
              Back to App
            </Link>
            <span className="font-medium font-mono text-foreground">Admin</span>
          </div>

          <nav className="flex items-center gap-1">
            <Link
              className="rounded-lg px-3 py-1.5 font-medium text-foreground text-sm transition-colors hover:bg-accent/10"
              href="/admin/presets"
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
