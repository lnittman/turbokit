import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import {
  cancel,
  intro,
  isCancel,
  log,
  outro,
  spinner,
  confirm,
  note
} from '@clack/prompts';
import { exec as execCallback } from 'node:child_process';
import { promisify } from 'node:util';
import * as colors from 'picocolors';
import { AdaptiveOnboarding } from './onboarding.js';

const exec = promisify(execCallback);

interface InitOptions {
  name?: string;
  skipInstall?: boolean;
  git?: boolean;
}

interface TurboKitConfig {
  version: string;
  projectName: string;
  created: string;
  specification?: any;
  acpClient?: 'gemini' | 'claude' | 'cursor' | 'none';
}

/**
 * Update the project status tracking
 * This maintains a running log of project state in .turbokit/status/
 */
function updateStatus(
  turbokitDir: string, 
  phase: string, 
  task: string, 
  status: string, 
  context: Record<string, any> = {}
) {
  const timestamp = new Date().toISOString();
  const currentPath = join(turbokitDir, 'status', 'CURRENT.md');
  const historyPath = join(turbokitDir, 'status', 'HISTORY.md');
  
  // Archive current status to history if it exists
  if (existsSync(currentPath)) {
    const current = readFileSync(currentPath, 'utf-8');
    appendFileSync(historyPath, `\n\n${current}\n${'='.repeat(60)}`);
  }
  
  // Generate new status
  const statusContent = `# TurboKit Project Status

**Timestamp**: ${timestamp}  
**Phase**: ${phase}  
**Task**: ${task}  
**Status**: ${status}

## Context
${Object.entries(context).map(([key, value]) => {
  if (typeof value === 'object' && value !== null) {
    return `### ${key}\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
  }
  return `- **${key}**: ${value}`;
}).join('\n')}

## Next Steps
${context.nextSteps || 'Continue with current workflow'}

