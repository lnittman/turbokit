'use client';

import React from 'react';
import { useAtomValue } from 'jotai';
import * as Clerk from '@clerk/elements/common';
import * as ClerkSignIn from '@clerk/elements/sign-in';
import { Button } from '@repo/design/components/ui/button';

import { appNameAtom, authDebugInfoAtom, authErrorAtom } from '@/atoms/auth';

interface SignInSsoCallbackStepProps {
  renderLogo?: () => React.ReactNode;
  goToHome: () => void;
}

export const SignInSsoCallbackStep: React.FC<SignInSsoCallbackStepProps> = ({ 
  renderLogo, 
  goToHome 
}) => {
  const appName = useAtomValue(appNameAtom);
  const debugInfo = useAtomValue(authDebugInfoAtom);
  const error = useAtomValue(authErrorAtom);

  return (
    <ClerkSignIn.Step name="sso-callback">
      <div className="text-center mb-10">
        {renderLogo ? renderLogo() : (
          <div className="text-4xl font-bold mb-2 text-foreground">{appName}</div>
        )}
        <h2 className="text-xl font-medium text-foreground mt-4">Completing sign-in...</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we're completing your authentication
        </p>
        {debugInfo && (
          <div className="mt-4 p-2 text-xs bg-muted text-muted-foreground rounded font-mono overflow-x-auto max-w-full">
            {debugInfo}
          </div>
        )}
        {error && (
          <div className="mt-2 p-2 text-xs bg-destructive/20 text-destructive rounded font-mono overflow-x-auto max-w-full">
            {error}
          </div>
        )}
      </div>
      <ClerkSignIn.Captcha />
      <Clerk.GlobalError className="text-destructive text-sm mt-4 text-center" />
      <div className="mt-4 text-center">
        <Button 
          onClick={goToHome}
          className="mt-4 p-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition-all duration-200 border border-slate-300 dark:border-slate-700 hover:shadow-sm"
        >
          Go to Home Page
        </Button>
      </div>
    </ClerkSignIn.Step>
  );
};
