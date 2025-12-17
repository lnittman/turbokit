"use client";

import { useAuth } from "@clerk/nextjs";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";

import { SignIn as CustomSignInComponent } from "@/components/auth/signin";

export default function SignInPage(): React.ReactElement {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  // Effect to handle redirection after successful sign-in
  useEffect(() => {
    if (isSignedIn) {
      console.log(
        "User is signed in, redirecting to home page from SignInPage"
      );
      router.push("/");
    }
  }, [isSignedIn, router]);

  const handleSignInComplete = () => {
    // The useEffect above will handle redirection when isSignedIn becomes true.
    // This callback can be used for any additional logic if needed after Clerk signals completion.
    console.log(
      "Clerk sign-in process complete, SignInPage effect will redirect."
    );
    // router.push('/'); // Optionally, can also redirect here
  };

  // The onRedirect prop for the component might not be strictly necessary
  // if onSignInComplete and the page's useEffect handle all redirection cases.
  // It's kept for flexibility if the component needs to suggest a redirect path.
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

  const renderLogo = () => (
    <div className="mb-4 flex flex-col items-center justify-center gap-2">
      <motion.div
        animate="float"
        className="select-none"
        variants={logoAnimation}
      >
        <Image alt="Logo" height={128} src="/assets/logo.png" width={128} />
      </motion.div>

      <span className="font-bold text-4xl text-foreground">turbokit</span>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <CustomSignInComponent
        onRedirect={handleRedirect}
        onSignInComplete={handleSignInComplete}
        renderLogo={renderLogo}
      />
    </div>
  );
}
