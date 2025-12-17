/**
 * Admin Preset Detail Page
 *
 * Placeholder - Backend presets domain not yet implemented
 */

import Link from "next/link";

export default function PresetDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          className="rounded px-3 py-1.5 text-sm hover:bg-muted"
          href="/admin/presets"
        >
          ← Back
        </Link>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Preset Details</h1>
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          Presets backend not yet implemented.
        </p>
      </div>
    </div>
  );
}
