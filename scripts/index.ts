#!/usr/bin/env node

import { program } from 'commander';
import { initialize } from './initialize.js';
import { connect } from './connect.js';
import { deploy } from './deploy.js';

program
  .name('turbokit')
  .description('A modern, real-time application template powered by Convex')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new TurboKit project with adaptive onboarding')
  .option('--name <name>', 'Name of the project')
  .option('--skip-install', 'Skip dependency installation')
  .option('--no-git', 'Disable git initialization')
  .action(initialize);

program
  .command('connect')
  .description('Connect your preferred AI agent to the project')
  .option('--agent <agent>', 'Agent to connect (claude, cursor, copilot, etc.)')
  .option('--port <port>', 'Server port (default: 3456)')
  .action(connect);

program
  .command('deploy')
  .description('Deploy to Convex and Vercel')
  .option('--prod', 'Deploy to production')
  .option('--preview', 'Create preview deployment')
  .action(deploy);

program.parse(process.argv);