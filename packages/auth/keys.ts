import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
	createEnv({
		server: {
			CLERK_SECRET_KEY: z
				.string()
				.optional()
				.refine(
					(val) => !val || val.startsWith("sk_"),
					'Must start with "sk_" if provided',
				),
			CLERK_WEBHOOK_SECRET: z
				.string()
				.optional()
				.refine(
					(val) => !val || val.startsWith("whsec_"),
					'Must start with "whsec_" if provided',
				),
		},
		client: {
			NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
				.string()
				.optional()
				.refine(
					(val) => !val || val.startsWith("pk_"),
					'Must start with "pk_" if provided',
				),
			NEXT_PUBLIC_CLERK_SIGN_IN_URL: z
				.string()
				.optional()
				.refine(
					(val) => !val || val.startsWith("/"),
					'Must start with "/" if provided',
				),
			NEXT_PUBLIC_CLERK_SIGN_UP_URL: z
				.string()
				.optional()
				.refine(
					(val) => !val || val.startsWith("/"),
					'Must start with "/" if provided',
				),
			NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z
				.string()
				.optional()
				.refine(
					(val) => !val || val.startsWith("/"),
					'Must start with "/" if provided',
				),
			NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z
				.string()
				.optional()
				.refine(
					(val) => !val || val.startsWith("/"),
					'Must start with "/" if provided',
				),
		},
		runtimeEnv: {
			CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || undefined,
			CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET || undefined,
			NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
				process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || undefined,
			NEXT_PUBLIC_CLERK_SIGN_IN_URL:
				process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || undefined,
			NEXT_PUBLIC_CLERK_SIGN_UP_URL:
				process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || undefined,
			NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
				process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || undefined,
			NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
				process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || undefined,
		},
	});
