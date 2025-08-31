/**
 * TurboKit CLI - ACP-native scaffolding tool
 * Can be run directly with npx or as an ACP server
 */

import { program } from 'commander';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { AdaptiveOnboarding } from './onboarding.js';
import { initialize } from './initialize.js';
import { connect } from './connect.js';
import { deploy } from './deploy.js';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if running in ACP mode
const isACPMode = process.argv.includes('--acp');

/**
 * Run TurboKit as an ACP server
 */
function runAsACPServer() {
  // Spawn the dedicated ACP server script
  const acpServerPath = join(__dirname, 'turbokit-acp-server.js');
  const acpProcess = spawn('node', [acpServerPath], {
    stdio: 'inherit',
    env: process.env,
  });
  
  acpProcess.on('error', (err) => {
    console.error('Failed to start ACP server:', err);
    process.exit(1);
  });
  
  acpProcess.on('exit', (code) => {
    process.exit(code || 0);
  });
}

/**
 * Run TurboKit as a traditional CLI
 */
function runAsCLI() {
  program
    .name('turbokit')
    .description('ACP-native development platform for Convex applications')
    .version('1.0.0');

  // Init command - can also be invoked via ACP
  program
    .command('init [name]')
    .description('Initialize a new TurboKit project with adaptive onboarding')
    .option('--skip-install', 'Skip dependency installation')
    .option('--no-git', 'Disable git initialization')
    .option('--from <path>', 'Bootstrap from existing components directory')
    .action(async (name, options) => {
      // Special handling for npx turbokit init
      if (!name) {
        // Interactive mode
        const onboarding = new AdaptiveOnboarding(process.cwd());
        const projectSpec = await onboarding.run();
        await initialize({
          name: projectSpec.name,
          ...options,
          projectSpec,
        });
      } else {
        await initialize({ name, ...options });
      }
    });

  // Connect command
  program
    .command('connect')
    .description('Connect your preferred AI agent to the project')
    .option('--agent <agent>', 'Agent to connect (claude, cursor, copilot, etc.)')
    .option('--port <port>', 'ACP server port (default: 3456)')
    .action(connect);

  // Deploy command
  program
    .command('deploy')
    .description('Deploy to Convex and Vercel')
    .option('--prod', 'Deploy to production')
    .option('--preview', 'Create preview deployment')
    .action(deploy);

  // ACP server command (for manual testing)
  program
    .command('acp')
    .description('Run TurboKit as an ACP server for AI agents')
    .action(() => {
      runAsACPServer();
    });

  program.parse(process.argv);
  
  // If no command specified, show help
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

// Main entry point - check for ACP mode immediately
if (isACPMode) {
  runAsACPServer();
} else {
  runAsCLI();
}