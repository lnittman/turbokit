import Link from 'next/link';
import { Button } from '@repo/design/components/ui/button';
import { Card } from '@repo/design/components/ui/card';
import { 
  ArrowRight, 
  Zap, 
  Database, 
  Bot, 
  Package,
  GitBranch,
  Shield,
  Sparkles,
  Terminal,
  Layers
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 border-b">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-8 max-w-[980px] mx-auto">
            {/* Version Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">v1.0.0 - Production Ready</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              TurboKit
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-[750px]">
              A modern monorepo template powered by Convex, Next.js, and AI agents. 
              Everything you need to build and ship real-time applications.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" asChild>
                <Link href="/docs/quickstart">
                  Quick Start
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://github.com/lnittman/turbokit">
                  View on GitHub
                  <GitBranch className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Quick Install */}
            <div className="mt-12 w-full max-w-2xl">
              <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
                <span className="text-muted-foreground">$</span> npx create-turbokit@latest my-app
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-24 border-b">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why TurboKit?</h2>
            <p className="text-xl text-muted-foreground">
              Start with a production-ready foundation, not a blank canvas
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <Database className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Convex Backend</h3>
              <p className="text-muted-foreground">
                Real-time database, serverless functions, file storage, and durable workflows 
                built-in. No additional backend needed.
              </p>
            </Card>

            <Card className="p-6">
              <Layers className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Monorepo Structure</h3>
              <p className="text-muted-foreground">
                Turborepo-powered workspace with shared packages, unified tooling, and 
                optimized builds out of the box.
              </p>
            </Card>

            <Card className="p-6">
              <Bot className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Agent Support</h3>
              <p className="text-muted-foreground">
                Convex Agent component integrated for building AI-powered features with 
                memory, tools, and workflows.
              </p>
            </Card>

            <Card className="p-6">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Everything</h3>
              <p className="text-muted-foreground">
                WebSocket subscriptions by default. Changes sync instantly across all 
                connected clients without polling.
              </p>
            </Card>

            <Card className="p-6">
              <Package className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Design System</h3>
              <p className="text-muted-foreground">
                Comprehensive component library with shadcn/ui, Tailwind v4, and 
                motion primitives pre-configured.
              </p>
            </Card>

            <Card className="p-6">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Auth & Security</h3>
              <p className="text-muted-foreground">
                Clerk authentication, row-level security, and environment-based 
                configuration ready to deploy.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-24 border-b">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold mb-6">What's Included</h2>
              <p className="text-xl text-muted-foreground mb-8">
                TurboKit comes with everything pre-configured so you can focus on building 
                your product, not setting up infrastructure.
              </p>
              <ul className="space-y-4">
                {[
                  'Next.js 15 with App Router',
                  'Convex for backend (database, functions, storage)',
                  'Clerk for authentication',
                  'AI agents with Convex Agent component',
                  'Tailwind CSS v4 + shadcn/ui',
                  'Testing with Vitest & Playwright',
                  'Type-safe from database to frontend',
                  'GitHub Actions CI/CD',
                  'Vercel deployment ready',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6">Project Structure</h2>
              <div className="bg-secondary/30 rounded-lg p-6 font-mono text-sm">
                <pre className="text-muted-foreground">{`turbokit/
├── apps/
│   ├── app/          # Main Next.js application
│   └── docs/         # App documentation
├── packages/
│   ├── backend/      # Convex backend
│   ├── design/       # Design system & UI
│   ├── auth/         # Auth wrapper
│   └── testing/      # Test utilities
└── docs/             # TurboKit documentation`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get Started</h2>
            <p className="text-xl text-muted-foreground">
              Choose your path to building with TurboKit
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <Terminal className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quick Start</h3>
              <p className="text-muted-foreground mb-4">
                Get up and running in under 5 minutes with our CLI
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/docs/quickstart">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>

            <Card className="p-6">
              <Database className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Learn Convex</h3>
              <p className="text-muted-foreground mb-4">
                Master the real-time backend that powers TurboKit
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/docs/convex">
                  Explore Backend
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>

            <Card className="p-6">
              <Bot className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Agents</h3>
              <p className="text-muted-foreground mb-4">
                Build intelligent features with the Agent component
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/docs/ai">
                  AI Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}