import { database } from '@repo/database';

import { CronJob } from '@/constants/cron';

/**
 * Execute a cron job by name
 */
export async function executeCronJob(jobName: CronJob): Promise<void> {
  console.log(`Executing cron job: ${jobName}`);
  
  try {
    switch (jobName) {
      // Add cron jobs here
      case CronJob.EXAMPLE:
        // Do something
        break;

      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
    
    console.log(`Completed cron job: ${jobName}`);
  } finally {
    await database.$disconnect();
  }
}

/**
 * Handle errors in cron jobs
 */
export async function handleCronError(error: unknown, jobName: string): Promise<{ error: string; details?: unknown }> {
  console.error(`Error in cron job ${jobName}:`, error);
  
  // Format the error response
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorResponse = {
    error: `Failed to execute ${jobName}: ${errorMessage}`,
    details: error instanceof Error ? { 
      name: error.name,
      stack: error.stack
    } : undefined
  };
  
  // Ensure database connection is closed
  try {
    await database.$disconnect();
  } catch (e) {
    console.error('Error disconnecting from database:', e);
  }
  
  return errorResponse;
} 

/**
 * Validate a cron job secret token
 */
export function validateCronSecret(token?: string): boolean {
  if (!process.env.CRON_SECRET) {
    // If no secret is configured, allow all requests
    return true;
  }
  
  return token === process.env.CRON_SECRET;
}
