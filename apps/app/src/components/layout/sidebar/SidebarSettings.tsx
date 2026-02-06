"use client";

import { Bell, GearSix, Moon, Palette, Sun } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { NavItem } from "./NavItem";

const SETTINGS_ITEMS = [
	{
		id: "account",
		label: "account",
		Icon: GearSix,
		href: "/settings?section=account",
	},
	{
		id: "appearance",
		label: "appearance",
		Icon: Palette,
		href: "/settings?section=appearance",
	},
	{
		id: "notifications",
		label: "notifications",
		Icon: Bell,
		href: "/settings?section=notifications",
	},
];

export function SidebarSettings() {
	const router = useRouter();
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

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
				<NavItem
					label={isDark ? "light" : "dark"}
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
		</div>
	);
}
