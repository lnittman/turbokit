"use client";

import { useEffect } from "react";

import { useAtomValue } from "jotai";

import { accentColorAtom, fontScaleAtom } from "@/atoms/preferences";

const ACCENT_VALUES = {
  red: "#ce2021",
  yellow: "#ffc003",
  blue: "#1270b8",
  green: "#1aa167",
  orange: "#e95c20",
} as const;

export function UserPreferencesSync() {
  const accent = useAtomValue(accentColorAtom);
  const fontScale = useAtomValue(fontScaleAtom);

  useEffect(() => {
    document.documentElement.style.setProperty("--user-accent", ACCENT_VALUES[accent]);
  }, [accent]);

  useEffect(() => {
    document.documentElement.setAttribute("data-font-scale", fontScale);
  }, [fontScale]);

  return null;
}
