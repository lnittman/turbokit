"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

type Attribute = "class" | "data-theme" | "data-mode";

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: Attribute | Attribute[];
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  forcedTheme?: string;
  storageKey?: string;
  themes?: string[];
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
