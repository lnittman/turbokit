import { keys as auth } from '@repo/auth/keys';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  extends: [auth()],
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
