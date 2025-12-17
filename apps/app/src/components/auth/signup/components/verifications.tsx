"use client";

import * as Clerk from "@clerk/elements/common";
import * as ClerkSignUp from "@clerk/elements/sign-up";
import { useAtomValue } from "jotai";
import type React from "react";

import { appNameAtom } from "@/atoms/auth";

interface SignUpVerificationsStepProps {
  renderLogo?: () => React.ReactNode;
}

export const SignUpVerificationsStep: React.FC<
  SignUpVerificationsStepProps
> = ({ renderLogo }) => {
  const appName = useAtomValue(appNameAtom);

  return (
    <ClerkSignUp.Step name="verifications">
      <ClerkSignUp.Strategy name="email_code">
        <div className="mb-6 text-center">
          {renderLogo ? (
            renderLogo()
          ) : (
            <div className="mb-2 font-bold text-4xl text-foreground">
              {appName || "🕸️"}
            </div>
          )}
          <h1 className="mt-4 font-bold text-xl">check your email</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            we sent a verification code to your email
          </p>
        </div>

        <Clerk.Field className="mb-5" name="code">
          <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
            verification code
          </Clerk.Label>
          <Clerk.Input className="w-full rounded-md border border-border bg-card p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          <Clerk.FieldError className="mt-2 text-destructive text-xs" />
        </Clerk.Field>

        <ClerkSignUp.Action
          className="mb-3 w-full rounded-md border border-primary/20 bg-primary p-3 font-medium text-primary-foreground text-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-sm"
          submit
        >
          verify
        </ClerkSignUp.Action>

        <ClerkSignUp.Action
          className="block w-full cursor-pointer text-center text-muted-foreground text-sm hover:text-foreground"
          navigate="start"
        >
          go back
        </ClerkSignUp.Action>
      </ClerkSignUp.Strategy>

      <ClerkSignUp.Strategy name="phone_code">
        <div className="mb-6 text-center">
          {renderLogo ? (
            renderLogo()
          ) : (
            <div className="mb-2 font-bold text-4xl text-foreground">
              {appName || "🕸️"}
            </div>
          )}
          <h1 className="mt-4 font-bold text-xl">check your phone</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            we sent a verification code to your phone
          </p>
        </div>

        <Clerk.Field className="mb-5" name="code">
          <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
            verification code
          </Clerk.Label>
          <Clerk.Input className="w-full rounded-md border border-border bg-card p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          <Clerk.FieldError className="mt-2 text-destructive text-xs" />
        </Clerk.Field>

        <ClerkSignUp.Action
          className="mb-3 w-full rounded-md border border-primary/20 bg-primary p-3 font-medium text-primary-foreground text-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-sm"
          submit
        >
          verify
        </ClerkSignUp.Action>

        <ClerkSignUp.Action
          className="block w-full cursor-pointer text-center text-muted-foreground text-sm hover:text-foreground"
          navigate="start"
        >
          go back
        </ClerkSignUp.Action>
      </ClerkSignUp.Strategy>
    </ClerkSignUp.Step>
  );
};
