import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@spots/design/components/ui/sonner";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Spots - Discover Places That Interest You",
    template: "%s | Spots",
  },
  description:
    "Discover spots in your city that match your interests, curated by AI.",
  keywords: [
    "spots",
    "discovery",
    "interests",
    "ai",
    "travel",
    "food",
    "attractions",
    "personalized",
  ],
  creator: "Spots Team",
  authors: [
    {
      name: "Spots Team",
      url: "https://spots.app",
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background antialiased")}>
        <ClerkProvider>
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              disableTransitionOnChange
              enableSystem
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
