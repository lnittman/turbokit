"use client";

import { AnalyticsProvider, PageViewTracker } from "@lnittman/analytics/client";
import { DesignSystemProvider } from "@repo/design";
import type React from "react";
import { Suspense } from "react";

type ProvidersProps = {
	children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps): React.ReactElement {
	return (
		<DesignSystemProvider>
			<AnalyticsProvider>
				<Suspense fallback={null}>
					<PageViewTracker />
				</Suspense>
				{children}
			</AnalyticsProvider>
		</DesignSystemProvider>
	);
}
