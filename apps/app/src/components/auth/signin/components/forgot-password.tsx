'use client';

import React from 'react';
import * as Clerk from '@clerk/elements/common';
import * as ClerkSignIn from '@clerk/elements/sign-in';

export const SignInForgotPasswordStep: React.FC = () => {
  return (
    <ClerkSignIn.Step name="forgot-password">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-foreground">reset your password</h1>
        <p className="text-sm mt-2 text-muted-foreground">
          enter your email and we'll send you a reset link
        </p>
      </div>
      
      <Clerk.Field name="identifier" className="mb-5">
        <Clerk.Label className="block text-sm font-medium mb-2 text-foreground">email</Clerk.Label>
        <Clerk.Input 
          className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
        />
        <Clerk.FieldError className="text-destructive text-xs mt-2" />
      </Clerk.Field>
      
      <div className="flex flex-col gap-3">
        <div className="w-full p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium text-center transition-colors">
          <ClerkSignIn.SupportedStrategy name="reset_password_email_code">
            reset password
          </ClerkSignIn.SupportedStrategy>
        </div>
        
        <ClerkSignIn.Action 
          navigate="previous"
          className="text-center block w-full text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          back to sign in
        </ClerkSignIn.Action>
      </div>
    </ClerkSignIn.Step>
  );
};
