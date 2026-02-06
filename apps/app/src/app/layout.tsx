import { createMetadata } from "@lnittman/seo/metadata";
import type React from "react";
import { Providers } from "@/components/providers";

import "@/styles/globals.css";

export const metadata = createMetadata({
	title: "turbokit",
	description: "template project",
	applicationName: "turbokit",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}): React.ReactElement {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-screen bg-background" suppressHydrationWarning>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
