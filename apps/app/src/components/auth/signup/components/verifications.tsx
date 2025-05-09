'use client';

import React from 'react';
import { useAtomValue } from 'jotai';
import * as Clerk from '@clerk/elements/common';
import * as ClerkSignUp from '@clerk/elements/sign-up';

import { appNameAtom } from '@/atoms/auth';

interface SignUpVerificationsStepProps {
  renderLogo?: () => React.ReactNode;
}

export const SignUpVerificationsStep: React.FC<SignUpVerificationsStepProps> = ({ renderLogo }) => {
  const appName = useAtomValue(appNameAtom);

  return (
    <ClerkSignUp.Step name="verifications">
      <ClerkSignUp.Strategy name="email_code">
        <div className="text-center mb-6">
          {renderLogo ? renderLogo() : (
            <div className="text-4xl font-bold mb-2 text-foreground">{appName || '🕸️'}</div>
          )}
          <h1 className="text-xl font-bold mt-4">check your email</h1>
          <p className="text-sm mt-2 text-muted-foreground">
            we sent a verification code to your email
          </p>
        </div>
        
        <Clerk.Field name="code" className="mb-5">
          <Clerk.Label className="block text-sm font-medium mb-2 text-foreground">verification code</Clerk.Label>
          <Clerk.Input 
            className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
          />
          <Clerk.FieldError className="text-destructive text-xs mt-2" />
        </Clerk.Field>
        
        <ClerkSignUp.Action 
          submit
          className="w-full p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-all duration-200 border border-primary/20 hover:shadow-sm mb-3"
        >
          verify
        </ClerkSignUp.Action>
        
        <ClerkSignUp.Action
          navigate="start"
          className="text-center block w-full text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          go back
        </ClerkSignUp.Action>
      </ClerkSignUp.Strategy>
      
      <ClerkSignUp.Strategy name="phone_code">
        <div className="text-center mb-6">
          {renderLogo ? renderLogo() : (
            <div className="text-4xl font-bold mb-2 text-foreground">{appName || '🕸️'}</div>
          )}
          <h1 className="text-xl font-bold mt-4">check your phone</h1>
          <p className="text-sm mt-2 text-muted-foreground">
            we sent a verification code to your phone
          </p>
        </div>
        
        <Clerk.Field name="code" className="mb-5">
          <Clerk.Label className="block text-sm font-medium mb-2 text-foreground">verification code</Clerk.Label>
          <Clerk.Input 
            className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
          />
          <Clerk.FieldError className="text-destructive text-xs mt-2" />
        </Clerk.Field>
        
        <ClerkSignUp.Action 
          submit
          className="w-full p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-all duration-200 border border-primary/20 hover:shadow-sm mb-3"
        >
          verify
        </ClerkSignUp.Action>
        
        <ClerkSignUp.Action
          navigate="start"
          className="text-center block w-full text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          go back
        </ClerkSignUp.Action>
      </ClerkSignUp.Strategy>
    </ClerkSignUp.Step>
  );
};
