'use client';

import { motion } from 'framer-motion';
import { Icon as AppIcon, IconNames, type IconName } from '@repo/design/icons';
import Link from 'next/link';
import { Button } from '@repo/design/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design/components/ui/card';
import { Badge } from '@repo/design/components/ui/badge';

// Feature card component
function FeatureCard({ 
  icon,
  title, 
  description,
  badge
}: { 
  icon: IconName; 
  title: string; 
  description: string;
  badge?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full border-muted">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="p-2 bg-primary/10 rounded-lg inline-block">
              <AppIcon name={icon} className="h-5 w-5 text-primary" />
            </div>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl mt-4">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Stack item
function StackItem({ name, description }: { name: string; description: string }) {
  return (
    <div className="flex items-start space-x-3 py-3">
      <AppIcon name={IconNames.CheckCircle} className="h-5 w-5 text-green-600 mt-0.5" />
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <AppIcon name={IconNames.Sparkles} className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">TurboKit</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#stack" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Stack
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Docs
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <AppIcon name={IconNames.Github} className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <AppIcon name={IconNames.Twitter} className="h-5 w-5" />
            </Button>
            <Button asChild>
              <Link href="/signin">
                Get Started
                <AppIcon name={IconNames.ArrowRight} className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center space-y-8 max-w-[980px] mx-auto"
          >
            <Badge variant="secondary" className="px-4 py-1">
              <AppIcon name={IconNames.Sparkles} className="mr-2 h-3 w-3" />
              Powered by Convex & Next.js 15
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Ship{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                real-time apps
              </span>{' '}
              faster with AI assistance
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-[750px]">
              TurboKit is a Convex-native development platform that combines real-time data sync, 
              AI-powered development tools, and enterprise-ready components into one powerful stack.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/signin">
                  Start Building
                  <AppIcon name={IconNames.ArrowRight} className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://github.com/turbokit">
                  View on GitHub
                  <AppIcon name={IconNames.Github} className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-8">
              <div className="flex items-center gap-2">
                <AppIcon name={IconNames.Users} className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">2,000+ developers</span>
              </div>
              <div className="flex items-center gap-2">
                <AppIcon name={IconNames.Globe} className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">50+ countries</span>
              </div>
              <div className="flex items-center gap-2">
                <AppIcon name={IconNames.Zap} className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">10ms latency</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything you need to build modern apps
          </h2>
          <p className="text-xl text-muted-foreground max-w-[750px] mx-auto">
            From real-time sync to AI workflows, TurboKit provides all the tools you need
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={IconNames.Database}
            title="Real-time Database"
            description="Convex provides instant data sync across all clients with zero configuration. No WebSocket setup needed."
            badge="Core"
          />
          <FeatureCard
            icon={IconNames.Bot}
            title="AI Agent Integration"
            description="Built-in AI agent support with Convex workflows. Create intelligent features with minimal code."
            badge="AI"
          />
          <FeatureCard
            icon={IconNames.Workflow}
            title="Durable Workflows"
            description="Long-running, fault-tolerant workflows that survive server restarts and handle complex orchestration."
            badge="New"
          />
          <FeatureCard
            icon={IconNames.Code}
            title="Type-Safe End-to-End"
            description="Full TypeScript support from database schema to React components. Catch errors at compile time."
          />
          <FeatureCard
            icon={IconNames.Zap}
            title="Instant Deployment"
            description="Deploy to production in seconds with Vercel. Automatic preview deployments for every PR."
          />
          <FeatureCard
            icon={IconNames.Users}
            title="Auth & Permissions"
            description="Clerk authentication with row-level security. Fine-grained permissions out of the box."
          />
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="stack" className="border-y bg-muted/50">
        <div className="container py-24">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Modern stack, zero compromises
                </h2>
                <p className="text-xl text-muted-foreground">
                  Built with the latest technologies and best practices. Every choice is deliberate, 
                  optimized for developer experience and performance.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button asChild>
                  <Link href="/docs/stack">
                    Explore the Stack
                    <AppIcon name={IconNames.ChevronRight} className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="space-y-1">
              <StackItem
                name="Convex"
                description="Real-time database with subscriptions, functions, and file storage"
              />
              <StackItem
                name="Next.js 15"
                description="React framework with App Router, Server Components, and Actions"
              />
              <StackItem
                name="React 19"
                description="Latest React with Suspense, Transitions, and concurrent features"
              />
              <StackItem
                name="TypeScript"
                description="End-to-end type safety from database to UI components"
              />
              <StackItem
                name="Tailwind CSS v4"
                description="Utility-first CSS with modern design system primitives"
              />
              <StackItem
                name="Clerk Auth"
                description="Complete authentication with social logins and MFA"
              />
              <StackItem
                name="AI SDK"
                description="Vercel AI SDK with streaming, tools, and multiple providers"
              />
              <StackItem
                name="Turborepo"
                description="High-performance monorepo with intelligent caching"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-12 md:p-16 text-primary-foreground"
        >
          <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-[750px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to build something amazing?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of developers building the next generation of web applications with TurboKit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signin">
                  Get Started Free
                  <AppIcon name={IconNames.ArrowRight} className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
                <Link href="/docs">
                  Read Documentation
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <AppIcon name={IconNames.Sparkles} className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">TurboKit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The Convex-native development platform for building real-time applications.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-primary">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
                <li><Link href="/changelog" className="hover:text-primary">Changelog</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About</Link></li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
                <li><Link href="/security" className="hover:text-primary">Security</Link></li>
                <li><Link href="/cookies" className="hover:text-primary">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 TurboKit. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://github.com/turbokit">
                  <AppIcon name={IconNames.Github} className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://twitter.com/turbokit">
                  <AppIcon name={IconNames.Twitter} className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
