"use client";

import { useEffect } from 'react';

import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { SignUp as CustomSignUpComponent } from '@/components/auth/signup';

export default function SignUpPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  // Effect to handle redirection after successful sign-up or if already signed in
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      console.log("User is already signed in, redirecting to home page from SignUpPage");
      router.push('/');
      return;
    }

    // Handle /signup/continue scenario
    // This specific logic might be better placed inside the Clerk flow if possible,
    // or by listening to specific Clerk events that lead to this state.
    // For now, keeping it as a pathname check.
    if (window.location.pathname.endsWith('/signup/continue')) {
      console.log("[SignUpPage] Detected /signup/continue, redirecting to home. User might need to complete verification or is signed in.");
      // This could indicate a completed step or an already signed-in state if Clerk redirected here.
      // The isSignedIn check above should ideally catch fully signed-in users.
      router.push('/'); 
    }

  }, [isLoaded, isSignedIn, router]);

  const handleSignUpComplete = () => {
    // The useEffect above will handle redirection when isSignedIn becomes true after successful signup.
    console.log("Clerk sign-up process complete (or verification complete), SignUpPage effect will redirect if signed in.");
    // router.push('/'); // Can also redirect here, but useEffect is preferred for consistency
  };

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

  const renderArborLogo = () => (
    <div className="flex flex-col items-center justify-center gap-2 mb-4">
      <motion.div variants={logoAnimation} animate="float" className="select-none">
        <Image src="/assets/logo.png" alt="Arbor Logo" width={128} height={128} />
      </motion.div>
      <span className="text-4xl font-bold text-foreground">arbor</span>
    </div>
  );
  
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full">
        <div>Loading...</div>
      </div>
    );
  }

  // If user is already signed in and auth is loaded, they will be redirected by the useEffect.
  // Rendering the component might be fine as Clerk itself might handle showing a signed-in state or redirecting.

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <CustomSignUpComponent
        // appName="arbor" // appName comes from atom, renderLogo will display it
        onSignUpComplete={handleSignUpComplete}
        onRedirect={handleRedirect} // For any explicit redirects the component might trigger
        renderLogo={renderArborLogo} // <-- Pass the function
      />
    </div>
  );
}