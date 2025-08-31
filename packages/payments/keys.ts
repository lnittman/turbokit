import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      STRIPE_SECRET_KEY: z
        .string()
        .optional()
        .refine(
          (val) => !val || val.startsWith('sk_'),
          'Must start with "sk_" if provided'
        ),
      STRIPE_WEBHOOK_SECRET: z
        .string()
        .optional()
        .refine(
          (val) => !val || val.startsWith('whsec_'),
          'Must start with "whsec_" if provided'
        ),
    },
    runtimeEnv: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || undefined,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || undefined,
    },
  });
