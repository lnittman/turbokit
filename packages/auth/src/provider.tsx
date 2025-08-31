"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

// Only create Convex client if URL is provided
const convex = process.env.NEXT_PUBLIC_CONVEX_URL
  ? new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)
  : null;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  // If neither Clerk nor Convex is configured, just render children
  if (!clerkPublishableKey && !convexUrl) {
    const key = '__TK_LOGGED_AUTH_DISABLED__';
    const scope: any = typeof window === 'undefined' ? globalThis : (window as any);
    if (!scope[key]) {
      console.warn('Auth disabled: Missing Clerk and Convex configuration');
      scope[key] = true;
    }
    return <>{children}</>;
  }
  
  // If only Convex is configured (no auth)
  if (!clerkPublishableKey && convexUrl && convex) {
    const key = '__TK_LOGGED_CONVEX_ONLY__';
    const scope: any = typeof window === 'undefined' ? globalThis : (window as any);
    if (!scope[key]) {
      console.warn('Running with Convex but no authentication');
      scope[key] = true;
    }
    return (
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    );
  }
  
  // If only Clerk is configured (no backend)
  if (clerkPublishableKey && !convexUrl) {
    const key = '__TK_LOGGED_CLERK_ONLY__';
    const scope: any = typeof window === 'undefined' ? globalThis : (window as any);
    if (!scope[key]) {
      console.warn('Running with Clerk but no Convex backend');
      scope[key] = true;
    }
    return (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        {children}
      </ClerkProvider>
    );
  }
  
  // Both configured - full setup
  if (clerkPublishableKey && convexUrl && convex) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    );
  }
  
  // Fallback (shouldn't reach here)
  return <>{children}</>;
}
