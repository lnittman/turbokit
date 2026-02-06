"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Bell, GearSix, Palette, SignOut, Trash } from "@phosphor-icons/react";
import { SignOutButton, UserProfile, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useAtom } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";

import { api } from "@repo/backend/api";
import { accentColorAtom, fontScaleAtom, type AccentColor, type FontScale } from "@/atoms/preferences";
import { NotificationPreferences } from "@/components/notifications";
import { useOverlay } from "@/components/overlay/DualCardOverlay";

const SETTINGS_ITEMS = [
  {
    id: "account",
    label: "account",
    description: "manage profile, sign out, and account lifecycle",
    Icon: GearSix,
  },
  {
    id: "appearance",
    label: "appearance",
    description: "theme, accent color, and type scale",
    Icon: Palette,
  },
  {
    id: "notifications",
    label: "notifications",
    description: "channel toggles, device tokens, and push status",
    Icon: Bell,
  },
] as const;

type SettingSection = (typeof SETTINGS_ITEMS)[number]["id"];

const PUSH_TOKEN_STORAGE_KEY = "turbokit:push-device-token";
const PUSH_PLATFORM_STORAGE_KEY = "turbokit:push-platform";

function isSettingSection(value: string | null): value is SettingSection {
  return SETTINGS_ITEMS.some((item) => item.id === value);
}

