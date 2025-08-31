#!/usr/bin/env tsx

/**
 * TurboKit ACP-Compliant Server
 * Fully implements the Agent Client Protocol specification
 * for seamless integration with ACP-compatible editors and tools
 */

import {
  Agent,
  AgentSideConnection,
  RequestError,
  type InitializeRequest,
  type InitializeResponse,
  type NewSessionRequest,
  type NewSessionResponse,
  type LoadSessionRequest,
  type AuthenticateRequest,
  type PromptRequest,
  type PromptResponse,
  type CancelNotification,
  type SessionUpdate,
  type ToolCallUpdate,
  type RequestPermissionRequest,
  type RequestPermissionResponse,
  type Content,
  type ToolCallId,
  type SessionId,
  type StopReason,
  type AgentCapabilities,
  type AuthMethod,
  type PromptCapabilities,
  type McpServer,
  type PlanEntry,
} from '@zed-industries/agent-client-protocol';

import { WritableStream, ReadableStream } from 'node:stream/web';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { execSync, spawn } from 'child_process';
import { XMLParser } from 'fast-xml-parser';
// No direct LLM SDKs here; the ACP client owns generation.

// Session state management
interface SessionState {
  id: SessionId;
  cwd: string;
  mcpServers: McpServer[];
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: Content[];
  }>;
  toolCalls: Map<ToolCallId, ToolCallUpdate>;
  plan: PlanEntry[];
  isActive: boolean;
  cancelRequested: boolean;
}

// Tool definition
interface Tool {
  name: string;
  description: string;
  inputSchema: object;
  requiresPermission: boolean;
  execute: (input: any, session: SessionState) => Promise<any>;
}

/**
 * TurboKit ACP Agent Implementation
 * Provides full ACP compliance with advanced features
 */
export class TurboKitAgent implements Agent {
  private connection: AgentSideConnection;
  private sessions: Map<SessionId, SessionState> = new Map();
  private capabilities: AgentCapabilities;
  private authMethods: AuthMethod[];
  private tools: Map<string, Tool> = new Map();
  // No LLM provider state maintained here.
  private projectRoot: string;
  private haloSystem: any;

  constructor(connection: AgentSideConnection, projectRoot: string = process.cwd()) {
    this.connection = connection;
    this.projectRoot = projectRoot;
    
    // Initialize capabilities
    this.capabilities = {
      loadSession: true,
      promptCapabilities: {
        image: true,
        audio: false,
        embeddedContext: true,
      } as PromptCapabilities,
    };

    // Initialize auth methods
    this.authMethods = [
      {
        methodId: 'api-key',
        displayName: 'API Key',
        description: 'Authenticate using OpenAI or Anthropic API key',
      },
    ];

    // No direct LLM initialization; ACP client handles it.
    
    // Initialize built-in tools
    this.initializeTools();
    
    // Load Halo system if available
    this.loadHaloSystem();
  }

  // No LLM initialization function.

  private loadHaloSystem() {
    const haloPath = resolve(process.env.HOME!, '.halo');
    if (existsSync(haloPath)) {
      this.haloSystem = {
        commands: this.loadDirectory(join(haloPath, 'commands')),
        components: this.loadDirectory(join(haloPath, 'components')),
        roles: this.loadDirectory(join(haloPath, 'roles')),
        rules: this.loadDirectory(join(haloPath, 'rules')),
      };
    }
  }

  private loadDirectory(dirPath: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (existsSync(dirPath)) {
      try {
        const files = execSync(`find "${dirPath}" -name "*.md" -o -name "*.xml" 2>/dev/null`, { 
          encoding: 'utf-8' 
        }).split('\n').filter(Boolean);
        
        files.forEach(file => {
          result[file.replace(dirPath, '').replace(/^\//, '')] = readFileSync(file, 'utf-8');
        });
      } catch (error) {
        console.error(`Error loading directory ${dirPath}:`, error);
      }
    }
    return result;
  }

  private initializeTools() {
    // File system tools
    this.tools.set('read_file', {
      name: 'read_file',
      description: 'Read contents of a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to read' },
        },
        required: ['path'],
      },
      requiresPermission: true,
      execute: async (input, session) => {
        const fullPath = resolve(session.cwd, input.path);
        return readFileSync(fullPath, 'utf-8');
      },
    });

