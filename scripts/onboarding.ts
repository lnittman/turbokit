import { select, text, multiselect, confirm } from '@clack/prompts';
import { XMLParser } from 'fast-xml-parser';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface ProjectSpecification {
  name: string;
  description: string;
  domain: string;
  features: Array<{
    name: string;
    priority: number;
    convexComponent?: string;
  }>;
  convexComponents: string[];
  agentConfiguration: {
    primaryAgent: string;
  };
}

export class AdaptiveOnboarding {
  private projectDir: string;
  private responses: Map<string, any> = new Map();

  constructor(projectDir: string) {
    this.projectDir = projectDir;
  }

  async run(): Promise<ProjectSpecification> {
    // 1. Project description
    const description = await text({
      message: 'What are you building? (describe in your own words)',
      placeholder: 'A SaaS app for...',
    });
    this.responses.set('description', description);

    // 2. Core features
    const features = await this.getFeatures();
    this.responses.set('features', features);

    // 3. Agent selection
    const agent = await select({
      message: 'Which AI coding assistant do you primarily use?',
      options: [
        { value: 'claude', label: 'Claude (Claude Code CLI)' },
        { value: 'cursor', label: 'Cursor' },
        { value: 'copilot', label: 'GitHub Copilot' },
        { value: 'gemini', label: 'Gemini' },
        { value: 'opencode', label: 'OpenCode' },
        { value: 'amp', label: 'Amp' },
        { value: 'codex', label: 'Codex' },
        { value: 'other', label: 'Other / Multiple' },
      ],
    });
    this.responses.set('agent', agent);

    // 4. Deployment readiness
    const hasAccounts = await confirm({
      message: 'Do you have Vercel and Convex accounts?',
      initialValue: false,
    });
    this.responses.set('hasAccounts', hasAccounts);

    // Build project specification
    return this.buildSpecification();
  }


  private async getFeatures() {
    const featureOptions = this.getFeatureOptions();
    
    return await multiselect({
      message: 'What features does your app need?',
      options: featureOptions,
      required: false,
    });
  }

  private getFeatureOptions() {
    return [
      { value: 'auth', label: 'User authentication' },
      { value: 'database', label: 'Data storage' },
      { value: 'realtime', label: 'Real-time updates' },
      { value: 'payments', label: 'Payments & subscriptions' },
      { value: 'email', label: 'Email notifications' },
      { value: 'ai', label: 'AI features' },
      { value: 'files', label: 'File uploads' },
      { value: 'search', label: 'Search functionality' },
      { value: 'workflows', label: 'Durable workflows' },
      { value: 'crons', label: 'Scheduled jobs' },
      { value: 'analytics', label: 'Analytics & metrics' },
      { value: 'ratelimit', label: 'Rate limiting' },
      { value: 'migrations', label: 'Database migrations' },
    ];
  }

  private buildSpecification(): ProjectSpecification {
    const description = String(this.responses.get('description'));
    const features = this.responses.get('features') || [];
    const agent = String(this.responses.get('agent'));

    // Map features to Convex components
    const convexComponents = this.mapFeaturesToComponents(features);

    // Build feature list with priorities
    const featureList = features.map((f: string, index: number) => ({
      name: this.getFeatureName(f),
      priority: index + 1,
      convexComponent: this.getComponentForFeature(f),
    }));

    return {
      name: this.extractProjectName(description),
      description,
      domain: this.identifyDomain(description),
      features: featureList,
      convexComponents,
      agentConfiguration: {
        primaryAgent: agent === 'other' ? 'claude' : agent,
      },
    };
  }

  private mapFeaturesToComponents(features: string[]): string[] {
    const components = new Set(['convex']); // Always include base

    const featureMap: Record<string, string> = {
      auth: '@convex-dev/auth',
      payments: '@convex-dev/polar',
      email: '@convex-dev/resend',
      ai: '@convex-dev/agent',
      realtime: '', // Built into Convex
      database: '', // Built into Convex
      files: '@convex-dev/storage',
      search: '@convex-dev/rag',
      workflows: '@convex-dev/workflow',
      crons: '@convex-dev/crons',
      analytics: '@convex-dev/aggregate',
      ratelimit: '@convex-dev/rate-limiter',
      migrations: '@convex-dev/migrations',
    };

    features.forEach((feature: string) => {
      const component = featureMap[feature];
      if (component) {
        components.add(component);
      }
    });

    return Array.from(components);
  }

  private getFeatureName(feature: string): string {
    const names: Record<string, string> = {
      auth: 'User Authentication',
      database: 'Data Storage',
      realtime: 'Real-time Updates',
      payments: 'Payments & Subscriptions',
      email: 'Email Notifications',
      ai: 'AI Integration',
      files: 'File Storage',
      search: 'Search Functionality',
      workflows: 'Durable Workflows',
      crons: 'Scheduled Jobs',
      analytics: 'Analytics & Metrics',
      ratelimit: 'Rate Limiting',
      migrations: 'Database Migrations',
    };
    return names[feature] || feature;
  }

  private getComponentForFeature(feature: string): string | undefined {
    const map: Record<string, string> = {
      auth: '@convex-dev/auth',
      payments: '@convex-dev/polar',
      email: '@convex-dev/resend',
      ai: '@convex-dev/agent',
      files: '@convex-dev/storage',
      search: '@convex-dev/rag',
      workflows: '@convex-dev/workflow',
      crons: '@convex-dev/crons',
      analytics: '@convex-dev/aggregate',
      ratelimit: '@convex-dev/rate-limiter',
      migrations: '@convex-dev/migrations',
    };
    return map[feature];
  }

  private extractProjectName(description: string): string {
    // Simple name extraction - could be enhanced
    const words = description.toLowerCase().split(/\s+/);
    const meaningful = words.find(w => w.length > 3 && !['the', 'and', 'for', 'with'].includes(w));
    return meaningful ? `${meaningful}-app` : 'turbokit-app';
  }

  private identifyDomain(description: string): string {
    const lower = description.toLowerCase();
    
    if (lower.includes('e-commerce') || lower.includes('shop')) return 'e-commerce';
    if (lower.includes('saas') || lower.includes('subscription')) return 'saas';
    if (lower.includes('social') || lower.includes('community')) return 'social';
    if (lower.includes('ai') || lower.includes('ml')) return 'ai';
    if (lower.includes('content') || lower.includes('blog')) return 'content';
    
    return 'general';
  }

}
