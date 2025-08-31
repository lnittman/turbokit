#!/usr/bin/env node
/**
 * TurboKit CLI Publishing Strategy
 * 
 * Distribution Methods:
 * 1. npm Registry (Primary)
 * 2. GitHub Releases (Secondary)
 * 3. Direct Git Installation (Development)
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface PublishOptions {
  version?: string;
  tag?: 'latest' | 'beta' | 'alpha';
  dryRun?: boolean;
}

/**
 * Distribution Strategy:
 * 
 * 1. NPM PACKAGE (@turbokit/cli)
 *    - Best for: Wide distribution, version management
 *    - Install: npm install -g @turbokit/cli
 *    - Execute: turbokit init
 * 
 * 2. NPX EXECUTION (no install needed)
 *    - Best for: One-time use, trying out
 *    - Execute: npx @turbokit/cli init
 * 
 * 3. GITHUB RELEASES
 *    - Best for: Specific versions, changelog
 *    - Install: npm install -g github:turbokit/cli#v1.0.0
 * 
 * 4. TEMPLATE BUNDLED
 *    - Best for: Template users
 *    - Execute: npx turbokit init (from template)
 */

export async function publish(options: PublishOptions = {}) {
  const { version, tag = 'latest', dryRun = false } = options;
  
  console.log('TurboKit CLI Publishing');
  console.log('========================');
  
  // Step 1: Build the CLI
  console.log('Building CLI...');
  execSync('pnpm build:cli', { stdio: 'inherit' });
  
  // Step 2: Prepare package.json for publishing
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
  );
  
  // Create a publish-specific package.json
  const publishPackageJson = {
    name: '@turbokit/cli',
    version: version || packageJson.version,
    description: 'ACP-native development platform for Convex applications',
    keywords: ['convex', 'cli', 'acp', 'turbokit', 'real-time'],
    homepage: 'https://turbokit.dev',
    repository: {
      type: 'git',
      url: 'https://github.com/turbokit/cli.git'
    },
    bugs: {
      url: 'https://github.com/turbokit/cli/issues'
    },
    license: 'MIT',
    author: 'TurboKit Team',
    bin: {
      turbokit: './dist/scripts/turbokit-cli.js'
    },
    files: [
      'dist',
      'scripts/prompts',
      '.turbokit',
      'README.md',
      'LICENSE'
    ],
    engines: {
      node: '>=18.0.0'
    },
    dependencies: {
      '@anthropic-ai/sdk': packageJson.dependencies['@anthropic-ai/sdk'],
      '@clack/prompts': packageJson.dependencies['@clack/prompts'],
      '@zed-industries/agent-client-protocol': packageJson.dependencies['@zed-industries/agent-client-protocol'],
      'commander': packageJson.dependencies.commander,
      'fast-xml-parser': packageJson.dependencies['fast-xml-parser'],
      'openai': packageJson.dependencies.openai,
      'picocolors': packageJson.dependencies.picocolors
    },
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org/'
    }
  };
  
  // Write the publish package.json
  const publishPackagePath = join(process.cwd(), 'dist', 'package.json');
  writeFileSync(publishPackagePath, JSON.stringify(publishPackageJson, null, 2));
  
  // Step 3: Publish to npm
  if (!dryRun) {
    console.log(`Publishing to npm with tag: ${tag}`);
    execSync(`npm publish dist --tag ${tag}`, { stdio: 'inherit' });
    console.log('Published to npm!');
  } else {
    console.log('Dry run - would publish:');
    console.log(JSON.stringify(publishPackageJson, null, 2));
  }
  
  // Step 4: Create GitHub release (optional)
  if (!dryRun && version) {
    console.log('Creating GitHub release...');
    const releaseNotes = `
# TurboKit CLI v${version}

## Installation

\`\`\`bash
# Global install
npm install -g @turbokit/cli

# Or use npx
npx @turbokit/cli init
\`\`\`

## What's New
- ACP server for AI assistance
- Adaptive onboarding
- Status tracking system
- Multi-agent support
`;
    
    // Create git tag
    execSync(`git tag -a v${version} -m "Release v${version}"`, { stdio: 'inherit' });
    execSync(`git push origin v${version}`, { stdio: 'inherit' });
    
    console.log('GitHub release created!');
  }
  
  console.log('\nDistribution Summary:');
  console.log('- npm: @turbokit/cli');
  console.log('- npx: npx @turbokit/cli init');
  console.log('- GitHub: github:turbokit/cli');
  console.log('- Template: Built-in with template');
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const version = args.find(arg => arg.startsWith('--version='))?.split('=')[1];
  const tag = args.find(arg => arg.startsWith('--tag='))?.split('=')[1] as any;
  const dryRun = args.includes('--dry-run');
  
  publish({ version, tag, dryRun }).catch(console.error);
}
