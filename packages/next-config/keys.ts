import { vercel } from '@t3-oss/env-core/presets-zod';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    extends: [vercel()],
    server: {
      // Added by Vercel
      NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
    },
    client: {},
    runtimeEnv: {
      NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    },
  });
