"use client";

import * as Clerk from "@clerk/elements/common";
import * as ClerkSignUp from "@clerk/elements/sign-up";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useAtom, useAtomValue } from "jotai";
import Link from "next/link";
import type React from "react";

import {
  appNameAtom,
  showSignUpConfirmPasswordAtom,
  showSignUpPasswordAtom,
} from "@/atoms/auth";

interface SignUpStartStepProps {
  renderLogo?: () => React.ReactNode;
}

export const SignUpStartStep: React.FC<SignUpStartStepProps> = ({
  renderLogo,
}) => {
  const appName = useAtomValue(appNameAtom);
  const [showPassword, setShowPassword] = useAtom(showSignUpPasswordAtom);
  const [showConfirmPassword, setShowConfirmPassword] = useAtom(
    showSignUpConfirmPasswordAtom
  );

  return (
    <ClerkSignUp.Step className="w-full" name="start">
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
          sign up with Apple
        </Clerk.Connection>

        <Clerk.Connection
          className="flex w-full select-none items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 p-3 font-medium text-foreground text-sm shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white/20 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
          name="google"
        >
          <Clerk.Icon className="h-5 w-5" />
          sign up with Google
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
        <Clerk.Field className="mb-5" name="emailAddress">
          <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
            email
          </Clerk.Label>
          <Clerk.Input
            autoComplete="off"
            className="w-full rounded-md border border-border bg-card p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Clerk.FieldError className="mt-2 text-destructive text-xs" />
        </Clerk.Field>

        <Clerk.Field className="mb-5" name="password">
          <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
            password
          </Clerk.Label>
          <div className="relative">
            <Clerk.Input
              autoComplete="off"
              className="w-full rounded-md border border-border bg-card p-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              type={showPassword ? "text" : "password"}
            />
            <button
              className="-translate-y-1/2 absolute top-1/2 right-3 transform cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? (
                <EyeSlash className="h-5 w-5" weight="duotone" />
              ) : (
                <Eye className="h-5 w-5" weight="duotone" />
              )}
            </button>
          </div>
          <Clerk.FieldError className="mt-2 text-destructive text-xs" />
        </Clerk.Field>

        <Clerk.Field className="mb-5" name="confirmPassword">
          <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
            confirm password
          </Clerk.Label>
          <div className="relative">
            <Clerk.Input
              autoComplete="off"
              className="w-full rounded-md border border-border bg-card p-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              type={showConfirmPassword ? "text" : "password"}
            />
            <button
              className="-translate-y-1/2 absolute top-1/2 right-3 transform cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              type="button"
            >
              {showConfirmPassword ? (
                <EyeSlash className="h-5 w-5" weight="duotone" />
              ) : (
                <Eye className="h-5 w-5" weight="duotone" />
              )}
            </button>
          </div>
          <Clerk.FieldError className="mt-2 text-destructive text-xs" />
        </Clerk.Field>

        <ClerkSignUp.Captcha className="mt-3" />
      </div>

      <ClerkSignUp.Action
        className="w-full select-none rounded-md border border-primary/20 bg-primary p-3 font-medium text-primary-foreground text-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-sm"
        submit
      >
        sign up
      </ClerkSignUp.Action>

      <div className="mt-6 text-center text-muted-foreground text-sm">
        already have an account?{" "}
        <Link
          className="select-none text-primary hover:text-primary/80 hover:underline"
          href="/signin"
        >
          sign in
        </Link>
      </div>
    </ClerkSignUp.Step>
  );
};
