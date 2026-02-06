"use client";

import { atom } from "jotai";

// Atom for the application name, can be set by a provider or default here
export const appNameAtom = atom("turbokit"); // Default app name

// Atom for storing auth-related error messages
export const authErrorAtom = atom<string | null>(null);

// Atom for storing auth-related debug information
export const authDebugInfoAtom = atom<string | null>(null);

// Atoms for password visibility in the SignUp form
export const showSignUpPasswordAtom = atom(false);
export const showSignUpConfirmPasswordAtom = atom(false);