---`;
  
  writeFileSync(currentPath, statusContent);
}

/**
 * Initialize a TurboKit project in the current directory
 * Expects .turbokit/ to already exist (from template)
 */
export async function initialize(options: InitOptions) {
  try {
    console.clear();
    intro(colors.inverse(' TurboKit Initialization '));
    
    const cwd = process.cwd();
    const turbokitDir = join(cwd, '.turbokit');
    
    // Check if .turbokit exists
    if (!existsSync(turbokitDir)) {
      log.error('.turbokit directory not found. This doesn\'t appear to be a TurboKit project.');
      log.info('To create a new TurboKit project, use: npx create-turbokit@latest');
      process.exit(1);
    }
    
    // Check if already initialized
    const configPath = join(turbokitDir, 'config', 'project.json');
    if (existsSync(configPath) && !options.name) {
      const reinit = await confirm({
        message: 'Project already initialized. Reinitialize?',
        initialValue: false,
      });
      
      if (isCancel(reinit) || !reinit) {
        cancel('Initialization cancelled.');
        process.exit(0);
      }
    }
    
    // Update status: Starting
    updateStatus(turbokitDir, 'Initialization', 'Starting onboarding', 'In Progress', {
      workingDirectory: cwd,
      timestamp: new Date().toISOString(),
      turboKitVersion: '1.0.0',
    });
    
    // Run adaptive onboarding
    console.log('');
    note(
      'I\'ll guide you through setting up your TurboKit project.\n\n' +
      'TurboKit creates:\n' +
      '• Convex-native backend with real-time subscriptions\n' +
      '• Next.js 15 + React 19 frontend\n' +
      '• Type-safe end-to-end architecture\n' +
      '• AI-agent friendly documentation',
      'Welcome to TurboKit'
    );
    
    const onboarding = new AdaptiveOnboarding(cwd);
    const projectSpec = await onboarding.run();
    
    const s = spinner();
    s.start('Saving project configuration...');
    
    // Save configuration
    const config: TurboKitConfig = {
      version: '1.0.0',
      projectName: projectSpec.name,
      created: new Date().toISOString(),
      specification: projectSpec,
    };
    
    await writeFile(
      join(turbokitDir, 'config', 'project.json'),
      JSON.stringify(config, null, 2)
    );
    
    // Update status with specification
    updateStatus(turbokitDir, 'Configuration', 'Project specification saved', 'Complete', {
      projectName: projectSpec.name,
      domain: projectSpec.domain,
      features: projectSpec.features.map((f: any) => f.name),
      convexComponents: projectSpec.convexComponents,
      agentPreference: projectSpec.agentConfiguration.primaryAgent,
      nextSteps: 'Configure ACP client for AI assistance',
    });
    
    s.stop('Configuration saved!');
    
    // Check for ACP clients (currently only Gemini)
    s.start('Checking for AI assistants...');
    
    let geminiAvailable = false;
    try {
      await exec('which gemini');
      geminiAvailable = true;
    } catch {}
    
    s.stop('AI assistant check complete');
    
    // Configure ACP if available
    if (geminiAvailable) {
      const useGemini = await confirm({
        message: 'Gemini CLI detected. Configure it for AI assistance?',
        initialValue: true,
      });
      
      if (!isCancel(useGemini) && useGemini) {
        const acpConfig = {
          client: 'gemini',
          serverCommand: 'turbokit acp',
          serverPort: 3456,
          instructions: [
            '1. Terminal 1: turbokit acp',
            '2. Terminal 2: gemini --experimental-acp',
            '3. Gemini will connect to TurboKit for Convex expertise',
          ],
          contextFiles: [
            '.turbokit/config/project.json',
            '.turbokit/status/CURRENT.md',
            '.turbokit/context/',
            '.turbokit/docs/',
          ],
        };
        
        await writeFile(
          join(turbokitDir, 'config', 'acp.json'),
          JSON.stringify(acpConfig, null, 2)
        );
        
        config.acpClient = 'gemini';
        
        // Update config with ACP client
        await writeFile(
          join(turbokitDir, 'config', 'project.json'),
          JSON.stringify(config, null, 2)
        );
        
        updateStatus(turbokitDir, 'ACP Setup', 'Gemini CLI configured', 'Ready', {
          acpClient: 'Gemini CLI',
          serverCommand: 'turbokit acp',
          serverPort: 3456,
          connectionStatus: 'Not connected',
          nextSteps: 'Start ACP server with: turbokit acp',
        });
      }
    } else {
      console.log('');
      note(
        'For AI assistance, install Gemini CLI:\n\n' +
        colors.cyan('npm install -g @google/gemini-cli@latest\n') +
        '\nThen run ' + colors.cyan('turbokit init') + ' again to configure.\n\n' +
        'Future support planned for:\n' +
        '• Claude (via ACP)\n' +
        '• Cursor Agent\n' +
        '• Other ACP-compatible clients',
        'AI Integration'
      );
    }
    
    // Final summary
    console.log('');
    note(
      `${colors.bold('Project:')} ${projectSpec.name}\n` +
      `${colors.bold('Type:')} ${projectSpec.domain}\n` +
      `${colors.bold('Features:')} ${projectSpec.features.map((f: any) => f.name).join(', ')}\n` +
      `${colors.bold('Convex Components:')} ${projectSpec.convexComponents.join(', ')}\n` +
      `${colors.bold('Preferred Agent:')} ${projectSpec.agentConfiguration.primaryAgent}`,
      'Configuration Summary'
    );
    
    // Update final status
    updateStatus(turbokitDir, 'Initialized', 'Ready for development', 'Complete', {
      projectName: projectSpec.name,
      initialized: new Date().toISOString(),
      acpClient: config.acpClient || 'none',
      nextSteps: config.acpClient === 'gemini' 
        ? 'Start ACP server: turbokit acp' 
        : 'Install dependencies: pnpm install',
    });
    
    outro(colors.green('✓ TurboKit initialized successfully!'));
    
    console.log('');
    console.log(colors.bold('Next steps:'));
    console.log('');
    
    if (config.acpClient === 'gemini') {
      console.log('  1. Start the TurboKit ACP server:');
      console.log(colors.cyan('     turbokit acp'));
      console.log('');
      console.log('  2. In another terminal, connect Gemini:');
      console.log(colors.cyan('     gemini --experimental-acp'));
      console.log('');
      console.log('  3. Gemini now has full context about your project!');
      console.log('     Ask it to help you build features.');
    } else {
      console.log('  1. Install dependencies:');
      console.log(colors.cyan('     pnpm install'));
      console.log('');
      console.log('  2. Initialize Convex:');
      console.log(colors.cyan('     npx convex init'));
      console.log('');
      console.log('  3. Start development:');
      console.log(colors.cyan('     pnpm dev'));
    }
    
    console.log('');
    console.log(colors.dim('Configuration saved to .turbokit/'));
    console.log(colors.dim('Status tracking in .turbokit/status/CURRENT.md'));
    
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Failed to initialize: ${message}`);
    process.exit(1);
  }
}
