"use client";

import type { ReactNode } from "react";
import { DualCardOverlay } from "@/components/overlay/DualCardOverlay";

export default function ProfileInterceptLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<DualCardOverlay title="profile" returnTo="/">
			{children}
		</DualCardOverlay>
	);
}
