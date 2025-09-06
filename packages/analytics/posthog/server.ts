import 'server-only';

import { PostHog } from 'posthog-node';

import { keys } from '../keys';

// Gracefully disable analytics when not configured
const phKey = keys().NEXT_PUBLIC_POSTHOG_KEY;
const phHost = keys().NEXT_PUBLIC_POSTHOG_HOST;

export const analytics: Pick<PostHog, 'capture' | 'shutdown' | 'flush'> =
  phKey && phHost
    ? new PostHog(phKey, {
        host: phHost,
        // Don't batch events and flush immediately - we're running in a serverless environment
        flushAt: 1,
        flushInterval: 0,
      })
    : {
        // No-op implementations when PostHog isn't configured
        capture: () => undefined as any,
        shutdown: async () => {},
        flush: async () => {},
      } as any;
