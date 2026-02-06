import { initializeSentry } from "@lnittman/observability/instrumentation";

export function register() {
	initializeSentry();

	if (process.env.NODE_ENV === "development") {
		const telemetry = {
			analytics: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
			observability: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
		};
		const active = Object.entries(telemetry)
			.filter(([, v]) => v)
			.map(([k]) => k);
		const inactive = Object.entries(telemetry)
			.filter(([, v]) => !v)
			.map(([k]) => k);

		if (active.length > 0) {
			console.log(`[telemetry] active: ${active.join(", ")}`);
		}
		if (inactive.length > 0) {
			console.log(`[telemetry] inactive (no env): ${inactive.join(", ")}`);
		}
	}
}
