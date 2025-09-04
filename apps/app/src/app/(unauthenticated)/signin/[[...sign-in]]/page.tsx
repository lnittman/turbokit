"use client";

import { useEffect } from 'react';
import type React from 'react';

import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { SignIn as CustomSignInComponent } from '@/components/auth/signin';

export default function SignInPage(): React.ReactElement {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  // Effect to handle redirection after successful sign-in
  useEffect(() => {
    if (isSignedIn) {
      console.log("User is signed in, redirecting to home page from SignInPage");
      router.push('/');
    }
  }, [isSignedIn, router]);

  const handleSignInComplete = () => {
    // The useEffect above will handle redirection when isSignedIn becomes true.
    // This callback can be used for any additional logic if needed after Clerk signals completion.
    console.log("Clerk sign-in process complete, SignInPage effect will redirect.");
    // router.push('/'); // Optionally, can also redirect here
  };
  
  // The onRedirect prop for the component might not be strictly necessary
  // if onSignInComplete and the page's useEffect handle all redirection cases.
  // It's kept for flexibility if the component needs to suggest a redirect path.
  const handleRedirect = (path: string) => {
    router.push(path);
  };

  const logoAnimation = {
    float: {
      translateY: ["-3px", "3px", "-3px"], // Subtle up and down movement
      transition: {
        duration: 2.5, // Adjust duration for speed
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };

  const renderLogo = () => (
    <div className="flex flex-col items-center justify-center gap-2 mb-4">
      <motion.div variants={logoAnimation} animate="float" className="select-none">
        <Image src="/assets/logo.png" alt="Logo" width={128} height={128} />
      </motion.div>

      <span className="text-4xl font-bold text-foreground">turbokit</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <CustomSignInComponent
        onSignInComplete={handleSignInComplete}
        onRedirect={handleRedirect}
        renderLogo={renderLogo}
      />
    </div>
  );
} 
