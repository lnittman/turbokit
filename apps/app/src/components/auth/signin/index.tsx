"use client";

import * as ClerkSignIn from "@clerk/elements/sign-in";
import { useSetAtom } from "jotai";
import type React from "react";
import { useEffect } from "react";

import { authDebugInfoAtom, authErrorAtom } from "@/atoms/auth";
import { SignInForgotPasswordStep } from "./components/forgot-password";
import { SignInResetPasswordStep } from "./components/reset-password";
import { SignInSsoCallbackStep } from "./components/sso-callback";
import { SignInStartStep } from "./components/start";
import { SignInVerificationsStep } from "./components/verifications";

interface SignInProps {
  onSignInComplete?: () => void;
  onRedirect?: (path: string) => void;
  renderLogo?: () => React.ReactNode;
}

export const SignIn = ({
  onRedirect,
  onSignInComplete,
  renderLogo,
}: SignInProps) => {
  const setError = useSetAtom(authErrorAtom);
  const setDebugInfo = useSetAtom(authDebugInfoAtom);

  useEffect(() => {
    const handleClerkEvents = () => {
      const cb = () => {
        if (onSignInComplete) {
          onSignInComplete();
        } else if (onRedirect) {
          onRedirect("/");
        }
      };
      document.addEventListener("clerk:sign-in:complete", cb);
      return () => {
        document.removeEventListener("clerk:sign-in:complete", cb);
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
        onRedirect("/");
      }
    } catch (err: any) {
      console.error("Error during manual navigation:", err);
      setError(`Manual navigation error: ${err?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center">
      <div className="w-full p-6">
        <ClerkSignIn.Root path="/signin" routing="path">
          <SignInStartStep renderLogo={renderLogo} />
          <SignInSsoCallbackStep goToHome={goToHome} renderLogo={renderLogo} />
          <SignInVerificationsStep />
          <SignInForgotPasswordStep />
          <SignInResetPasswordStep />
        </ClerkSignIn.Root>
      </div>
    </div>
  );
};
