import { intro, outro, spinner, confirm, log } from '@clack/prompts';
import { exec as execCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, readFileSync } from 'node:fs';

const exec = promisify(execCallback);

interface DeployOptions {
  prod?: boolean;
  preview?: boolean;
}

export async function deploy(options: DeployOptions) {
  intro('Deploying your TurboKit project');

  const s = spinner();
  
  // Check prerequisites
  s.start('Checking deployment prerequisites...');
  const ready = await checkPrerequisites();
  s.stop('Prerequisites checked');

  if (!ready) {
    log.error('Missing required configuration. Please ensure you have:');
    log.error('- Convex project configured (npx convex dev)');
    log.error('- Vercel project linked (vercel link)');
    log.error('- Environment variables set');
    process.exit(1);
  }

  const isProd = options.prod || await confirm({
    message: 'Deploy to production?',
    initialValue: false,
  });

  // Deploy Convex backend
  s.start('Deploying Convex backend...');
  await deployConvex(isProd);
  s.stop('Convex deployed successfully!');

  // Deploy Vercel frontend
  s.start('Deploying to Vercel...');
  const deploymentUrl = await deployVercel(isProd);
  s.stop('Vercel deployed successfully!');

  outro(`
Deployment complete!

Your TurboKit project is now live:
${deploymentUrl}

Backend: Convex ${isProd ? 'production' : 'preview'}
Frontend: Vercel ${isProd ? 'production' : 'preview'}

Next steps:
- Monitor your deployment at https://dashboard.convex.dev
- View analytics at https://vercel.com/dashboard
- Set up custom domain if needed
  `);
}

async function checkPrerequisites(): Promise<boolean> {
  // Check for Convex configuration
  if (!existsSync('convex.json')) {
    log.warn('No convex.json found. Run "npx convex dev" first.');
    return false;
  }

  // Check for Vercel configuration
  if (!existsSync('.vercel')) {
    log.warn('No .vercel directory found. Run "vercel link" first.');
    return false;
  }

  // Check for environment variables
  if (!existsSync('.env.local')) {
    log.warn('No .env.local found. Copy .env.example to .env.local and configure.');
    return false;
  }

  return true;
}

async function deployConvex(isProd: boolean): Promise<void> {
  try {
    const command = isProd 
      ? 'npx convex deploy --prod'
      : 'npx convex deploy';
    
    const { stdout } = await exec(command);
    log.info('Convex deployment output:');
    log.info(stdout);
  } catch (error) {
    log.error('Convex deployment failed:');
    log.error(String(error));
    throw error;
  }
}

async function deployVercel(isProd: boolean): Promise<string> {
  try {
    const command = isProd
      ? 'vercel --prod'
      : 'vercel';
    
    const { stdout } = await exec(command);
    
    // Extract deployment URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+/);
    const deploymentUrl = urlMatch ? urlMatch[0] : 'Check Vercel dashboard';
    
    log.info('Vercel deployment output:');
    log.info(stdout);
    
    return deploymentUrl;
  } catch (error) {
    log.error('Vercel deployment failed:');
    log.error(String(error));
    throw error;
  }
}
