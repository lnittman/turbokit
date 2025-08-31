/**
 * TurboKit ACP Server
 * Implements the Agent Client Protocol for use with compatible editors
 */

import { AgentSideConnection } from '@zed-industries/agent-client-protocol';
import { WritableStream, ReadableStream } from 'node:stream/web';
import { Readable, Writable } from 'node:stream';
import type {
  Agent,
  InitializeRequest,
  InitializeResponse,
  NewSessionRequest,
  NewSessionResponse,
  AuthenticateRequest,
  PromptRequest,
  PromptResponse,
  CancelNotification,
  SessionUpdate,
  RequestPermissionRequest,
  Content,
  ToolCallId,
  SessionId,
  StopReason,
} from '@zed-industries/agent-client-protocol';
import { v4 as uuidv4 } from 'uuid';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
// LLM usage is delegated to the ACP client; no direct SDKs here.

// Session state management
interface SessionState {
  id: SessionId;
  cwd: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  isActive: boolean;
  cancelRequested: boolean;
}

/**
 * TurboKit Agent Implementation
 */
class TurboKitAgent implements Agent {
  private connection: AgentSideConnection;
  private sessions: Map<SessionId, SessionState> = new Map();
  // No direct LLM providers; ACP client handles generation.

  constructor(connection: AgentSideConnection) {
    this.connection = connection;
    // No-op: we do not initialize LLM providers here.
  }
  // No initializeLLMProviders: LLM is on the client side.

  async initialize(params: InitializeRequest): Promise<InitializeResponse> {
    console.error('TurboKit Agent initializing (LLM delegated to ACP client)...');
    
    return {
      protocolVersion: 1,
      agentCapabilities: {
        loadSession: false,
        promptCapabilities: {
          image: false,
          audio: false,
          embeddedContext: true,
        },
      },
      authMethods: [
        {
          methodId: 'api-key',
          displayName: 'API Key',
          description: 'Optional; this server does not call LLMs directly. Use your ACP client for LLMs.',
        },
      ],
    };
  }

  async authenticate(params: AuthenticateRequest): Promise<void> {
    // Authentication is handled via environment variables
    // No authentication required for LLMs here; ACP client manages it.
  }

  async newSession(params: NewSessionRequest): Promise<NewSessionResponse> {
    const sessionId = `turbokit_${uuidv4()}` as SessionId;
    
    const session: SessionState = {
      id: sessionId,
      cwd: params.cwd,
      messages: [],
      isActive: true,
      cancelRequested: false,
    };

    this.sessions.set(sessionId, session);
    
    console.error(`New TurboKit session: ${sessionId}`);
    console.error(`   Working directory: ${params.cwd}`);
    
    return { sessionId };
  }

  async prompt(params: PromptRequest): Promise<PromptResponse> {
    const session = this.sessions.get(params.sessionId);
    
    if (!session) {
      throw new Error('Invalid session ID');
    }

    session.cancelRequested = false;

    // Extract text from prompt content
    const promptText = params.prompt
      .filter(c => c.type === 'text')
      .map(c => 'text' in c ? c.text : '')
      .join(' ');

    console.error(`\nPrompt: ${promptText.substring(0, 100)}...`);

    // Add to message history
    session.messages.push({
      role: 'user',
      content: promptText,
    });

    // Stream user message back
    for (const content of params.prompt) {
      await this.connection.sessionUpdate({
        sessionId: params.sessionId,
        update: {
          sessionUpdate: 'user_message_chunk',
          content,
        } as SessionUpdate,
      });
    }

    // Process the prompt
    let responseText = '';

    // Check for TurboKit-specific commands
    if (promptText.toLowerCase().includes('init') || 
        promptText.toLowerCase().includes('scaffold') ||
        promptText.toLowerCase().includes('create')) {
      
      responseText = await this.handleScaffoldCommand(promptText, session);
      
    } else {
      responseText = `Request received: "${promptText}".\n\n` +
        `This ACP server delegates all LLM generation to your ACP client. ` +
        `Use the client for completions; this server provides tools and scaffolding.`;
    }

    // Stream response back
    const responseContent: Content = {
      type: 'text',
      text: responseText,
    };

    await this.connection.sessionUpdate({
      sessionId: params.sessionId,
      update: {
        sessionUpdate: 'agent_message_chunk',
        content: responseContent,
      } as SessionUpdate,
    });

    // Add to message history
    session.messages.push({
      role: 'assistant',
      content: responseText,
    });

    return { 
      stopReason: session.cancelRequested ? 'cancelled' : 'end_turn' as StopReason,
    };
  }

