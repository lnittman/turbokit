"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, Database, Zap } from "lucide-react";
import Link from "next/link";

import type { ReactElement } from "react";

export function HomeHero(): ReactElement {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto flex max-w-[980px] flex-col items-center space-y-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
            <Zap className="h-4 w-4 animate-pulse text-primary" />
            <span className="font-medium text-sm">Real-time by default</span>
          </div>

          {/* Title */}
          <h1 className="font-bold text-4xl tracking-tight md:text-6xl">
            Build{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              real-time apps
            </span>{" "}
            with Convex
          </h1>

          {/* Description */}
          <p className="max-w-[750px] text-muted-foreground text-xl">
            TurboKit is a production-ready monorepo template with Convex
            backend, real-time subscriptions, AI agents, and enterprise
            components—everything you need to ship your next product.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 font-medium text-base text-primary-foreground"
              href="/docs/getting-started"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border px-5 font-medium text-base"
              href="https://github.com/turbokit/turbokit"
            >
              View on GitHub
            </Link>
          </div>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              { icon: Database, label: "Convex Backend" },
              { icon: Zap, label: "Real-time" },
              { icon: Bot, label: "AI Agents" },
            ].map((feature) => (
              <div
                className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5 text-sm"
                key={feature.label}
              >
                <feature.icon className="h-3.5 w-3.5" />
                {feature.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Background gradient */}
      <div className="-z-10 absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>
    </section>
  );
}
