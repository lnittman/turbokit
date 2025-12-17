"use client";

import type { IconName } from "@repo/design/icons";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";

function FeatureCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        className="h-full"
        transition={{ duration: 0.2 }}
        whileHover={{ y: -5 }}
      >
        <div className="h-full rounded-lg border p-4 transition-colors hover:border-primary/50">
          <div className="mb-4 inline-block rounded-lg bg-primary/10 p-2" />
          <div className="font-semibold text-lg">{title}</div>
          <p className="mt-2 text-muted-foreground text-sm">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}

export default function HomePage(): ReactElement {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex max-w-[980px] flex-col items-center space-y-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
              <span className="font-medium text-sm">
                TurboKit Documentation
              </span>
            </div>

            <h1 className="font-bold text-4xl tracking-tight md:text-6xl">
              Build{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                real-time apps
              </span>{" "}
              with Convex
            </h1>

            <p className="max-w-[750px] text-muted-foreground text-xl">
              Complete documentation for TurboKit - the Convex-native
              development platform with AI-powered tools, real-time
              subscriptions, and enterprise-ready components.
            </p>

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
                href="/docs/convex"
              >
                Learn Convex
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Background gradient */}
        <div className="-z-10 absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      </section>

      {/* Quick Start Cards */}
      <section className="container mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl">Start Building</h2>
          <p className="text-muted-foreground text-xl">
            Everything you need to build production-ready applications
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            description="Get up and running with TurboKit in under 5 minutes"
            href="/docs/getting-started"
            title="Quick Start"
          />
          <FeatureCard
            description="Learn real-time database, functions, and subscriptions"
            href="/docs/convex"
            title="Convex Basics"
          />
          <FeatureCard
            description="Build AI agents with Convex Agent component"
            href="/docs/ai"
            title="AI Integration"
          />
          <FeatureCard
            description="Explore pre-built components and design system"
            href="/docs/components"
            title="Components"
          />
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="container mx-auto border-t px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-6 font-bold text-2xl">Core Concepts</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                  href="/docs/convex/schema"
                >
                  <ArrowRight className="h-4 w-4" />
                  Database Schema
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                  href="/docs/convex/functions"
                >
                  <ArrowRight className="h-4 w-4" />
                  Functions & Mutations
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                  href="/docs/convex/subscriptions"
                >
                  <ArrowRight className="h-4 w-4" />
                  Real-time Subscriptions
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                  href="/docs/convex/workflows"
                >
                  <ArrowRight className="h-4 w-4" />
                  Durable Workflows
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 font-bold text-2xl">Advanced Topics</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                  href="/docs/ai/agents"
                >
                  <ArrowRight className="h-4 w-4" />
                  AI Agents & Tools
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                  href="/docs/deployment"
                >
                  <ArrowRight className="h-4 w-4" />
                  Deployment Guide
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                  href="/docs/observability"
                >
                  <ArrowRight className="h-4 w-4" />
                  Monitoring & Observability
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                  href="/docs/best-practices"
                >
                  <ArrowRight className="h-4 w-4" />
                  Best Practices
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-12 text-primary-foreground md:p-16"
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          <div className="relative z-10 mx-auto flex max-w-[750px] flex-col items-center space-y-6 text-center text-white">
            <h2 className="font-bold text-3xl md:text-4xl">
              Ready to dive deeper?
            </h2>
            <p className="text-xl opacity-90">
              Explore our comprehensive guides, API references, and examples to
              master TurboKit.
            </p>
            <div className="flex gap-4">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-md bg-white/10 px-5 font-medium text-base backdrop-blur"
                href="/docs"
              >
                Browse Documentation
              </Link>
            </div>
          </div>

          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
        </motion.div>
      </section>
    </div>
  );
}
