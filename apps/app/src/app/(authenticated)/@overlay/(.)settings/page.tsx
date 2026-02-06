"use client";

import { useOverlay } from "@/components/overlay/DualCardOverlay";

const settingsItems = [
  { id: "account", label: "account", description: "manage your profile and preferences" },
  { id: "appearance", label: "appearance", description: "theme, colors, and display" },
  { id: "notifications", label: "notifications", description: "configure notification channels" },
  { id: "integrations", label: "integrations", description: "connected services and APIs" },
  { id: "billing", label: "billing", description: "subscription and payment methods" },
];

export default function SettingsOverlayPage() {
  const { showDetail } = useOverlay();

  return (
    <div className="flex flex-col gap-1 p-2">
      {settingsItems.map((item) => (
        <button
          key={item.id}
          className="tk-list-item"
          onClick={() =>
            showDetail(
              <SettingsDetail id={item.id} label={item.label} />
            )
          }
        >
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-medium">{item.label}</span>
            <span className="text-xs text-foreground-tertiary">
              {item.description}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function SettingsDetail({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-foreground">
        {label}
      </h3>
      <p className="text-sm text-foreground-tertiary">
        {id} settings will be configured here.
      </p>
    </div>
  );
}
