"use client";

import { useOverlay } from "@/components/overlay/DualCardOverlay";

const createItems = [
  { id: "project", label: "project", description: "start a new project from scratch" },
  { id: "document", label: "document", description: "create a new document or note" },
  { id: "template", label: "from template", description: "start from a pre-built template" },
  { id: "import", label: "import", description: "import from an external source" },
];

export default function CreateOverlayPage() {
  const { showDetail } = useOverlay();

  return (
    <div className="flex flex-col gap-1 p-2">
      {createItems.map((item) => (
        <button
          key={item.id}
          className="tk-list-item"
          onClick={() =>
            showDetail(
              <CreateDetail id={item.id} label={item.label} />
            )
          }
        >
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-medium">{item.label}</span>
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {item.description}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function CreateDetail({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h3
        className="text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
      </h3>
      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
        {id} creation flow will be configured here.
      </p>
    </div>
  );
}
