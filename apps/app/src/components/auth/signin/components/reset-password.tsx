'use client';

import React from 'react';
import * as Clerk from '@clerk/elements/common';
import * as ClerkSignIn from '@clerk/elements/sign-in';

export const SignInResetPasswordStep: React.FC = () => {
  return (
    <ClerkSignIn.Step name="reset-password">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-foreground">create new password</h1>
        <p className="text-sm mt-2 text-muted-foreground">
          please create a new password for your account
        </p>
      </div>
      
      <Clerk.Field name="password" className="mb-4">
        <Clerk.Label className="block text-sm font-medium mb-2 text-foreground">new password</Clerk.Label>
        <Clerk.Input 
          className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
        />
        <Clerk.FieldError className="text-destructive text-xs mt-2" />
      </Clerk.Field>
      
      <Clerk.Field name="confirmPassword" className="mb-5">
        <Clerk.Label className="block text-sm font-medium mb-2 text-foreground">confirm password</Clerk.Label>
        <Clerk.Input 
          className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
        />
        <Clerk.FieldError className="text-destructive text-xs mt-2" />
      </Clerk.Field>
      
      <ClerkSignIn.Action 
        submit
        className="w-full p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors"
      >
        reset password
      </ClerkSignIn.Action>
    </ClerkSignIn.Step>
  );
};
