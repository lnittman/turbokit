"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@spots/design/components/ui/button";
import Link from "next/link";

import type React from "react";

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 text-foreground">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Code 404 */}
        <div className="mb-6">
          <div className="inline-block text-6xl text-muted-foreground/40">
            404
          </div>
        </div>

        {/* Message */}
        <div className="mb-8 space-y-2">
          <h1 className="mb-4 font-title text-3xl tracking-tight md:text-4xl">
            not found
          </h1>
          <p className="text-muted-foreground">
            the page you're looking for doesn't exist...
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <Button asChild className="h-10 rounded-full px-6 text-sm">
            <Link className="flex items-center gap-2" href="/">
              <span>go to chat</span>
              <ArrowRight className="h-4 w-4" weight="bold" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
