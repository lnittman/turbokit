"use client";

import * as Clerk from "@clerk/elements/common";
import * as ClerkSignIn from "@clerk/elements/sign-in";
import { Button } from "@spots/design/components/ui/button";
import { useAtomValue } from "jotai";
import type React from "react";

import { appNameAtom, authDebugInfoAtom, authErrorAtom } from "@/atoms/auth";

interface SignInSsoCallbackStepProps {
  renderLogo?: () => React.ReactNode;
  goToHome: () => void;
}

export const SignInSsoCallbackStep: React.FC<SignInSsoCallbackStepProps> = ({
  renderLogo,
  goToHome,
}) => {
  const appName = useAtomValue(appNameAtom);
  const debugInfo = useAtomValue(authDebugInfoAtom);
  const error = useAtomValue(authErrorAtom);

  return (
    <ClerkSignIn.Step name="sso-callback">
      <div className="mb-10 text-center">
        {renderLogo ? (
          renderLogo()
        ) : (
          <div className="mb-2 font-bold text-4xl text-foreground">
            {appName}
          </div>
        )}
        <h2 className="mt-4 font-medium text-foreground text-xl">
          Completing sign-in...
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Please wait while we're completing your authentication
        </p>
        {debugInfo && (
          <div className="mt-4 max-w-full overflow-x-auto rounded bg-muted p-2 font-mono text-muted-foreground text-xs">
            {debugInfo}
          </div>
        )}
        {error && (
          <div className="mt-2 max-w-full overflow-x-auto rounded bg-destructive/20 p-2 font-mono text-destructive text-xs">
            {error}
          </div>
        )}
      </div>
      <ClerkSignIn.Captcha />
      <Clerk.GlobalError className="mt-4 text-center text-destructive text-sm" />
      <div className="mt-4 text-center">
        <Button
          className="mt-4 rounded-md border border-slate-300 bg-muted p-2 font-medium text-sm transition-all duration-200 hover:bg-muted/80 hover:shadow-sm dark:border-slate-700"
          onClick={goToHome}
        >
          Go to Home Page
        </Button>
      </div>
    </ClerkSignIn.Step>
  );
};
