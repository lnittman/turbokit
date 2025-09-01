/*
 * TurboKit env diagnostics banner
 * Prints clear guidance about optional services and how to enable them.
 */

import fs from 'fs';
import path from 'path';

type Section = {
  label: string;
  enabled: boolean;
  details: string;
  howToEnable: string;
};

function bool(key: string): boolean {
  const v = process.env[key];
  return typeof v === 'string' && v.trim().length > 0;
}

export function printEnvBanner(appName: string) {
  // In-process guard
  if ((process as any).__turbokit_banner_printed__) return;
  (process as any).__turbokit_banner_printed__ = true;

  // Cross-process guard (best-effort): write once per build per app
  // Use a lock file inside .next so parallel Next build processes dedupe output.
  const lockDir = path.join(process.cwd(), '.next');
  const lockFile = path.join(lockDir, `.turbokit-banner-${appName}`);
  try {
    fs.mkdirSync(lockDir, { recursive: true });
    // Write with exclusive flag so only the first process succeeds
    fs.writeFileSync(lockFile, String(Date.now()), { flag: 'wx' });
  } catch {
    // Lock already exists; skip printing
    return;
  }

  const sections: Section[] = [
    {
      label: 'Auth (Clerk)',
      enabled: bool('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') && (bool('CLERK_SECRET_KEY') || bool('NEXT_RUNTIME')),
      details: 'User auth UI and session',
      howToEnable: 'Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY',
    },
    {
      label: 'Analytics (PostHog)',
      enabled: bool('NEXT_PUBLIC_POSTHOG_KEY') && bool('NEXT_PUBLIC_POSTHOG_HOST'),
      details: 'Product analytics and event capture',
      howToEnable: 'Set NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST',
    },
    {
      label: 'Observability (Sentry)',
      enabled: bool('NEXT_PUBLIC_SENTRY_DSN'),
      details: 'Error tracking and performance',
      howToEnable: 'Set NEXT_PUBLIC_SENTRY_DSN (optional: SENTRY_ORG, SENTRY_PROJECT)',
    },
    {
      label: 'Payments (Polar)',
      enabled: bool('POLAR_ORGANIZATION_TOKEN'),
      details: 'Subscriptions & billing via Convex Polar component',
      howToEnable: 'Set POLAR_ORGANIZATION_TOKEN (optional: POLAR_WEBHOOK_SECRET, POLAR_SERVER)',
    },
    {
      label: 'AI Providers',
      enabled: bool('OPENAI_API_KEY') || bool('ANTHROPIC_API_KEY') || bool('GOOGLE_GENERATIVE_AI_API_KEY'),
      details: 'Model-backed features and workflows',
      howToEnable: 'Set one of OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY',
    },
    {
      label: 'Backend (Convex)',
      enabled: bool('NEXT_PUBLIC_CONVEX_URL') || bool('CONVEX_DEPLOYMENT'),
      details: 'Realtime data + server functions',
      howToEnable: 'Run `npx convex init` and set NEXT_PUBLIC_CONVEX_URL',
    },
    {
      label: 'Email (Resend)',
      enabled: bool('RESEND_API_KEY'),
      details: 'Transactional emails via Convex component',
      howToEnable: 'Set RESEND_API_KEY (recommended via Convex dashboard)',
    },
  ];

  const hasAnyDisabled = sections.some(s => !s.enabled);

  const lines: string[] = [];
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`TurboKit ${appName} — Optional Services Configuration`);
  lines.push('');
  sections.forEach(s => {
    lines.push(`- ${s.label}: ${s.enabled ? 'enabled' : 'disabled'} — ${s.details}`);
    if (!s.enabled) {
      lines.push(`  Enable: ${s.howToEnable}`);
    }
  });
  lines.push('');
  lines.push('Files: .env.example (full list), .env.local.example (local template)');
  lines.push('Tip: copy .env.example → .env.local and fill the values you need.');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');

  // Always print in dev and build so the user sees it in both flows
  if (hasAnyDisabled) {
    console.warn(lines.join('\n'));
  } else {
    console.log(lines.join('\n'));
  }
}