export default function SettingsOverlayPage() {
  const { showDetail } = useOverlay();
  const searchParams = useSearchParams();
  const autoOpenedSection = useRef<string | null>(null);

  const openSection = useCallback(
    (section: SettingSection) => {
      showDetail(<SettingsDetail section={section} />);
    },
    [showDetail]
  );

  useEffect(() => {
    const requestedSection = searchParams.get("section");

    if (!isSettingSection(requestedSection)) return;
    if (autoOpenedSection.current === requestedSection) return;

    autoOpenedSection.current = requestedSection;
    openSection(requestedSection);
  }, [openSection, searchParams]);

  return (
    <div className="flex flex-col gap-1 p-2">
      {SETTINGS_ITEMS.map((item) => (
        <button
          key={item.id}
          className="tk-list-item"
          onClick={() => openSection(item.id)}
        >
          <div className="flex w-full items-start gap-3">
            <item.Icon weight="duotone" className="mt-0.5 h-4 w-4 text-foreground-tertiary" />
            <div className="flex flex-col items-start gap-0.5 text-left">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <span className="text-xs text-foreground-tertiary">{item.description}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function SettingsDetail({ section }: { section: SettingSection }) {
  if (section === "account") return <AccountSettingsPanel />;
  if (section === "appearance") return <AppearanceSettingsPanel />;
  return <NotificationSettingsPanel />;
}

function AccountSettingsPanel() {
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!isClerkConfigured) {
    return (
      <div className="rounded-sm border border-border bg-background p-4">
        <h3 className="text-sm font-medium text-foreground">account</h3>
        <p className="mt-2 text-sm text-foreground-tertiary">
          clerk is not configured. add a publishable key to enable full account controls.
        </p>
      </div>
    );
  }

  return <ClerkAccountSettingsPanel />;
}

function ClerkAccountSettingsPanel() {
  const { user } = useUser();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = useCallback(async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Delete your account permanently? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await user.delete();
      router.push("/");
    } finally {
      setIsDeleting(false);
    }
  }, [router, user]);

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-background p-3">
        <h3 className="text-sm font-medium text-foreground">session</h3>
        <p className="mt-1 text-xs text-foreground-tertiary">changes apply immediately</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <SignOutButton>
            <button className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs text-foreground">
              <SignOut className="h-3.5 w-3.5" />
              sign out
            </button>
          </SignOutButton>
          <button
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs"
            style={{ color: "var(--te-red)" }}
            onClick={() => void handleDeleteAccount()}
            disabled={isDeleting}
          >
            <Trash className="h-3.5 w-3.5" />
            {isDeleting ? "deleting…" : "delete account"}
          </button>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-background p-2">
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}

const ACCENT_OPTIONS: { value: AccentColor; label: string; color: string }[] = [
  { value: "red", label: "danger", color: "#ce2021" },
  { value: "yellow", label: "warning", color: "#ffc003" },
  { value: "blue", label: "info", color: "#1270b8" },
  { value: "green", label: "success", color: "#1aa167" },
  { value: "orange", label: "brand", color: "#e95c20" },
];

const FONT_SCALES: { value: FontScale; label: string }[] = [
  { value: "sm", label: "small" },
  { value: "md", label: "default" },
  { value: "lg", label: "large" },
];

function AppearanceSettingsPanel() {
  const { resolvedTheme, setTheme } = useTheme();
  const [accent, setAccent] = useAtom(accentColorAtom);
  const [fontScale, setFontScale] = useAtom(fontScaleAtom);

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-background p-4">
        <h3 className="text-sm font-medium text-foreground">theme</h3>
        <p className="mt-1 text-xs text-foreground-tertiary">light, dark, or system preference</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["light", "dark", "system"] as const).map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className="rounded-full border px-3 py-1 text-xs"
              style={
                resolvedTheme === themeOption || (themeOption === "system" && !resolvedTheme)
                  ? {
                      borderColor: "var(--user-accent)",
                      color: "var(--foreground)",
                      backgroundColor: "var(--background-secondary)",
                    }
                  : {
                      borderColor: "var(--border)",
                      color: "var(--foreground-tertiary)",
                    }
              }
            >
              {themeOption}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-sm border border-border bg-background p-4">
        <h3 className="text-sm font-medium text-foreground">accent</h3>
        <p className="mt-1 text-xs text-foreground-tertiary">functional color used for selected states</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACCENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setAccent(option.value)}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
              style={
                accent === option.value
                  ? {
                      borderColor: option.color,
                      color: "var(--foreground)",
                      backgroundColor: "var(--background-secondary)",
                    }
                  : {
                      borderColor: "var(--border)",
                      color: "var(--foreground-tertiary)",
                    }
              }
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: option.color }} />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-sm border border-border bg-background p-4">
        <h3 className="text-sm font-medium text-foreground">font size</h3>
        <p className="mt-1 text-xs text-foreground-tertiary">applies instantly across the app shell</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FONT_SCALES.map((scale) => (
            <button
              key={scale.value}
              onClick={() => setFontScale(scale.value)}
              className="rounded-full border px-3 py-1 text-xs"
              style={
                fontScale === scale.value
                  ? {
                      borderColor: "var(--user-accent)",
                      color: "var(--foreground)",
                      backgroundColor: "var(--background-secondary)",
                    }
                  : {
                      borderColor: "var(--border)",
                      color: "var(--foreground-tertiary)",
                    }
              }
            >
              {scale.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationSettingsPanel() {
  const preferences = useQuery(api.app.notifications.queries.getPreferences);
  const registerDeviceToken = useMutation(api.app.notifications.mutations.registerDeviceToken);
  const unregisterDeviceToken = useMutation(api.app.notifications.mutations.unregisterDeviceToken);

  const [platform, setPlatform] = useState<"web" | "fcm" | "apns">("web");
  const [token, setToken] = useState("");
  const [registeredToken, setRegisteredToken] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
    const savedPlatform = localStorage.getItem(PUSH_PLATFORM_STORAGE_KEY) as
      | "web"
      | "fcm"
      | "apns"
      | null;

    if (savedToken) {
      setToken(savedToken);
      setRegisteredToken(savedToken);
    }

    if (savedPlatform === "web" || savedPlatform === "fcm" || savedPlatform === "apns") {
      setPlatform(savedPlatform);
    }
  }, []);

  const pushStatus = useMemo(() => {
    if (!preferences) return "checking status…";
    if (!preferences.push) return "push disabled in preferences";
    if (!registeredToken) return "push enabled, no device token registered";
    return `registered (${platform})`;
  }, [platform, preferences, registeredToken]);

  const handleRegister = useCallback(async () => {
    if (!token.trim()) return;

    setIsSaving(true);
    try {
      await registerDeviceToken({
        token: token.trim(),
        platform,
      });
      localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token.trim());
      localStorage.setItem(PUSH_PLATFORM_STORAGE_KEY, platform);
      setRegisteredToken(token.trim());
    } finally {
      setIsSaving(false);
    }
  }, [platform, registerDeviceToken, token]);

  const handleUnregister = useCallback(async () => {
    if (!registeredToken) return;

    setIsSaving(true);
    try {
      await unregisterDeviceToken({ token: registeredToken });
      localStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(PUSH_PLATFORM_STORAGE_KEY);
      setRegisteredToken(null);
      setToken("");
    } finally {
      setIsSaving(false);
    }
  }, [registeredToken, unregisterDeviceToken]);

  return (
    <div className="space-y-4">
      <NotificationPreferences />

      <div className="rounded-sm border border-border bg-background p-4">
        <h3 className="text-sm font-medium text-foreground">device token</h3>
        <p className="mt-1 text-xs text-foreground-tertiary">register a push target for this device</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(["web", "fcm", "apns"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setPlatform(value)}
              className="rounded-full border px-3 py-1 text-xs"
              style={
                platform === value
                  ? {
                      borderColor: "var(--user-accent)",
                      color: "var(--foreground)",
                      backgroundColor: "var(--background-secondary)",
                    }
                  : {
                      borderColor: "var(--border)",
                      color: "var(--foreground-tertiary)",
                    }
              }
            >
              {value}
            </button>
          ))}
        </div>

        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="enter device token"
          className="mt-3 w-full rounded-sm border border-border bg-background-secondary px-3 py-2 text-sm text-foreground outline-none"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => void handleRegister()}
            disabled={!token.trim() || isSaving}
            className="rounded-sm border border-border px-3 py-2 text-xs text-foreground disabled:opacity-50"
          >
            {isSaving ? "saving…" : "register token"}
          </button>
          <button
            onClick={() => void handleUnregister()}
            disabled={!registeredToken || isSaving}
            className="rounded-sm border border-border px-3 py-2 text-xs disabled:opacity-50"
            style={{ color: "var(--te-red)" }}
          >
            unregister
          </button>
        </div>

        <p className="mt-3 text-xs text-foreground-tertiary">status: {pushStatus}</p>
      </div>
    </div>
  );
}
