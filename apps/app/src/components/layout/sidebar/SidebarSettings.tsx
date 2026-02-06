"use client";

import {
  GearSix,
  Bell,
  Palette,
  Shield,
  CreditCard,
  Keyboard,
  Info,
  Moon,
  Sun,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { NavItem } from "./NavItem";

const SETTINGS_ITEMS = [
  { id: "account", label: "Account", Icon: GearSix, href: "/settings" },
  { id: "appearance", label: "Appearance", Icon: Palette, href: "/settings" },
  { id: "notifications", label: "Notifications", Icon: Bell, href: "/settings" },
  { id: "security", label: "Security", Icon: Shield, href: "/settings" },
  { id: "billing", label: "Billing", Icon: CreditCard, href: "/settings" },
];

const META_ITEMS = [
  { id: "shortcuts", label: "Keyboard shortcuts", Icon: Keyboard, href: "/settings" },
  { id: "about", label: "About", Icon: Info, href: "/settings" },
];

export function SidebarSettings() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-2 p-2">
      <div className="space-y-0.5">
        {SETTINGS_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            label={item.label}
            icon={<item.Icon weight="duotone" className="h-4 w-4" />}
            onClick={() => router.push(item.href)}
          />
        ))}
      </div>

      <div className="border-t border-border pt-2">
        <div className="space-y-0.5">
          {META_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              icon={<item.Icon weight="duotone" className="h-4 w-4" />}
              onClick={() => router.push(item.href)}
            />
          ))}
        </div>
      </div>

      <NavItem
        label={isDark ? "Light mode" : "Dark mode"}
        icon={
          isDark ? (
            <Sun weight="duotone" className="h-4 w-4" />
          ) : (
            <Moon weight="duotone" className="h-4 w-4" />
          )
        }
        onClick={() => setTheme(isDark ? "light" : "dark")}
      />
    </div>
  );
}
