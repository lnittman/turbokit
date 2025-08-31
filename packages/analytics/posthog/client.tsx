'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import posthog, { type PostHog } from 'posthog-js';
import { PostHogProvider as PostHogProviderRaw } from 'posthog-js/react';

import { keys } from '../keys';

type PostHogProviderProps = {
  readonly children: ReactNode;
};

export const PostHogProvider = (
  properties: Omit<PostHogProviderProps, 'client'>
) => {
  useEffect(() => {
    const posthogKey = keys().NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = keys().NEXT_PUBLIC_POSTHOG_HOST;
    
    // Only initialize PostHog if keys are provided
    if (posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: '/ingest',
        ui_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
        capture_pageleave: true, // Overrides the `capture_pageview` setting
      }) as PostHog;
    } else {
      const key = '__TK_LOGGED_POSTHOG_MISSING__';
      const scope: any = typeof window === 'undefined' ? globalThis : (window as any);
      if (!scope[key]) {
        console.warn('PostHog analytics disabled: Missing configuration');
        scope[key] = true;
      }
    }
  }, []);

  // If PostHog is not configured, just render children without the provider
  const posthogKey = keys().NEXT_PUBLIC_POSTHOG_KEY;
  if (!posthogKey) {
    return <>{properties.children}</>;
  }

  return <PostHogProviderRaw client={posthog} {...properties} />;
};

export { usePostHog as useAnalytics } from 'posthog-js/react';
