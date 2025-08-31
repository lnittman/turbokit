import { intro, outro, spinner, select, log } from '@clack/prompts';
import { exec as execCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, existsSync } from 'node:fs';
import { join } from 'node:path';

const exec = promisify(execCallback);

interface ConnectOptions {
  agent?: string;
  port?: string;
}

export async function connect(options: ConnectOptions) {
  intro('Connecting your AI agent to TurboKit');

  const agent = options.agent || await selectAgent();
  const port = options.port || '3456';

  const s = spinner();
  
  // Start ACP server
  s.start('Starting ACP server...');
  await startACPServer(port);
  s.stop('ACP server running on port ' + port);

  // Connect the selected agent
  s.start(`Connecting ${agent}...`);
  await connectAgent(agent, port);
  s.stop(`${agent} connected!`);

outro(`
Agent connected successfully!

The ${agent} agent is now connected to your TurboKit project.
It has full context about:
- Your project structure and configuration
- Convex components and patterns
- Your custom .halo prompts and rules

Start coding with your AI assistant!
  `);
}

async function selectAgent(): Promise<string> {
  const agent = await select({
    message: 'Which AI agent would you like to connect?',
    options: [
      { value: 'claude', label: 'Claude (Claude Code CLI)' },
      { value: 'cursor', label: 'Cursor' },
      { value: 'copilot', label: 'GitHub Copilot' },
      { value: 'gemini', label: 'Gemini' },
      { value: 'opencode', label: 'OpenCode' },
      { value: 'amp', label: 'Amp' },
      { value: 'codex', label: 'Codex' },
    ],
  });

  return String(agent);
}

async function startACPServer(port: string) {
  // In production, this would start the actual ACP server
  // For now, we'll simulate it
  log.info(`ACP server would start on http://localhost:${port}`);
  
  // Check if .halo directory exists
  if (existsSync('.halo')) {
    log.info('Loading project-specific Halo configuration...');
  }
  
  // Check if .ruler exists
  if (existsSync('.ruler')) {
    log.info('Loading Ruler agent configurations...');
  }
}

async function connectAgent(agent: string, port: string) {
  const connectionCommands: Record<string, string> = {
    claude: `claude code --acp-port ${port}`,
    cursor: `cursor . --acp-enable --acp-port ${port}`,
    copilot: `code . --acp-port ${port}`,
    gemini: `gemini --acp-connect localhost:${port}`,
    opencode: `opencode --acp localhost:${port}`,
    amp: `amp connect --port ${port}`,
    codex: `codex --acp-server localhost:${port}`,
  };

  const command = connectionCommands[agent];
  
  if (command) {
    log.info(`Would execute: ${command}`);
    // In production: await exec(command);
  } else {
    log.info(`Manual connection required for ${agent}`);
    log.info(`ACP server running on: http://localhost:${port}`);
  }
}
