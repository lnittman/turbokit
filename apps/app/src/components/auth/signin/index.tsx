"use client";

import React, { useEffect } from "react";
import { useSetAtom } from 'jotai';
import * as ClerkSignIn from '@clerk/elements/sign-in';

import { authErrorAtom, authDebugInfoAtom } from '@/atoms/auth';

import { SignInStartStep } from './components/start';
import { SignInSsoCallbackStep } from './components/sso-callback';
import { SignInVerificationsStep } from './components/verifications';
import { SignInForgotPasswordStep } from './components/forgot-password';
import { SignInResetPasswordStep } from './components/reset-password';

interface SignInProps {
  onSignInComplete?: () => void;
  onRedirect?: (path: string) => void;
  renderLogo?: () => React.ReactNode;
}

export const SignIn = ({ 
  onRedirect,
  onSignInComplete,
  renderLogo
}: SignInProps) => {
  const setError = useSetAtom(authErrorAtom);
  const setDebugInfo = useSetAtom(authDebugInfoAtom);
  
  useEffect(() => {
    const handleClerkEvents = () => {
      const cb = () => {
        if (onSignInComplete) {
          onSignInComplete();
        } else if (onRedirect) {
          onRedirect('/');
        }
      };
      document.addEventListener('clerk:sign-in:complete', cb);
      return () => {
        document.removeEventListener('clerk:sign-in:complete', cb);
      };
    };
    const cleanup = handleClerkEvents();
    return cleanup;
  }, [onSignInComplete, onRedirect, setError, setDebugInfo]);

  const goToHome = () => {
    try {
      console.log("Manual navigation to home page");
      if (onSignInComplete) {
        onSignInComplete();
      } else if (onRedirect) {
        onRedirect('/');
      }
    } catch (err: any) {
      console.error("Error during manual navigation:", err);
      setError(`Manual navigation error: ${err?.message || 'Unknown error'}`);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm">
      <div className="w-full p-6">
        <ClerkSignIn.Root
          routing="path"
          path="/signin"
        >
          <SignInStartStep renderLogo={renderLogo} />
          <SignInSsoCallbackStep 
            renderLogo={renderLogo} 
            goToHome={goToHome} 
          />
          <SignInVerificationsStep />
          <SignInForgotPasswordStep />
          <SignInResetPasswordStep />
        </ClerkSignIn.Root>
      </div>
    </div>
  );
} 