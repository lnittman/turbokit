"use client";

import * as ClerkSignIn from "@clerk/elements/sign-in";
import { useSetAtom } from "jotai";
import type React from "react";
import { useEffect } from "react";

import { authDebugInfoAtom, authErrorAtom } from "@/atoms/auth";
import { SignInForgotPasswordStep } from "./components/forgot-password";
import { SignInResetPasswordStep } from "./components/reset-password";
import { SignInSsoCallbackStep } from "./components/sso-callback";
import { SignInStartStep } from "./components/start";
import { SignInVerificationsStep } from "./components/verifications";

interface SignInProps {
	onSignInComplete?: () => void;
	onRedirect?: (path: string) => void;
	renderLogo?: () => React.ReactNode;
}

export const SignIn = ({
	onRedirect,
	onSignInComplete,
	renderLogo,
}: SignInProps) => {
	const setError = useSetAtom(authErrorAtom);
	const _setDebugInfo = useSetAtom(authDebugInfoAtom);

	useEffect(() => {
		const handleClerkEvents = () => {
			const cb = () => {
				if (onSignInComplete) {
					onSignInComplete();
				} else if (onRedirect) {
					onRedirect("/");
				}
			};
			document.addEventListener("clerk:sign-in:complete", cb);
			return () => {
				document.removeEventListener("clerk:sign-in:complete", cb);
			};
		};
		const cleanup = handleClerkEvents();
		return cleanup;
	}, [onSignInComplete, onRedirect]);

	const goToHome = () => {
		try {
			console.log("Manual navigation to home page");
			if (onSignInComplete) {
				onSignInComplete();
			} else if (onRedirect) {
				onRedirect("/");
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Unknown error";
			console.error("Error during manual navigation:", err);
			setError(`Manual navigation error: ${message}`);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center w-full max-w-sm">
			<div className="w-full p-6">
				<ClerkSignIn.Root routing="path" path="/signin">
					<SignInStartStep renderLogo={renderLogo} />
					<SignInSsoCallbackStep renderLogo={renderLogo} goToHome={goToHome} />
					<SignInVerificationsStep />
					<SignInForgotPasswordStep />
					<SignInResetPasswordStep />
				</ClerkSignIn.Root>
			</div>
		</div>
	);
};
