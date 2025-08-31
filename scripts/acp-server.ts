import { AgentProtocolServer, type AgentProtocolHandler } from '@zed-industries/agent-client-protocol';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';
import { XMLParser } from 'fast-xml-parser';

interface ProjectSpecification {
  name: string;
  description: string;
  domain: string;
  expertiseLevel: 'novice' | 'intermediate' | 'expert';
  features: Array<{
    name: string;
    priority: number;
    convexComponent?: string;
    implementationNotes: string;
  }>;
  technicalStack: {
    frontend: string;
    backend: string;
    styling: string;
    state: string;
    auth: string;
    payments?: string;
  };
  convexComponents: string[];
  deployment: {
    platform: string;
    environments: string[];
    domain?: string;
  };
  agentConfiguration: {
    primaryAgent: string;
    rulerConfig: string;
    contextDepth: 'minimal' | 'standard' | 'comprehensive';
  };
}

export class TurboKitACPServer implements AgentProtocolHandler {
  private server: AgentProtocolServer;
  private projectRoot: string;
  private projectSpec: ProjectSpecification | null = null;
  private onboardingPrompts: any;
  private haloSystem: any;
  private currentStage: string = 'project-essence';
  private userResponses: Map<string, any> = new Map();

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.server = new AgentProtocolServer(this);
    this.loadOnboardingPrompts();
    this.loadHaloSystem();
  }

  private loadOnboardingPrompts() {
    const promptPath = join(__dirname, '../prompts/adaptive-onboarding.xml');
    if (existsSync(promptPath)) {
      const xmlContent = readFileSync(promptPath, 'utf-8');
      const parser = new XMLParser({ 
        ignoreAttributes: false, 
        attributeNamePrefix: '@_' 
      });
      this.onboardingPrompts = parser.parse(xmlContent);
    }
  }

  private loadHaloSystem() {
    const haloPath = resolve(process.env.HOME!, '.halo');
    if (existsSync(haloPath)) {
      this.haloSystem = {
        commands: this.loadHaloDirectory(join(haloPath, 'commands')),
        components: this.loadHaloDirectory(join(haloPath, 'components')),
        roles: this.loadHaloDirectory(join(haloPath, 'roles')),
        rules: this.loadHaloDirectory(join(haloPath, 'rules'))
      };
    }
  }

  private loadHaloDirectory(dirPath: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (existsSync(dirPath)) {
      // Load all .md and .xml files from directory
      const files = execSync(`find ${dirPath} -name "*.md" -o -name "*.xml"`, { encoding: 'utf-8' })
        .split('\n')
        .filter(Boolean);
      
      files.forEach(file => {
        const content = readFileSync(file, 'utf-8');
        const key = file.replace(dirPath, '').replace(/^\//, '');
        result[key] = content;
      });
    }
    return result;
  }

  // ACP Protocol Methods
  async initialize(params: any): Promise<any> {
    console.log('TurboKit ACP Server initializing...');
    
    // Start adaptive onboarding if no project spec exists
    if (!this.projectSpec) {
      return this.startOnboarding();
    }

    return {
      capabilities: {
        contextProvider: true,
        scaffolding: true,
        deployment: true,
        agentConfiguration: true
      },
      version: '1.0.0',
      name: 'TurboKit ACP Server'
    };
  }

  async getContext(params: any): Promise<any> {
    // Provide comprehensive context to the agent
    return {
      project: this.projectSpec,
      template: this.getTemplateStructure(),
      convexComponents: this.getAvailableComponents(),
      haloSystem: this.haloSystem,
      rulerConfig: this.getRulerConfiguration(),
      deploymentTools: this.getMCPServers(),
      instructions: this.getAgentInstructions()
    };
  }

  async processPrompt(params: { prompt: string }): Promise<any> {
    const { prompt } = params;
    
    // Process user response based on current onboarding stage
    if (this.currentStage) {
      this.userResponses.set(this.currentStage, prompt);
      const nextStage = this.determineNextStage(prompt);
      
      if (nextStage === 'complete') {
        this.projectSpec = this.buildProjectSpecification();
        return this.scaffoldProject();
      }
      
      this.currentStage = nextStage;
      return this.getStagePrompt(nextStage);
    }

    // Handle general prompts after onboarding
    return this.handleAgentRequest(prompt);
  }

  private startOnboarding(): any {
    return {
      type: 'onboarding',
      stage: 'project-essence',
      prompt: 'Welcome to TurboKit! Let\'s create something amazing together.\n\nWhat are you building? (describe in your own words)',
      suggestions: [
        'A SaaS application for...',
        'An e-commerce platform that...',
        'A social platform where...',
        'An AI-powered tool for...'
      ]
    };
  }

  private determineNextStage(response: string): string {
    // Analyze response to determine expertise level and next appropriate stage
    const expertiseLevel = this.detectExpertiseLevel(response);
    this.userResponses.set('expertise', expertiseLevel);

    const stages = [
      'project-essence',
      'user-understanding', 
      'feature-discovery',
      'agent-selection',
      'deployment-readiness'
    ];

    const currentIndex = stages.indexOf(this.currentStage);
    if (currentIndex < stages.length - 1) {
      return stages[currentIndex + 1];
    }
    
    return 'complete';
  }

  private detectExpertiseLevel(response: string): 'novice' | 'intermediate' | 'expert' {
    const lower = response.toLowerCase();
    
    // Expert indicators
    if (
      lower.includes('microservice') ||
      lower.includes('event-driven') ||
      lower.includes('cqrs') ||
      lower.includes('ddd') ||
      lower.includes('performance') ||
      lower.includes('scale') ||
      /\b(k8s|kubernetes|docker|terraform)\b/.test(lower)
    ) {
      return 'expert';
    }
    
    // Intermediate indicators
    if (
      lower.includes('react') ||
      lower.includes('next') ||
      lower.includes('api') ||
      lower.includes('database') ||
      lower.includes('auth') ||
      lower.includes('deploy')
    ) {
      return 'intermediate';
    }
    
    // Default to novice
    return 'novice';
  }

  private getStagePrompt(stage: string): any {
    const expertise = this.userResponses.get('expertise') || 'novice';
    
    // Get appropriate prompt from XML based on stage and expertise
    const prompts = {
      'user-understanding': {
        novice: 'Who will use this and what problem does it solve for them?',
        intermediate: 'What\'s your target user base and primary use cases?',
        expert: 'User segments, scale expectations, and performance requirements?'
      },
      'feature-discovery': {
        novice: 'What are the 3 most important things your app needs to do?\n\nCommon features:\n• User accounts/login\n• Store and retrieve data\n• Send notifications\n• Accept payments\n• Real-time updates',
        intermediate: 'Core features and technical requirements?',
        expert: 'Architecture preferences and component selection?'
      },
      'agent-selection': {
        all: 'Which coding assistant(s) do you prefer to use?\n\n1. Claude (Claude Code CLI)\n2. Cursor\n3. GitHub Copilot\n4. OpenCode\n5. Amp\n6. Gemini\n7. Codex\n8. Zed Assistant\n9. Multiple agents\n10. Not sure / Help me choose'
      },
      'deployment-readiness': {
        novice: 'Do you have accounts with Vercel and Convex? (we\'ll help you set them up if not)',
        intermediate: 'Deployment preferences: production domain, environment strategy?',
        expert: 'CI/CD preferences, monitoring, and infrastructure requirements?'
      }
    };

    const stagePrompts = prompts[stage as keyof typeof prompts];
    const prompt = stagePrompts[expertise as keyof typeof stagePrompts] || stagePrompts['all' as keyof typeof stagePrompts];

    return {
      type: 'onboarding',
      stage,
      prompt,
      expertise
    };
  }

  private buildProjectSpecification(): ProjectSpecification {
    const responses = this.userResponses;
    
    // Extract features from responses
    const features = this.extractFeatures(responses.get('feature-discovery') || '');
    
    // Map features to Convex components
    const convexComponents = this.mapFeaturesToComponents(features);
    
    // Determine agent configuration
    const selectedAgent = this.parseAgentSelection(responses.get('agent-selection') || 'claude');
    
    return {
      name: this.extractProjectName(responses.get('project-essence') || 'my-app'),
      description: responses.get('project-essence') || '',
      domain: this.identifyDomain(responses.get('project-essence') || ''),
      expertiseLevel: responses.get('expertise') || 'intermediate',
      features,
      technicalStack: {
        frontend: 'Next.js 15 + React 19',
        backend: 'Convex',
        styling: 'Tailwind CSS v4',
        state: 'Jotai + SWR',
        auth: 'Clerk',
        payments: features.some(f => f.name.includes('payment')) ? 'Polar' : undefined
      },
      convexComponents,
      deployment: {
        platform: 'Vercel + Convex',
        environments: ['development', 'production'],
        domain: this.extractDomain(responses.get('deployment-readiness'))
      },
      agentConfiguration: {
        primaryAgent: selectedAgent,
        rulerConfig: this.generateRulerConfig(selectedAgent),
        contextDepth: this.determineContextDepth(responses.get('expertise'))
      }
    };
  }

  private extractFeatures(response: string): ProjectSpecification['features'] {
    // Smart feature extraction from natural language
    const features: ProjectSpecification['features'] = [];
    const lower = response.toLowerCase();
    
    const featureMap = {
      'login|auth|user|account': { name: 'User Authentication', component: '@convex-dev/auth' },
      'payment|billing|subscription|charge': { name: 'Payments & Billing', component: '@convex-dev/polar' },
      'email|notification|alert': { name: 'Email Notifications', component: '@convex-dev/resend' },
      'real-time|live|instant': { name: 'Real-time Updates', component: 'convex-native' },
      'ai|chat|assistant|gpt': { name: 'AI Integration', component: '@convex-dev/agent' },
      'search|find|query': { name: 'Search', component: '@convex-dev/rag' },
      'schedule|cron|recurring': { name: 'Scheduled Tasks', component: '@convex-dev/crons' },
      'upload|file|image|document': { name: 'File Storage', component: '@convex-dev/storage' }
    };
    
    Object.entries(featureMap).forEach(([pattern, feature], index) => {
      if (new RegExp(pattern).test(lower)) {
        features.push({
          name: feature.name,
          priority: index + 1,
          convexComponent: feature.component,
          implementationNotes: `Implement ${feature.name} using ${feature.component}`
        });
      }
    });
    
    return features;
  }

  private mapFeaturesToComponents(features: ProjectSpecification['features']): string[] {
    const components = new Set<string>();
    
    // Always include base components
    components.add('convex');
    components.add('@convex-dev/rate-limiter');
    components.add('@convex-dev/migrations');
    
    // Add feature-specific components
    features.forEach(feature => {
      if (feature.convexComponent && feature.convexComponent !== 'convex-native') {
        components.add(feature.convexComponent);
      }
    });
    
    return Array.from(components);
  }

  private async scaffoldProject(): Promise<any> {
    if (!this.projectSpec) {
      throw new Error('No project specification available');
    }

    console.log('Scaffolding project with specification:', this.projectSpec);

    // 1. Initialize project structure
    await this.initializeProjectStructure();
    
    // 2. Configure Convex components
    await this.configureConvexComponents();
    
    // 3. Set up Ruler for selected agents
    await this.configureRuler();
    
    // 4. Generate agent-specific context files
    await this.generateAgentContext();
    
    // 5. Set up deployment configuration
    await this.configureDeployment();

    return {
      type: 'scaffold-complete',
      message: `Project "${this.projectSpec.name}" scaffolded successfully!`,
      projectPath: this.projectRoot,
      nextSteps: this.getNextSteps(),
      deploymentInstructions: this.getDeploymentInstructions()
    };
  }

  private async initializeProjectStructure(): Promise<void> {
    // Create project directories if they don't exist
    const dirs = [
      'apps/app',
      'packages/backend/convex',
      'packages/ui',
      'packages/services',
      '.ruler'
    ];
    
    dirs.forEach(dir => {
      const fullPath = join(this.projectRoot, dir);
      if (!existsSync(fullPath)) {
        execSync(`mkdir -p ${fullPath}`);
      }
    });
  }

  private async configureConvexComponents(): Promise<void> {
    if (!this.projectSpec) return;
    
    // Update convex.config.ts with selected components
    const configPath = join(this.projectRoot, 'convex.config.ts');
    const components = this.projectSpec.convexComponents;
    
    // Generate config content
    const imports = components.map(comp => {
      const name = comp.replace('@convex-dev/', '').replace(/-/g, '_');
      return `import ${name} from "${comp}/convex.config";`;
    }).join('\n');
    
    const uses = components.map(comp => {
      const name = comp.replace('@convex-dev/', '').replace(/-/g, '_');
      return `app.use(${name});`;
    }).join('\n');
    
    const config = `import { defineApp } from "convex/server";
${imports}

const app = defineApp();

${uses}

export default app;
`;
    
    writeFileSync(configPath, config);
  }

  private async configureRuler(): Promise<void> {
    if (!this.projectSpec) return;
    
    const rulerConfig = this.generateRulerConfig(this.projectSpec.agentConfiguration.primaryAgent);
    const rulerPath = join(this.projectRoot, '.ruler/ruler.toml');
    
    writeFileSync(rulerPath, rulerConfig);
    
    // Apply ruler configuration
    execSync('ruler apply', { cwd: this.projectRoot });
  }

  private generateRulerConfig(agent: string): string {
    const agentConfigs = {
      claude: `[agents.claude]
enabled = true
output_path = "CLAUDE.md"`,
      cursor: `[agents.cursor]
enabled = true`,
      copilot: `[agents.copilot]
enabled = true
output_path = ".github/copilot-instructions.md"`,
      opencode: `[agents.opencode]
enabled = true`,
      amp: `[agents.amp]
enabled = true`,
      gemini: `[agents.gemini-cli]
enabled = true`,
      codex: `[agents.codex]
enabled = true`
    };

    return `# TurboKit Ruler Configuration
# Generated for ${agent} as primary agent

default_agents = ["${agent}"]
nested = true

${agentConfigs[agent as keyof typeof agentConfigs] || agentConfigs.claude}

# MCP Servers for enhanced capabilities
[mcp_servers.convex]
command = "npx"
args = ["-y", "@convex-dev/mcp-server", "--deployment", "production"]

[mcp_servers.vercel]
command = "npx"
args = ["-y", "@vercel/mcp-server"]

[mcp_servers.filesystem]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "."]
`;
  }

  private async generateAgentContext(): Promise<void> {
    // Generate comprehensive context for the selected agent
    const contextPath = join(this.projectRoot, 'CLAUDE.md');
    const context = this.buildAgentContext();
    
    writeFileSync(contextPath, context);
  }

  private buildAgentContext(): string {
    if (!this.projectSpec) return '';
    
    return `# ${this.projectSpec.name}

## Project Overview
${this.projectSpec.description}

## Architecture
- **Frontend**: ${this.projectSpec.technicalStack.frontend}
- **Backend**: ${this.projectSpec.technicalStack.backend}
- **Styling**: ${this.projectSpec.technicalStack.styling}
- **State Management**: ${this.projectSpec.technicalStack.state}
- **Authentication**: ${this.projectSpec.technicalStack.auth}
${this.projectSpec.technicalStack.payments ? `- **Payments**: ${this.projectSpec.technicalStack.payments}` : ''}

## Core Features
${this.projectSpec.features.map(f => `- ${f.name}: ${f.implementationNotes}`).join('\n')}

## Convex Components
${this.projectSpec.convexComponents.map(c => `- ${c}`).join('\n')}

## Development Guidelines
- All server logic in \`packages/backend/convex\`
- Real-time subscriptions by default
- Type-safe end-to-end with generated types
- Component-based architecture

## Deployment
- Platform: ${this.projectSpec.deployment.platform}
- Environments: ${this.projectSpec.deployment.environments.join(', ')}
${this.projectSpec.deployment.domain ? `- Domain: ${this.projectSpec.deployment.domain}` : ''}
`;
  }

  private async configureDeployment(): Promise<void> {
    // Set up deployment scripts
    const deployScript = `#!/bin/bash
# TurboKit Deployment Script

echo "Deploying ${this.projectSpec?.name}..."

# Deploy to Convex
npx convex deploy --prod

# Deploy to Vercel
vercel --prod

echo "Deployment complete!"
`;
    
    const scriptPath = join(this.projectRoot, 'scripts/deploy.sh');
    writeFileSync(scriptPath, deployScript);
    execSync(`chmod +x ${scriptPath}`);
  }

  private getNextSteps(): string[] {
    const expertise = this.projectSpec?.expertiseLevel || 'intermediate';
    
    if (expertise === 'novice') {
      return [
        '1. Run `npm install` to install dependencies',
        '2. Run `npx convex dev` to start Convex backend',
        '3. Run `npm run dev` in another terminal to start the app',
        '4. Open http://localhost:3000 to see your app',
        '5. Start building your features!'
      ];
    }
    
    return [
      'npm install',
      'npx convex dev',
      'npm run dev',
      'Begin feature implementation with your preferred agent'
    ];
  }

  private getDeploymentInstructions(): string {
    return `
To deploy your application:

1. **Convex Setup**:
   - Run \`npx convex deploy\` to create production deployment
   - Set environment variables in Convex dashboard

2. **Vercel Setup**:
   - Run \`vercel\` to deploy frontend
   - Connect to GitHub for automatic deployments

3. **Connect Services**:
   - Add Convex URL to Vercel environment variables
   - Configure custom domain if needed

Your agent has full context and can help with deployment!
`;
  }

  // Helper methods
  private getTemplateStructure(): any {
    return {
      apps: ['app', 'docs'],
      packages: ['backend', 'ui', 'services', 'typescript-config'],
      configuration: ['convex.config.ts', 'turbo.json', 'package.json']
    };
  }

  private getAvailableComponents(): string[] {
    return [
      '@convex-dev/agent',
      '@convex-dev/workflow', 
      '@convex-dev/rate-limiter',
      '@convex-dev/resend',
      '@convex-dev/polar',
      '@convex-dev/migrations',
      '@convex-dev/aggregate',
      '@convex-dev/action-retrier',
      '@convex-dev/crons',
      '@convex-dev/rag'
    ];
  }

  private getRulerConfiguration(): any {
    const rulerPath = join(this.projectRoot, '.ruler/ruler.toml');
    if (existsSync(rulerPath)) {
      return readFileSync(rulerPath, 'utf-8');
    }
    return null;
  }

  private getMCPServers(): any {
    return {
      convex: '@convex-dev/mcp-server',
      vercel: '@vercel/mcp-server',
      filesystem: '@modelcontextprotocol/server-filesystem'
    };
  }

  private getAgentInstructions(): string {
    return `You are working with a TurboKit project - a Convex-native turborepo template.

Key principles:
- All server logic in packages/backend/convex
- Real-time subscriptions by default
- Type-safe end-to-end
- Component-based architecture

Use the provided context to understand the project structure and implement features efficiently.`;
  }

  private extractProjectName(response: string): string {
    // Try to extract a name from the description
    const words = response.toLowerCase().split(/\s+/);
    const keywords = ['app', 'platform', 'tool', 'system', 'service'];
    
    for (const keyword of keywords) {
      const index = words.indexOf(keyword);
      if (index > 0) {
        return words[index - 1] + '-' + keyword;
      }
    }
    
    // Fallback to first meaningful word
    const meaningful = words.find(w => w.length > 3 && !['the', 'and', 'for', 'with'].includes(w));
    return meaningful || 'turbokit-app';
  }

  private identifyDomain(response: string): string {
    const lower = response.toLowerCase();
    
    if (lower.includes('e-commerce') || lower.includes('shop') || lower.includes('store')) return 'e-commerce';
    if (lower.includes('saas') || lower.includes('subscription')) return 'saas';
    if (lower.includes('social') || lower.includes('community')) return 'social';
    if (lower.includes('ai') || lower.includes('ml') || lower.includes('intelligence')) return 'ai';
    if (lower.includes('content') || lower.includes('blog') || lower.includes('publish')) return 'content';
    
    return 'general';
  }

  private parseAgentSelection(response: string): string {
    const lower = response.toLowerCase();
    
    if (lower.includes('claude')) return 'claude';
    if (lower.includes('cursor')) return 'cursor';
    if (lower.includes('copilot')) return 'copilot';
    if (lower.includes('opencode')) return 'opencode';
    if (lower.includes('amp')) return 'amp';
    if (lower.includes('gemini')) return 'gemini';
    if (lower.includes('codex')) return 'codex';
    if (lower.includes('zed')) return 'zed';
    
    return 'claude'; // Default
  }

  private extractDomain(response: string | undefined): string | undefined {
    if (!response) return undefined;
    
    // Look for domain patterns
    const domainMatch = response.match(/([a-z0-9-]+\.(com|io|app|dev|co))/i);
    return domainMatch ? domainMatch[1] : undefined;
  }

  private determineContextDepth(expertise: string): 'minimal' | 'standard' | 'comprehensive' {
    switch(expertise) {
      case 'novice': return 'comprehensive';
      case 'expert': return 'minimal';
      default: return 'standard';
    }
  }

  private async handleAgentRequest(prompt: string): Promise<any> {
    // Handle post-onboarding agent requests
    return {
      type: 'agent-response',
      response: `Processing: ${prompt}`,
      context: await this.getContext({})
    };
  }

  // Start the server
  async start() {
    const port = process.env.ACP_PORT || 3456;
    console.log(`TurboKit ACP Server listening on port ${port}`);
    this.server.listen(port);
  }
}
