/**
 * Admin New Preset Page
 *
 * Placeholder - Backend presets domain not yet implemented
 */

import Link from "next/link";

export default function NewPresetPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          className="rounded px-3 py-1.5 text-sm hover:bg-muted"
          href="/admin/presets"
        >
          ← Back
        </Link>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Create New Preset
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Add a new design preset to your registry
          </p>
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
