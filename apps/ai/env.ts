import { keys as core } from '@repo/next-config/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [
    core(),
  ],
  server: {
    DATABASE_URL: z.string().min(1),
    FIRECRAWL_API_KEY: z.string().min(1),
    OPENROUTER_API_KEY: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  },
});
