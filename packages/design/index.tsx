import { AuthProvider } from "@repo/auth/provider";
import type { ThemeProviderProps } from "next-themes";
import type React from "react";

import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./providers/theme";

type DesignSystemProviderProperties = ThemeProviderProps;

export const DesignSystemProvider: ({
	children,
	...properties
}: DesignSystemProviderProperties) => React.ReactElement = ({
	children,
	...properties
}: DesignSystemProviderProperties): React.ReactElement => (
	<ThemeProvider {...properties}>
		<AuthProvider>
			<TooltipProvider>{children}</TooltipProvider>
			<Toaster />
		</AuthProvider>
	</ThemeProvider>
);
