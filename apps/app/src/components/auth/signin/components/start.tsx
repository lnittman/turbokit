'use client';

import React from 'react';

import * as Clerk from '@clerk/elements/common';
import * as ClerkSignIn from '@clerk/elements/sign-in';
import { useAtomValue } from 'jotai';
import Link from 'next/link';

import { appNameAtom } from '@/atoms/auth';

interface SignInStartStepProps {
  renderLogo?: () => React.ReactNode;
}

export const SignInStartStep: React.FC<SignInStartStepProps> = ({ renderLogo }) => {
  const appName = useAtomValue(appNameAtom);

  return (
    <ClerkSignIn.Step name="start" className="w-full">
      <div className="text-center mb-10">
        {renderLogo ? renderLogo() : (
          <div className="text-4xl font-bold mb-2 text-foreground">{appName}</div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-3 w-full mb-6">
        <Clerk.Connection 
          name="apple" 
          className="flex items-center justify-center gap-2 w-full p-3 bg-white/10 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-md text-sm font-medium transition-all duration-200 shadow-md text-foreground hover:bg-white/20 dark:hover:bg-white/20 select-none"
        >
          <Clerk.Icon className="h-5 w-5" />
          sign in with Apple
        </Clerk.Connection>
        
        <Clerk.Connection 
          name="google" 
          className="flex items-center justify-center gap-2 w-full p-3 bg-white/10 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-md text-sm font-medium transition-all duration-200 shadow-md text-foreground hover:bg-white/20 dark:hover:bg-white/20 select-none"
        >
          <Clerk.Icon className="h-5 w-5" />
          sign in with Google
        </Clerk.Connection>
      </div>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-4 text-muted-foreground">or</span>
        </div>
      </div>
      
      <div className="mb-5">
        <Clerk.Field name="identifier" className="mb-1">
          <Clerk.Label className="block text-sm font-medium mb-2 text-foreground">email</Clerk.Label>
          <Clerk.Input 
            className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground" 
            autoComplete="off"
          />
          <Clerk.FieldError className="text-destructive text-xs mt-2" />
        </Clerk.Field>
        
        <Clerk.Field name="password" className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <Clerk.Label className="block text-sm font-medium text-foreground">password</Clerk.Label>
            <ClerkSignIn.Action 
              navigate="forgot-password"
              className="text-sm text-muted-foreground hover:text-primary cursor-pointer select-none"
            >
              forgot password?
            </ClerkSignIn.Action>
          </div>
          <Clerk.Input 
            type="password"
            className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground" 
            autoComplete="off"
          />
          <Clerk.FieldError className="text-destructive text-xs mt-2" />
        </Clerk.Field>
      </div>
      
      <ClerkSignIn.Action 
        submit
        className="w-full p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-all duration-200 border border-primary/20 hover:shadow-sm"
      >
        submit
      </ClerkSignIn.Action>
      
      <div className="text-center mt-6 text-sm text-muted-foreground">
        don't have an account?{' '}
        <Link href="/signup" className="text-primary hover:text-primary/80 hover:underline select-none">
          sign up
        </Link>
      </div>
    </ClerkSignIn.Step>
  );
};
