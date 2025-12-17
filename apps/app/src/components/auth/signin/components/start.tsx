"use client";

import * as Clerk from "@clerk/elements/common";
import * as ClerkSignIn from "@clerk/elements/sign-in";
import { useAtomValue } from "jotai";
import Link from "next/link";
import type React from "react";

import { appNameAtom } from "@/atoms/auth";

interface SignInStartStepProps {
  renderLogo?: () => React.ReactNode;
}

export const SignInStartStep: React.FC<SignInStartStepProps> = ({
  renderLogo,
}) => {
  const appName = useAtomValue(appNameAtom);

  return (
    <ClerkSignIn.Step className="w-full" name="start">
      <div className="mb-10 text-center">
        {renderLogo ? (
          renderLogo()
        ) : (
          <div className="mb-2 font-bold text-4xl text-foreground">
            {appName}
          </div>
        )}
      </div>

      <div className="mb-6 grid w-full grid-cols-1 gap-3">
        <Clerk.Connection
          className="flex w-full select-none items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 p-3 font-medium text-foreground text-sm shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white/20 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
          name="apple"
        >
          <Clerk.Icon className="h-5 w-5" />
          sign in with Apple
        </Clerk.Connection>

        <Clerk.Connection
          className="flex w-full select-none items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 p-3 font-medium text-foreground text-sm shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white/20 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
          name="google"
        >
          <Clerk.Icon className="h-5 w-5" />
          sign in with Google
        </Clerk.Connection>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-border border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-4 text-muted-foreground">or</span>
        </div>
      </div>

      <div className="mb-5">
        <Clerk.Field className="mb-1" name="identifier">
          <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
            email
          </Clerk.Label>
          <Clerk.Input
            autoComplete="off"
            className="w-full rounded-md border border-border bg-card p-3 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Clerk.FieldError className="mt-2 text-destructive text-xs" />
        </Clerk.Field>

        <Clerk.Field className="mt-4" name="password">
          <div className="mb-2 flex items-center justify-between">
            <Clerk.Label className="block font-medium text-foreground text-sm">
              password
            </Clerk.Label>
            <ClerkSignIn.Action
              className="cursor-pointer select-none text-muted-foreground text-sm hover:text-primary"
              navigate="forgot-password"
            >
              forgot password?
            </ClerkSignIn.Action>
          </div>
          <Clerk.Input
            autoComplete="off"
            className="w-full rounded-md border border-border bg-card p-3 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            type="password"
          />
          <Clerk.FieldError className="mt-2 text-destructive text-xs" />
        </Clerk.Field>
      </div>

      <ClerkSignIn.Action
        className="w-full rounded-md border border-primary/20 bg-primary p-3 font-medium text-primary-foreground text-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-sm"
        submit
      >
        submit
      </ClerkSignIn.Action>

      <div className="mt-6 text-center text-muted-foreground text-sm">
        don't have an account?{" "}
        <Link
          className="select-none text-primary hover:text-primary/80 hover:underline"
          href="/signup"
        >
          sign up
        </Link>
      </div>
    </ClerkSignIn.Step>
  );
};
