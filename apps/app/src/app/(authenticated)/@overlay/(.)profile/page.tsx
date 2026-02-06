"use client";

import { useOverlay } from "@/components/overlay/DualCardOverlay";

const profileItems = [
  { id: "overview", label: "overview", description: "your profile summary and stats" },
  { id: "activity", label: "activity", description: "recent actions and contributions" },
  { id: "preferences", label: "preferences", description: "display name, avatar, and bio" },
  { id: "security", label: "security", description: "password, 2FA, and sessions" },
];

export default function ProfileOverlayPage() {
  const { showDetail } = useOverlay();

  return (
    <div className="flex flex-col gap-1 p-2">
      {profileItems.map((item) => (
        <button
          key={item.id}
          className="tk-list-item"
          onClick={() =>
            showDetail(
              <ProfileDetail id={item.id} label={item.label} />
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

function ProfileDetail({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-foreground">
        {label}
      </h3>
      <p className="text-sm text-foreground-tertiary">
        {id} profile section will be configured here.
      </p>
    </div>
  );
}
