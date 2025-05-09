'use client';

import React from 'react';
import * as Clerk from '@clerk/elements/common';
import * as ClerkSignIn from '@clerk/elements/sign-in';

export const SignInVerificationsStep: React.FC = () => {
  return (
    <ClerkSignIn.Step name="verifications">
      <ClerkSignIn.Strategy name="password">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-foreground">enter your password</h1>
          <p className="text-sm mt-2 text-muted-foreground">
            please enter your password to continue
          </p>
        </div>
        
        <Clerk.Field name="password" className="mb-5">
          <Clerk.Label className="block text-sm font-medium mb-2 text-foreground">password</Clerk.Label>
          <Clerk.Input 
            className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
          />
          <Clerk.FieldError className="text-destructive text-xs mt-2" />
        </Clerk.Field>
        
        <ClerkSignIn.Action 
          submit
          className="w-full p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-all duration-200 border border-primary/20 hover:shadow-sm"
        >
          sign in
        </ClerkSignIn.Action>
        
        <ClerkSignIn.Action 
          navigate="forgot-password"
          className="text-center block w-full mt-4 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          forgot password?
        </ClerkSignIn.Action>
      </ClerkSignIn.Strategy>
      
      <ClerkSignIn.Strategy name="email_code">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-foreground">check your email</h1>
          <p className="text-sm mt-2 text-muted-foreground">
            we sent a verification code to <span className="text-foreground"><ClerkSignIn.SafeIdentifier /></span>
          </p>
        </div>
        
        <Clerk.Field name="code" className="mb-5">
          <Clerk.Label className="block text-sm font-medium mb-2 text-foreground">verification code</Clerk.Label>
          <Clerk.Input 
            className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
          />
          <Clerk.FieldError className="text-destructive text-xs mt-2" />
        </Clerk.Field>
        
        <ClerkSignIn.Action 
          submit
          className="w-full p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-all duration-200 border border-primary/20 hover:shadow-sm"
        >
          verify
        </ClerkSignIn.Action>
      </ClerkSignIn.Strategy>
      
      <ClerkSignIn.Strategy name="reset_password_email_code">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-foreground">check your email</h1>
          <p className="text-sm mt-2 text-muted-foreground">
            we sent a password reset code to <span className="text-foreground"><ClerkSignIn.SafeIdentifier /></span>
          </p>
        </div>
        
        <Clerk.Field name="code" className="mb-5">
          <Clerk.Label className="block text-sm font-medium mb-2 text-foreground">reset code</Clerk.Label>
          <Clerk.Input 
            className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
          />
          <Clerk.FieldError className="text-destructive text-xs mt-2" />
        </Clerk.Field>
        
        <ClerkSignIn.Action 
          submit
          className="w-full p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors" 
        >
          continue
        </ClerkSignIn.Action>
      </ClerkSignIn.Strategy>
    </ClerkSignIn.Step>
  );
};
