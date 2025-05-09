"use client";

import React, { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import * as ClerkSignUp from '@clerk/elements/sign-up';

// Import atoms
import { 
  appNameAtom, 
  authErrorAtom, 
  showSignUpPasswordAtom, 
  showSignUpConfirmPasswordAtom 
} from '@/atoms/auth';

// Import sub-components
import { SignUpStartStep } from './components/start';
import { SignUpVerificationsStep } from './components/verifications';

export interface SignUpProps {
  onSignUpComplete?: () => void;
  onRedirect?: (path: string) => void;
  renderLogo?: () => React.ReactNode;
}

export const SignUp = ({
  onRedirect,
  onSignUpComplete,
  renderLogo
}: SignUpProps) => {
  const appName = useAtomValue(appNameAtom);
  const setError = useSetAtom(authErrorAtom);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    console.log("[SignUp Component] Mounted");

    const handleClerkEvent = (eventName: string) => (event: Event | CustomEvent) => {
      console.log(`[SignUp Component] Clerk event: ${eventName}`, event);
      if (eventName === 'clerk:signup:successful' || eventName === 'clerk:verification:complete') {
        if (onSignUpComplete) {
          onSignUpComplete();
        } else if (onRedirect) {
          onRedirect('/');
        }
      }
      if (eventName === 'clerk:error') {
        const errorDetail = (event as CustomEvent).detail;
        console.error("[SignUp Component] Clerk error event:", errorDetail);
        const message = errorDetail?.message || errorDetail?.errors?.[0]?.message || 'An unknown error occurred.';
        setError(message);
      }
    };

    const eventsToListen: Record<string, (event: Event | CustomEvent) => void> = {
      'clerk:signup:started': handleClerkEvent('clerk:signup:started'),
      'clerk:signup:attempted': handleClerkEvent('clerk:signup:attempted'),
      'clerk:signup:verification': handleClerkEvent('clerk:signup:verification'),
      'clerk:signup:successful': handleClerkEvent('clerk:signup:successful'),
      'clerk:verification:complete': handleClerkEvent('clerk:verification:complete'),
      'clerk:error': handleClerkEvent('clerk:error'),
    };

    Object.entries(eventsToListen).forEach(([eventName, handler]) => {
      document.addEventListener(eventName, handler as EventListener);
    });

    return () => {
      console.log("[SignUp Component] Unmounting, cleaning up listeners");
      Object.entries(eventsToListen).forEach(([eventName, handler]) => {
        document.removeEventListener(eventName, handler as EventListener);
      });
    };
  }, [onSignUpComplete, onRedirect, setError]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm">
      <div className="w-full p-6">
        <ClerkSignUp.Root 
          routing="path"
          path="/signup"
        >
          <SignUpStartStep renderLogo={renderLogo} />
          <SignUpVerificationsStep renderLogo={renderLogo} />
        </ClerkSignUp.Root>
      </div>
    </div>
  );
}; 