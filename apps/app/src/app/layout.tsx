import { DesignSystemProvider } from "@repo/design";
import type { Metadata } from "next";
import type React from "react";

import "@/styles/globals.css";

export const metadata: Metadata = {
	title: "turbokit",
	description: "template project",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}): React.ReactElement {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-screen bg-background" suppressHydrationWarning>
				<DesignSystemProvider>{children}</DesignSystemProvider>
			</body>
		</html>
	);
}
