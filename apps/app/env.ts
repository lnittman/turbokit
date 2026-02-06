import { keys as analytics } from "@lnittman/analytics/keys";
import { keys as auth } from "@lnittman/auth/keys";
import { keys as observability } from "@lnittman/observability/keys";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
	extends: [auth(), analytics(), observability()],
	server: {
		// Add server-side environment variables here
		// Example: DATABASE_URL: z.string().url(),
	},
	client: {
		// Add client-side environment variables here (must be prefixed with NEXT_PUBLIC_)
		// Example: NEXT_PUBLIC_API_URL: z.string().url(),
	},
	runtimeEnv: {
		// Map environment variables to their values
		// Example: DATABASE_URL: process.env.DATABASE_URL,
	},
});
