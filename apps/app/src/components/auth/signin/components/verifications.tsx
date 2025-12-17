"use client";

import * as Clerk from "@clerk/elements/common";
import * as ClerkSignIn from "@clerk/elements/sign-in";
import type React from "react";

export const SignInVerificationsStep: React.FC = () => {
  return (
    <ClerkSignIn.Step name="verifications">
      <ClerkSignIn.Strategy name="password">
        <div className="mb-6 text-center">
          <h1 className="font-bold text-foreground text-xl">
            enter your password
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            please enter your password to continue
          </p>
        </div>

        <Clerk.Field className="mb-5" name="password">
          <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
            password
          </Clerk.Label>
          <Clerk.Input className="w-full rounded-md border border-border bg-card p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          <Clerk.FieldError className="mt-2 text-destructive text-xs" />
        </Clerk.Field>

        <ClerkSignIn.Action
          className="w-full rounded-md border border-primary/20 bg-primary p-3 font-medium text-primary-foreground text-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-sm"
          submit
        >
          sign in
        </ClerkSignIn.Action>

        <ClerkSignIn.Action
          className="mt-4 block w-full cursor-pointer text-center text-muted-foreground text-sm hover:text-foreground"
          navigate="forgot-password"
        >
          forgot password?
        </ClerkSignIn.Action>
      </ClerkSignIn.Strategy>

      <ClerkSignIn.Strategy name="email_code">
        <div className="mb-6 text-center">
          <h1 className="font-bold text-foreground text-xl">
            check your email
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            we sent a verification code to{" "}
            <span className="text-foreground">
              <ClerkSignIn.SafeIdentifier />
            </span>
          </p>
        </div>

        <Clerk.Field className="mb-5" name="code">
          <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
            verification code
          </Clerk.Label>
          <Clerk.Input className="w-full rounded-md border border-border bg-card p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          <Clerk.FieldError className="mt-2 text-destructive text-xs" />
        </Clerk.Field>

        <ClerkSignIn.Action
          className="w-full rounded-md border border-primary/20 bg-primary p-3 font-medium text-primary-foreground text-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-sm"
          submit
        >
          verify
        </ClerkSignIn.Action>
      </ClerkSignIn.Strategy>

      <ClerkSignIn.Strategy name="reset_password_email_code">
        <div className="mb-6 text-center">
          <h1 className="font-bold text-foreground text-xl">
            check your email
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            we sent a password reset code to{" "}
            <span className="text-foreground">
              <ClerkSignIn.SafeIdentifier />
            </span>
          </p>
        </div>

        <Clerk.Field className="mb-5" name="code">
          <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
            reset code
          </Clerk.Label>
          <Clerk.Input className="w-full rounded-md border border-border bg-card p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          <Clerk.FieldError className="mt-2 text-destructive text-xs" />
        </Clerk.Field>

        <ClerkSignIn.Action
          className="w-full rounded-md bg-primary p-3 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
          submit
        >
          continue
        </ClerkSignIn.Action>
      </ClerkSignIn.Strategy>
    </ClerkSignIn.Step>
  );
};
