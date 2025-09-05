'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@repo/design/components/ui/button';
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
            <Button size="lg" asChild>
              <Link href="/docs/getting-started">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://github.com/turbokit/turbokit">
                View on GitHub
                <svg 
                  className="ml-2 h-5 w-5" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </Link>
            </Button>
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