    this.tools.set('write_file', {
      name: 'write_file',
      description: 'Write content to a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to write' },
          content: { type: 'string', description: 'Content to write' },
        },
        required: ['path', 'content'],
      },
      requiresPermission: true,
      execute: async (input, session) => {
        const fullPath = resolve(session.cwd, input.path);
        const dir = dirname(fullPath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        writeFileSync(fullPath, input.content);
        return { success: true, path: fullPath };
      },
    });

    this.tools.set('execute_command', {
      name: 'execute_command',
      description: 'Execute a shell command',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command to execute' },
        },
        required: ['command'],
      },
      requiresPermission: true,
      execute: async (input, session) => {
        try {
          const output = execSync(input.command, { 
            cwd: session.cwd,
            encoding: 'utf-8',
            env: { ...process.env, NO_COLOR: '1' },
          });
          return { success: true, output };
        } catch (error: any) {
          return { success: false, error: error.message, output: error.stdout || '' };
        }
      },
    });

    this.tools.set('search_files', {
      name: 'search_files',
      description: 'Search for files matching a pattern',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'Search pattern or text' },
          fileTypes: { type: 'array', items: { type: 'string' }, description: 'File extensions to search' },
        },
        required: ['pattern'],
      },
      requiresPermission: false,
      execute: async (input, session) => {
        const extensions = input.fileTypes?.join(',') || 'ts,tsx,js,jsx,json';
        const command = `rg -l "${input.pattern}" --type-add 'custom:*.{${extensions}}' --type custom`;
        try {
          const output = execSync(command, { 
            cwd: session.cwd,
            encoding: 'utf-8',
          });
          return output.split('\n').filter(Boolean);
        } catch {
          return [];
        }
      },
    });

    // TurboKit-specific tools
    this.tools.set('scaffold_turbokit', {
      name: 'scaffold_turbokit',
      description: 'Scaffold a new TurboKit project with Convex',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Project name' },
          features: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Features to include (auth, payments, ai, email, etc.)',
          },
        },
        required: ['name'],
      },
      requiresPermission: true,
      execute: async (input, session) => {
        const features = input.features || ['auth', 'ai'];
        const components = this.mapFeaturesToComponents(features);
        
        // Create project structure
        const projectPath = join(session.cwd, input.name);
        mkdirSync(projectPath, { recursive: true });
        
        // Initialize package.json
        const packageJson = {
          name: input.name,
          version: '0.1.0',
          private: true,
          workspaces: ['apps/*', 'packages/*'],
          scripts: {
            'dev': 'turbo dev',
            'build': 'turbo build',
            'lint': 'turbo lint',
            'typecheck': 'turbo typecheck',
          },
          devDependencies: {
            'turbo': '^2.0.0',
            'typescript': '^5.5.0',
          },
        };
        
        writeFileSync(
          join(projectPath, 'package.json'),
          JSON.stringify(packageJson, null, 2),
        );
        
        // Create Convex config
        const convexConfig = this.generateConvexConfig(components);
        mkdirSync(join(projectPath, 'packages/backend'), { recursive: true });
        writeFileSync(
          join(projectPath, 'packages/backend/convex.config.ts'),
          convexConfig,
        );
        
        return {
          success: true,
          projectPath,
          features,
          components,
          nextSteps: [
            'cd ' + input.name,
            'pnpm install',
            'npx convex dev',
            'pnpm dev',
          ],
        };
      },
    });

    this.tools.set('add_convex_component', {
      name: 'add_convex_component',
      description: 'Add a Convex component to the project',
      inputSchema: {
        type: 'object',
        properties: {
          component: { 
            type: 'string',
            description: 'Component name (e.g., @convex-dev/agent, @convex-dev/resend)',
          },
        },
        required: ['component'],
      },
      requiresPermission: true,
      execute: async (input, session) => {
        // Install the component
        execSync(`pnpm add ${input.component}`, { cwd: session.cwd });
        
        // Update convex.config.ts
        const configPath = join(session.cwd, 'packages/backend/convex.config.ts');
        if (existsSync(configPath)) {
          let config = readFileSync(configPath, 'utf-8');
          const componentName = input.component.replace('@convex-dev/', '').replace(/-/g, '_');
          
          if (!config.includes(input.component)) {
            // Add import
            const importLine = `import ${componentName} from "${input.component}/convex.config";`;
            config = config.replace(
              /import { defineApp } from "convex\/server";/,
              `import { defineApp } from "convex/server";\n${importLine}`,
            );
            
            // Add use statement
            const useLine = `app.use(${componentName});`;
            config = config.replace(
              /export default app;/,
              `${useLine}\n\nexport default app;`,
            );
            
            writeFileSync(configPath, config);
          }
        }
        
        return { success: true, component: input.component };
      },
    });
  }

  private mapFeaturesToComponents(features: string[]): string[] {
    const componentMap: Record<string, string> = {
      'auth': '@convex-dev/auth',
      'payments': '@convex-dev/polar',
      'email': '@convex-dev/resend',
      'ai': '@convex-dev/agent',
      'search': '@convex-dev/rag',
      'workflow': '@convex-dev/workflow',
      'cron': '@convex-dev/crons',
      'storage': '@convex-dev/storage',
    };

    const components = new Set<string>(['convex']);
    features.forEach(feature => {
      if (componentMap[feature]) {
        components.add(componentMap[feature]);
      }
    });

    return Array.from(components);
  }

  private generateConvexConfig(components: string[]): string {
    const imports = components
      .filter(c => c !== 'convex')
      .map(comp => {
        const name = comp.replace('@convex-dev/', '').replace(/-/g, '_');
        return `import ${name} from "${comp}/convex.config";`;
      })
      .join('\n');

    const uses = components
      .filter(c => c !== 'convex')
      .map(comp => {
        const name = comp.replace('@convex-dev/', '').replace(/-/g, '_');
        return `app.use(${name});`;
      })
      .join('\n');

    return `import { defineApp } from "convex/server";
${imports}

const app = defineApp();

${uses}

export default app;
`;
  }

  // ACP Protocol Implementation

  async initialize(params: InitializeRequest): Promise<InitializeResponse> {
    console.log('TurboKit Agent initializing...');
    
    return {
      protocolVersion: 1,
      agentCapabilities: this.capabilities,
      authMethods: this.authMethods,
    };
  }

  async authenticate(params: AuthenticateRequest): Promise<void> {
    // Handle authentication if needed
    if (params.methodId === 'api-key') {
      // Authentication would be handled via environment variables
      if (!this.anthropic && !this.openai) {
        throw RequestError.invalidRequest({
          message: 'No API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY',
        });
      }
    } else {
      throw RequestError.invalidParams({
        message: `Unknown authentication method: ${params.methodId}`,
      });
    }
  }

  async newSession(params: NewSessionRequest): Promise<NewSessionResponse> {
    const sessionId = `sess_${uuidv4()}` as SessionId;
    
    const session: SessionState = {
      id: sessionId,
      cwd: params.cwd,
      mcpServers: params.mcpServers || [],
      messages: [],
      toolCalls: new Map(),
      plan: [],
      isActive: true,
      cancelRequested: false,
    };

    this.sessions.set(sessionId, session);
    
    console.log(`New session created: ${sessionId} in ${params.cwd}`);
    
    return { sessionId };
  }

  async loadSession(params: LoadSessionRequest): Promise<void> {
    const session = this.sessions.get(params.sessionId);
    
    if (!session) {
      // Try to load from disk if persisted
      const sessionPath = join(this.projectRoot, '.acp-sessions', `${params.sessionId}.json`);
      if (existsSync(sessionPath)) {
        const savedSession = JSON.parse(readFileSync(sessionPath, 'utf-8'));
        
        // Restore session
        const restoredSession: SessionState = {
          ...savedSession,
          id: params.sessionId,
          cwd: params.cwd,
          mcpServers: params.mcpServers || [],
          toolCalls: new Map(savedSession.toolCalls || []),
          isActive: true,
          cancelRequested: false,
        };
        
        this.sessions.set(params.sessionId, restoredSession);
        
        // Stream conversation history back to client
        for (const message of restoredSession.messages) {
          if (message.role === 'user') {
            for (const content of message.content) {
              await this.connection.sessionUpdate({
                sessionId: params.sessionId,
                update: {
                  sessionUpdate: 'user_message_chunk',
                  content,
                } as SessionUpdate,
              });
            }
          } else if (message.role === 'assistant') {
            for (const content of message.content) {
              await this.connection.sessionUpdate({
                sessionId: params.sessionId,
                update: {
                  sessionUpdate: 'agent_message_chunk',
                  content,
                } as SessionUpdate,
              });
            }
          }
        }
        
        // Stream tool calls
        for (const [toolCallId, toolCall] of restoredSession.toolCalls) {
          await this.connection.sessionUpdate({
            sessionId: params.sessionId,
            update: {
              sessionUpdate: 'tool_call_update',
              ...toolCall,
            } as SessionUpdate,
          });
        }
        
        console.log(`Session restored: ${params.sessionId}`);
      } else {
        throw RequestError.invalidParams({ message: 'Session not found' });
      }
    }
  }

  async prompt(params: PromptRequest): Promise<PromptResponse> {
    const session = this.sessions.get(params.sessionId);
    
    if (!session) {
      throw RequestError.invalidParams({ message: 'Invalid session ID' });
    }

    // Reset cancel flag
    session.cancelRequested = false;

    // Add user message to history
    session.messages.push({
      role: 'user',
      content: params.prompt,
    });

    // Stream user message chunks back
    for (const content of params.prompt) {
      await this.connection.sessionUpdate({
        sessionId: params.sessionId,
        update: {
          sessionUpdate: 'user_message_chunk',
          content,
        } as SessionUpdate,
      });
    }

    // Create execution plan
    const plan = await this.createExecutionPlan(params.prompt, session);
    if (plan.length > 0) {
      session.plan = plan;
      await this.connection.sessionUpdate({
        sessionId: params.sessionId,
        update: {
          sessionUpdate: 'plan',
          entries: plan,
        } as SessionUpdate,
      });
    }

    // Process with LLM
    const response = await this.processWithLLM(params.prompt, session);

    // Check for cancellation
    if (session.cancelRequested) {
      return { stopReason: 'cancelled' as StopReason };
    }

    // Execute tool calls if any
    if (response.toolCalls && response.toolCalls.length > 0) {
      for (const toolCall of response.toolCalls) {
        if (session.cancelRequested) break;

        await this.executeToolCall(toolCall, session);
      }
    }

    // Stream assistant response
    for (const content of response.content) {
      await this.connection.sessionUpdate({
        sessionId: params.sessionId,
        update: {
          sessionUpdate: 'agent_message_chunk',
          content,
        } as SessionUpdate,
      });
    }

    // Add assistant message to history
    session.messages.push({
      role: 'assistant',
      content: response.content,
    });

    // Save session state
    await this.saveSession(session);

    return { 
      stopReason: session.cancelRequested ? 'cancelled' : 'end_turn' as StopReason,
    };
  }

  async cancel(params: CancelNotification): Promise<void> {
    const session = this.sessions.get(params.sessionId);
    
    if (session) {
      session.cancelRequested = true;
      console.log(`Cancellation requested for session: ${params.sessionId}`);
    }
  }

  private async createExecutionPlan(
    prompt: Content[],
    session: SessionState,
  ): Promise<PlanEntry[]> {
    // Analyze prompt to create execution plan
    const textContent = prompt
      .filter(c => c.type === 'text')
      .map(c => 'text' in c ? c.text : '')
      .join(' ');

    const plan: PlanEntry[] = [];

    // Analyze for common patterns
    if (textContent.match(/create|scaffold|new project/i)) {
      plan.push({
        content: 'Initialize TurboKit project structure',
        priority: 'high',
        status: 'pending',
      });
      plan.push({
        content: 'Configure Convex components',
        priority: 'high',
        status: 'pending',
      });
      plan.push({
        content: 'Set up deployment configuration',
        priority: 'medium',
        status: 'pending',
      });
    } else if (textContent.match(/add|install|component/i)) {
      plan.push({
        content: 'Add Convex component to project',
        priority: 'high',
        status: 'pending',
      });
      plan.push({
        content: 'Update configuration files',
        priority: 'medium',
        status: 'pending',
      });
    } else if (textContent.match(/deploy|production/i)) {
      plan.push({
        content: 'Deploy to Convex production',
        priority: 'high',
        status: 'pending',
      });
      plan.push({
        content: 'Deploy frontend to Vercel',
        priority: 'high',
        status: 'pending',
      });
      plan.push({
        content: 'Configure environment variables',
        priority: 'medium',
        status: 'pending',
      });
    }

    return plan;
  }

  private async processWithLLM(
    prompt: Content[],
    session: SessionState,
  ): Promise<{ content: Content[]; toolCalls?: any[] }> {
    const textContent = prompt
      .filter(c => c.type === 'text')
      .map(c => 'text' in c ? c.text : '')
      .join(' ');

    // Build context
    const context = this.buildContext(session);

    if (this.llmProvider === 'anthropic' && this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'system',
            content: context,
          },
          ...session.messages.slice(-10).map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
              .filter(c => c.type === 'text')
              .map(c => 'text' in c ? c.text : '')
              .join(' '),
          })),
        ],
        tools: Array.from(this.tools.values()).map(tool => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        })),
      });

      const content: Content[] = [];
      const toolCalls: any[] = [];

      if (response.content) {
        for (const block of response.content) {
          if (block.type === 'text') {
            content.push({ type: 'text', text: block.text });
          } else if (block.type === 'tool_use') {
            toolCalls.push({
              id: block.id,
              name: block.name,
              input: block.input,
            });
          }
        }
      }

      return { content, toolCalls };
    } else if (this.llmProvider === 'openai' && this.openai) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: context,
          },
          ...session.messages.slice(-10).map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
              .filter(c => c.type === 'text')
              .map(c => 'text' in c ? c.text : '')
              .join(' '),
          })),
        ],
        tools: Array.from(this.tools.values()).map(tool => ({
          type: 'function' as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
          },
        })),
      });

      const content: Content[] = [];
      const toolCalls: any[] = [];

      if (response.choices[0].message.content) {
        content.push({
          type: 'text',
          text: response.choices[0].message.content,
        });
      }

      if (response.choices[0].message.tool_calls) {
        for (const toolCall of response.choices[0].message.tool_calls) {
          toolCalls.push({
            id: toolCall.id,
            name: toolCall.function.name,
            input: JSON.parse(toolCall.function.arguments),
          });
        }
      }

      return { content, toolCalls };
    }

    // Fallback response without LLM
    return {
      content: [{
        type: 'text',
        text: 'I understand your request. Let me help you with TurboKit development.',
      }],
    };
  }

  private buildContext(session: SessionState): string {
    let context = `You are TurboKit Agent, an AI assistant specialized in building modern web applications with the TurboKit template.

TurboKit is a Convex-native turborepo template that uses:
- Convex as a complete backend solution (database, functions, workflows, file storage)
- Next.js 15 with React 19 for the frontend
- Tailwind CSS v4 for styling
- Clerk for authentication
- TypeScript for type safety
- Real-time subscriptions by default

Key principles:
- All server logic lives in packages/backend/convex
- Use Convex components for common functionality
- Real-time updates happen automatically
- Type-safe end-to-end with generated types

Current working directory: ${session.cwd}
`;

    if (this.haloSystem) {
      context += '\n\nHalo System available with commands, components, roles, and rules.';
    }

    if (session.mcpServers.length > 0) {
      context += '\n\nMCP Servers connected:';
      session.mcpServers.forEach(server => {
        context += `\n- ${server.name}`;
      });
    }

    return context;
  }

  private async executeToolCall(
    toolCall: any,
    session: SessionState,
  ): Promise<void> {
    const tool = this.tools.get(toolCall.name);
    
    if (!tool) {
      console.error(`Unknown tool: ${toolCall.name}`);
      return;
    }

    const toolCallId = `call_${uuidv4()}` as ToolCallId;

    // Notify tool call start
    await this.connection.sessionUpdate({
      sessionId: session.id,
      update: {
        sessionUpdate: 'tool_call',
        toolCallId,
        title: tool.description,
        kind: 'other',
        status: 'pending',
      } as SessionUpdate,
    });

    // Request permission if needed
    if (tool.requiresPermission) {
      const permissionResponse = await this.connection.requestPermission({
        sessionId: session.id,
        toolCall: {
          toolCallId,
          title: tool.description,
        } as ToolCallUpdate,
        options: [
          {
            optionId: 'allow-once',
            name: 'Allow once',
            kind: 'allow_once',
          },
          {
            optionId: 'reject-once',
            name: 'Reject',
            kind: 'reject_once',
          },
        ],
      } as RequestPermissionRequest);

      if ('outcome' in permissionResponse && 
          permissionResponse.outcome === 'rejected') {
        // Tool call rejected
        await this.connection.sessionUpdate({
          sessionId: session.id,
          update: {
            sessionUpdate: 'tool_call_update',
            toolCallId,
            status: 'failed',
          } as SessionUpdate,
        });
        return;
      }
    }

    // Update status to in_progress
    await this.connection.sessionUpdate({
      sessionId: session.id,
      update: {
        sessionUpdate: 'tool_call_update',
        toolCallId,
        status: 'in_progress',
      } as SessionUpdate,
    });

    try {
      // Execute tool
      const result = await tool.execute(toolCall.input, session);

      // Update with result
      await this.connection.sessionUpdate({
        sessionId: session.id,
        update: {
          sessionUpdate: 'tool_call_update',
          toolCallId,
          status: 'completed',
          content: [{
            type: 'content',
            content: {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          }],
        } as SessionUpdate,
      });

      // Store tool call
      session.toolCalls.set(toolCallId, {
        toolCallId,
        title: tool.description,
        status: 'completed',
      } as ToolCallUpdate);
    } catch (error: any) {
      // Update with error
      await this.connection.sessionUpdate({
        sessionId: session.id,
        update: {
          sessionUpdate: 'tool_call_update',
          toolCallId,
          status: 'failed',
          content: [{
            type: 'content',
            content: {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          }],
        } as SessionUpdate,
      });

      session.toolCalls.set(toolCallId, {
        toolCallId,
        title: tool.description,
        status: 'failed',
      } as ToolCallUpdate);
    }
  }

  private async saveSession(session: SessionState): Promise<void> {
    const sessionsDir = join(this.projectRoot, '.acp-sessions');
    if (!existsSync(sessionsDir)) {
      mkdirSync(sessionsDir, { recursive: true });
    }

    const sessionData = {
      ...session,
      toolCalls: Array.from(session.toolCalls.entries()),
    };

    writeFileSync(
      join(sessionsDir, `${session.id}.json`),
      JSON.stringify(sessionData, null, 2),
    );
  }
}

/**
 * Main entry point for the ACP server
 */
export function startACPServer() {
  console.log('Starting TurboKit ACP Server...');

  // Create connection with stdio
  const connection = new AgentSideConnection(
    (conn) => new TurboKitAgent(conn),
    process.stdout as any,
    process.stdin as any,
  );

  console.log('TurboKit ACP Server is running');
  console.log('📡 Listening for ACP protocol messages on stdio...');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down TurboKit ACP Server...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nShutting down TurboKit ACP Server...');
    process.exit(0);
  });
}

// Start server if run directly
if (require.main === module) {
  startACPServer();
}
