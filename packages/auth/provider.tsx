'use client';

import type { ComponentProps, ReactNode } from 'react';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import type { Theme } from '@clerk/types';
import { useTheme } from 'next-themes';

export const AuthProvider = (
  properties: ComponentProps<typeof ClerkProvider>
) => {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  const baseTheme = isDark ? dark : undefined;

  const elements: Theme['elements'] = {
    formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    rootBox: 'w-full mx-auto',
    card: 'bg-card hover:bg-card/80 border-border',
    socialButtonsIconButton: 'bg-muted hover:bg-muted/80',
    dividerRow: 'text-white',
    dividerText: 'text-white',
    formFieldInput: 'bg-card border-border',
    footerActionLink: 'text-primary hover:text-primary/80',
    identityPreview: 'bg-card',
    formFieldLabel: 'text-white',
    formButtonReset: 'text-white hover:text-white/80',
    navbar: 'hidden',
    socialButtonsBlockButton: 'text-white',
    formFieldLabelRow: 'text-white',
    headerTitle: 'text-white',
    headerSubtitle: 'text-white',
    profileSectionTitle: 'text-white',
    otpCodeFieldInput: 'text-white',
    dividerLine: 'bg-border',
    navbarButton: 'text-foreground',
    organizationSwitcherTrigger__open: 'bg-background',
    organizationPreviewMainIdentifier: 'text-foreground',
    organizationSwitcherTriggerIcon: 'text-muted-foreground',
    organizationPreview__organizationSwitcherTrigger: 'gap-2',
    organizationPreviewAvatarContainer: 'shrink-0',
  };

  const variables: Theme['variables'] = {
    colorPrimary: 'var(--primary)',
    colorText: '#ffffff',
    colorTextSecondary: '#ffffff',
    colorBackground: 'var(--background)',
    colorInputBackground: 'var(--card)',
    colorInputText: '#ffffff',
    colorTextOnPrimaryBackground: '#000000',
  };

  // Check if Clerk is configured
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // If Clerk is not configured, render children without authentication
  if (!isClerkConfigured) {
    const key = '__TK_LOGGED_CLERK_MISSING__';
    const scope: any = typeof window === 'undefined' ? globalThis : (window as any);
    if (!scope[key]) {
      console.warn('Clerk authentication disabled: Missing configuration');
      scope[key] = true;
    }
    return <>{properties.children}</>;
  }

  return (
    <ClerkProvider
      {...properties}
      appearance={{ baseTheme, elements, variables }}
      signInUrl="/signin"
      signUpUrl="/signup"
      signInFallbackRedirectUrl="/"
    />
  );
};