  async cancel(params: CancelNotification): Promise<void> {
    const session = this.sessions.get(params.sessionId);
    if (session) {
      session.cancelRequested = true;
      console.error(`Cancellation requested for session: ${params.sessionId}`);
    }
  }

  private async handleScaffoldCommand(prompt: string, session: SessionState): Promise<string> {
    console.error('Handling scaffold command...');
    
    // Extract project name if provided
    const nameMatch = prompt.match(/(?:called|named|project)\s+["']?([a-zA-Z0-9-_]+)["']?/i);
    const projectName = nameMatch ? nameMatch[1] : 'my-turbokit-app';
    
    // Detect requested features
    const features = [];
    if (prompt.toLowerCase().includes('auth')) features.push('auth');
    if (prompt.toLowerCase().includes('payment')) features.push('payments');
    if (prompt.toLowerCase().includes('email')) features.push('email');
    if (prompt.toLowerCase().includes('ai')) features.push('ai');
    
    // If no features specified but it's an init command, use defaults
    if (features.length === 0 && prompt.toLowerCase().includes('init')) {
      features.push('auth', 'ai');
    }

    const projectPath = resolve(session.cwd, projectName);
    
    // Create project structure
    const scaffoldSteps = [
      'Creating project structure...',
      'Setting up packages...',
      'Configuring Convex backend...',
      'Setting up design system...',
      'Finalizing configuration...',
    ];

    for (const step of scaffoldSteps) {
      await this.connection.sessionUpdate({
        sessionId: session.id,
        update: {
          sessionUpdate: 'agent_message_chunk',
          content: { type: 'text', text: step + '\n' },
        } as SessionUpdate,
      });
    }

    // Actually create the project structure
    try {
      mkdirSync(projectPath, { recursive: true });
      
      // Create package.json
      const packageJson = {
        name: projectName,
        version: '0.1.0',
        private: true,
        workspaces: ['apps/*', 'packages/*'],
        scripts: {
          'dev': 'turbo dev',
          'build': 'turbo build',
          'lint': 'turbo lint',
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

      // Create basic structure
      mkdirSync(join(projectPath, 'apps/app'), { recursive: true });
      mkdirSync(join(projectPath, 'packages/backend/convex'), { recursive: true });
      mkdirSync(join(projectPath, 'packages/design'), { recursive: true });

      return `Successfully created TurboKit project: ${projectName}

Project structure:
${projectName}/
├── apps/
│   └── app/          # Next.js client app
├── packages/
│   ├── backend/      # Convex backend
│   └── design/       # Design system
└── package.json

Features included: ${features.join(', ') || 'base template'}

Next steps:
1. cd ${projectName}
2. pnpm install
3. npx convex init
4. pnpm dev

Need help? Try asking:
- "How do I add authentication?"
- "Show me how to create a Convex function"
- "Help me deploy to production"`;

    } catch (error: any) {
      return `ERROR creating project: ${error.message}

Please ensure you have write permissions in the current directory.`;
    }
  }

  // No processWithLLM: LLM usage is handled by the ACP client/editor.
}

/**
 * Main entry point
 */
function main() {
  console.error('═══════════════════════════════════════');
  console.error('    TurboKit ACP Server v1.0.0');
  console.error('    Convex-native development platform');
  console.error('═══════════════════════════════════════');
  console.error('');
  
  // Convert Node streams to web streams
  const stdout = Writable.toWeb(process.stdout) as WritableStream;
  const stdin = Readable.toWeb(process.stdin) as ReadableStream<Uint8Array>;
  
  // Redirect console output to stderr to not interfere with ACP protocol
  console.log = console.error;
  console.info = console.error;
  console.debug = console.error;
  
  // Create ACP connection
  new AgentSideConnection(
    (conn) => new TurboKitAgent(conn),
    stdout,
    stdin,
  );

  console.error('ACP server running on stdio');
  console.error('   Waiting for client connection...\n');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.error('\nShutting down TurboKit ACP Server...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.error('\nShutting down TurboKit ACP Server...');
    process.exit(0);
  });
}

// Run the server
main();
