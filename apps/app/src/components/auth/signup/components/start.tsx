"use client";

import * as Clerk from "@clerk/elements/common";
import * as ClerkSignUp from "@clerk/elements/sign-up";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useAtom, useAtomValue } from "jotai";
import Link from "next/link";
import type React from "react";

import {
	appNameAtom,
	showSignUpConfirmPasswordAtom,
	showSignUpPasswordAtom,
} from "@/atoms/auth";

interface SignUpStartStepProps {
	renderLogo?: () => React.ReactNode;
}

export const SignUpStartStep: React.FC<SignUpStartStepProps> = ({
	renderLogo,
}) => {
	const appName = useAtomValue(appNameAtom);
	const [showPassword, setShowPassword] = useAtom(showSignUpPasswordAtom);
	const [showConfirmPassword, setShowConfirmPassword] = useAtom(
		showSignUpConfirmPasswordAtom,
	);

	return (
		<ClerkSignUp.Step name="start" className="w-full">
			<div className="text-center mb-10">
				{renderLogo ? (
					renderLogo()
				) : (
					<div className="text-4xl font-bold mb-2 text-foreground">
						{appName}
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 gap-3 w-full mb-6">
				<Clerk.Connection
					name="apple"
					className="flex items-center justify-center gap-2 w-full p-3 bg-white/10 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-md text-sm font-medium transition-all duration-200 shadow-md text-foreground hover:bg-white/20 dark:hover:bg-white/20 select-none"
				>
					<Clerk.Icon className="h-5 w-5" />
					sign up with Apple
				</Clerk.Connection>

				<Clerk.Connection
					name="google"
					className="flex items-center justify-center gap-2 w-full p-3 bg-white/10 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-md text-sm font-medium transition-all duration-200 shadow-md text-foreground hover:bg-white/20 dark:hover:bg-white/20 select-none"
				>
					<Clerk.Icon className="h-5 w-5" />
					sign up with Google
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
				<Clerk.Field name="emailAddress" className="mb-5">
					<Clerk.Label className="block text-sm font-medium mb-2 text-foreground">
						email
					</Clerk.Label>
					<Clerk.Input
						className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
						autoComplete="off"
					/>
					<Clerk.FieldError className="text-destructive text-xs mt-2" />
				</Clerk.Field>

				<Clerk.Field name="password" className="mb-5">
					<Clerk.Label className="block text-sm font-medium mb-2 text-foreground">
						password
					</Clerk.Label>
					<div className="relative">
						<Clerk.Input
							type={showPassword ? "text" : "password"}
							className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring pr-10"
							autoComplete="off"
						/>
						<button
							type="button"
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? (
								<EyeSlash className="h-5 w-5" weight="duotone" />
							) : (
								<Eye className="h-5 w-5" weight="duotone" />
							)}
						</button>
					</div>
					<Clerk.FieldError className="text-destructive text-xs mt-2" />
				</Clerk.Field>

				<Clerk.Field name="confirmPassword" className="mb-5">
					<Clerk.Label className="block text-sm font-medium mb-2 text-foreground">
						confirm password
					</Clerk.Label>
					<div className="relative">
						<Clerk.Input
							type={showConfirmPassword ? "text" : "password"}
							className="w-full p-3 bg-card border-border border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring pr-10"
							autoComplete="off"
						/>
						<button
							type="button"
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						>
							{showConfirmPassword ? (
								<EyeSlash className="h-5 w-5" weight="duotone" />
							) : (
								<Eye className="h-5 w-5" weight="duotone" />
							)}
						</button>
					</div>
					<Clerk.FieldError className="text-destructive text-xs mt-2" />
				</Clerk.Field>

				<ClerkSignUp.Captcha className="mt-3" />
			</div>

			<ClerkSignUp.Action
				submit
				className="w-full p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-all duration-200 border border-primary/20 hover:shadow-sm select-none"
			>
				sign up
			</ClerkSignUp.Action>

			<div className="text-center mt-6 text-sm text-muted-foreground">
				already have an account?{" "}
				<Link
					href="/signin"
					className="text-primary hover:text-primary/80 hover:underline select-none"
				>
					sign in
				</Link>
			</div>
		</ClerkSignUp.Step>
	);
};
