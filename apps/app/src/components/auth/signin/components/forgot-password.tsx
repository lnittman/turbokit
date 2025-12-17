"use client";

import * as Clerk from "@clerk/elements/common";
import * as ClerkSignIn from "@clerk/elements/sign-in";
import type React from "react";

export const SignInForgotPasswordStep: React.FC = () => {
  return (
    <ClerkSignIn.Step name="forgot-password">
      <div className="mb-6 text-center">
        <h1 className="font-bold text-foreground text-xl">
          reset your password
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          enter your email and we'll send you a reset link
        </p>
      </div>

      <Clerk.Field className="mb-5" name="identifier">
        <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
          email
        </Clerk.Label>
        <Clerk.Input className="w-full rounded-md border border-border bg-card p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        <Clerk.FieldError className="mt-2 text-destructive text-xs" />
      </Clerk.Field>

      <div className="flex flex-col gap-3">
        <div className="w-full rounded-md bg-primary p-3 text-center font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90">
          <ClerkSignIn.SupportedStrategy name="reset_password_email_code">
            reset password
          </ClerkSignIn.SupportedStrategy>
        </div>

        <ClerkSignIn.Action
          className="block w-full cursor-pointer text-center text-muted-foreground text-sm hover:text-foreground"
          navigate="previous"
        >
          back to sign in
        </ClerkSignIn.Action>
      </div>
    </ClerkSignIn.Step>
  );
};
