import { vercel } from '@t3-oss/env-core/presets-zod';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    extends: [vercel()],
    server: {
      ANALYZE: z.string().optional(),

      // Added by Vercel
      NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
    },
    client: {
      NEXT_PUBLIC_AI_URL: z
        .string()
        .optional()
        .refine(
          (val) => !val || z.string().url().safeParse(val).success,
          'Must be a valid URL if provided'
        ),
      NEXT_PUBLIC_APP_URL: z
        .string()
        .optional()
        .refine(
          (val) => !val || z.string().url().safeParse(val).success,
          'Must be a valid URL if provided'
        ),
    },
    runtimeEnv: {
      ANALYZE: process.env.ANALYZE,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME,
      NEXT_PUBLIC_AI_URL: process.env.NEXT_PUBLIC_AI_URL || undefined,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
    },
  });
