"use client";

import { useAuth } from "@clerk/nextjs";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";

import { SignUp as CustomSignUpComponent } from "@/components/auth/signup";

export default function SignUpPage(): React.ReactElement {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  // Effect to handle redirection after successful sign-up or if already signed in
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      console.log(
        "User is already signed in, redirecting to home page from SignUpPage"
      );
      router.push("/");
      return;
    }

    // Handle /signup/continue scenario
    // This specific logic might be better placed inside the Clerk flow if possible,
    // or by listening to specific Clerk events that lead to this state.
    // For now, keeping it as a pathname check.
    if (window.location.pathname.endsWith("/signup/continue")) {
      console.log(
        "[SignUpPage] Detected /signup/continue, redirecting to home. User might need to complete verification or is signed in."
      );
      // This could indicate a completed step or an already signed-in state if Clerk redirected here.
      // The isSignedIn check above should ideally catch fully signed-in users.
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSignUpComplete = () => {
    // The useEffect above will handle redirection when isSignedIn becomes true after successful signup.
    console.log(
      "Clerk sign-up process complete (or verification complete), SignUpPage effect will redirect if signed in."
    );
    // router.push('/'); // Can also redirect here, but useEffect is preferred for consistency
  };

  const handleRedirect = (path: string) => {
    router.push(path);
  };

  const logoAnimation: Variants = {
    float: {
      y: [-3, 3, -3],
      transition: {
        duration: 2.5,
        ease: [0.42, 0, 0.58, 1],
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  };

  const renderArborLogo = () => (
    <div className="mb-4 flex flex-col items-center justify-center gap-2">
      <motion.div
        animate="float"
        className="select-none"
        variants={logoAnimation}
      >
        <Image
          alt="Arbor Logo"
          height={128}
          src="/assets/logo.png"
          width={128}
        />
      </motion.div>
      <span className="font-bold text-4xl text-foreground">arbor</span>
    </div>
  );

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // If user is already signed in and auth is loaded, they will be redirected by the useEffect.
  // Rendering the component might be fine as Clerk itself might handle showing a signed-in state or redirecting.

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <CustomSignUpComponent
        // appName="arbor" // appName comes from atom, renderLogo will display it
        onRedirect={handleRedirect}
        onSignUpComplete={handleSignUpComplete} // For any explicit redirects the component might trigger
        renderLogo={renderArborLogo} // <-- Pass the function
      />
    </div>
  );
}
