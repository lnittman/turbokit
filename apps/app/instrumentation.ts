import { initializeSentry } from "@lnittman/observability/instrumentation";

export function register() {
	initializeSentry();
}
