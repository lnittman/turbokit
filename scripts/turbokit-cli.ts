/**
 * TurboKit CLI
 * Purpose: fast, deterministic scaffolding (no AI usage).
 */

import { program } from 'commander';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { AdaptiveOnboarding } from './onboarding.js';
import { initialize } from './initialize.js';
import { connect } from './connect.js';
import { deploy } from './deploy.js';
import { existsSync } from 'fs';
import { promisify } from 'util';
import { exec as execCb } from 'child_process';

const exec = promisify(execCb);

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run TurboKit as a traditional CLI
 */
function runAsCLI() {
  program
    .name('turbokit')
    .description('TurboKit scaffolding and project utilities (no AI usage)')
    .version('1.0.0');

  // Create command - scaffold new project from template
  program
    .command('create <dir>')
    .description('Create a new TurboKit project in <dir> by copying the template')
    .option('--template <repo>', 'Git repo (https:// or owner/name) to clone', 'turbokit/template')
    .option('--skip-install', 'Skip dependency installation')
    .option('--no-git', 'Do not initialize a new git repo after scaffold')
    .action(async (dir: string, opts: { template: string; skipInstall?: boolean; git?: boolean }) => {
      const targetDir = join(process.cwd(), dir);
      if (existsSync(targetDir)) {
        console.error(`Error: target directory already exists: ${dir}`);
        process.exit(1);
      }

      // Resolve template URL
      const repo = opts.template.includes('://') ? opts.template : `https://github.com/${opts.template}`;
      const useGit = true; // Prefer git clone when available

      try {
        console.log(`> Cloning template from ${repo} ...`);
        await exec(`git clone --depth=1 ${repo} ${JSON.stringify(dir)}`);
      } catch (e) {
        console.warn('git clone failed, attempting degit...');
        await exec(`npx -y degit ${opts.template} ${JSON.stringify(dir)}`);
      }

      try {
        // Remove original git history if present
        await exec(`rm -rf ${JSON.stringify(join(dir, '.git'))}`);
      } catch {}

      // Initialize git unless --no-git
      if (opts.git !== false) {
        try {
          await exec(`cd ${JSON.stringify(dir)} && git init && git add -A && git commit -m "chore: scaffold with turbokit"`);
        } catch {}
      }

      if (!opts.skipInstall) {
        console.log('> Installing dependencies (pnpm)...');
        try {
          await exec(`cd ${JSON.stringify(dir)} && pnpm install`);
        } catch {
          console.warn('pnpm install failed, you can run it manually.');
        }
      }

      console.log('\n✓ TurboKit project created.');
      console.log(`\nNext steps:\n  cd ${dir}\n  pnpm install   # if you skipped\n  npx convex init\n  pnpm dev\n`);
    });

  // Init command - can also be invoked via ACP
  program
    .command('init [name]')
    .description('[Deprecated] Initialize in an existing TurboKit template directory')
    .option('--skip-install', 'Skip dependency installation')
    .option('--no-git', 'Disable git initialization')
    .option('--from <path>', 'Bootstrap from existing components directory')
    .action(async (name, options) => {
      console.log('Note: turbokit init is deprecated. Use `turbokit create <dir>` to scaffold a new project.');
      await initialize({ name, ...options });
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

  program.parse(process.argv);
  
  // If no command specified, show help
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

// Main entry point
runAsCLI();
