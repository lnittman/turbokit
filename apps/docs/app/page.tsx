'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Icon as DocIcon, IconNames, type IconName } from '@repo/design/icons';
import { Button } from '@repo/design/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design/components/ui/card';

function FeatureCard({ 
  icon,
  title, 
  description, 
  href 
}: { 
  icon: IconName; 
  title: string; 
  description: string; 
  href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Card className="h-full hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="p-2 bg-primary/10 rounded-lg inline-block mb-4">
              <DocIcon name={icon} className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{description}</CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center space-y-8 max-w-[980px] mx-auto"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <DocIcon name={IconNames.Sparkles} className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">TurboKit Documentation</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Build{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                real-time apps
              </span>{' '}
              with Convex
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-[750px]">
              Complete documentation for TurboKit - the Convex-native development platform 
              with AI-powered tools, real-time subscriptions, and enterprise-ready components.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/docs/getting-started">
                  Get Started
                  <DocIcon name={IconNames.ArrowRight} className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs/convex">
                  <DocIcon name={IconNames.Database} className="mr-2 h-5 w-5" />
                  Learn Convex
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
      </section>

      {/* Quick Start Cards */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Start Building</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to build production-ready applications
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={IconNames.Zap}
            title="Quick Start"
            description="Get up and running with TurboKit in under 5 minutes"
            href="/docs/getting-started"
          />
          <FeatureCard
            icon={IconNames.Database}
            title="Convex Basics"
            description="Learn real-time database, functions, and subscriptions"
            href="/docs/convex"
          />
          <FeatureCard
            icon={IconNames.Bot}
            title="AI Integration"
            description="Build AI agents with Convex Agent component"
            href="/docs/ai"
          />
          <FeatureCard
            icon={IconNames.Code}
            title="Components"
            description="Explore pre-built components and design system"
            href="/docs/components"
          />
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="container mx-auto px-6 py-16 border-t">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold mb-6">Core Concepts</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs/convex/schema" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight className="h-4 w-4" />
                  Database Schema
                </Link>
              </li>
              <li>
                <Link href="/docs/convex/functions" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight className="h-4 w-4" />
                  Functions & Mutations
                </Link>
              </li>
              <li>
                <Link href="/docs/convex/subscriptions" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight className="h-4 w-4" />
                  Real-time Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/docs/convex/workflows" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight className="h-4 w-4" />
                  Durable Workflows
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-6">Advanced Topics</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs/ai/agents" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight className="h-4 w-4" />
                  AI Agents & Tools
                </Link>
              </li>
              <li>
                <Link href="/docs/deployment" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight className="h-4 w-4" />
                  Deployment Guide
                </Link>
              </li>
              <li>
                <Link href="/docs/observability" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight className="h-4 w-4" />
                  Monitoring & Observability
                </Link>
              </li>
              <li>
                <Link href="/docs/best-practices" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
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
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-12 md:p-16 text-primary-foreground"
        >
          <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-[750px] mx-auto">
            <DocIcon name={IconNames.Workflow} className="h-12 w-12" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to dive deeper?
            </h2>
            <p className="text-xl opacity-90">
              Explore our comprehensive guides, API references, and examples to master TurboKit.
            </p>
            <div className="flex gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/docs">
                  Browse Documentation
                  <DocIcon name={IconNames.Book} className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
        </motion.div>
      </section>
    </div>
  );
}
