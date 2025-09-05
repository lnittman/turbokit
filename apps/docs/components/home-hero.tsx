'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Database, Bot } from 'lucide-react';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center space-y-8 max-w-[980px] mx-auto"
        >
          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Zap className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Real-time by default</span>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Build{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              real-time apps
            </span>{' '}
            with Convex
          </h1>
          
          {/* Description */}
          <p className="text-xl text-muted-foreground max-w-[750px]">
            TurboKit is a production-ready monorepo template with Convex backend, 
            real-time subscriptions, AI agents, and enterprise components—everything 
            you need to ship your next product.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/docs/getting-started" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-11 px-5 text-base font-medium">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="https://github.com/turbokit/turbokit" className="inline-flex items-center justify-center rounded-md border h-11 px-5 text-base font-medium">
              View on GitHub
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-8">
            {[
              { icon: Database, label: 'Convex Backend' },
              { icon: Zap, label: 'Real-time' },
              { icon: Bot, label: 'AI Agents' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full text-sm"
              >
                <feature.icon className="h-3.5 w-3.5" />
                {feature.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
