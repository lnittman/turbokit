import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_POSTHOG_KEY: z
        .string()
        .optional()
        .refine(
          (val) => !val || val.startsWith('phc_'),
          'Must start with "phc_" if provided'
        ),
      NEXT_PUBLIC_POSTHOG_HOST: z
        .string()
        .optional()
        .refine(
          (val) => !val || z.string().url().safeParse(val).success,
          'Must be a valid URL if provided'
        ),
    },
    runtimeEnv: {
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || undefined,
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || undefined,
    },
  });
