import { NextResponse } from 'next/server';

import { CronJob } from '@/constants/cron';
import { executeCronJob, handleCronError, validateCronSecret } from '@/lib/cron';

// This route is triggered by a cron job to update news articles
export async function GET(request: Request) {
  try {
    // Validate authorization token if provided
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    
    // Simple token validation (should be enhanced in production)
    if (process.env.CRON_SECRET && !validateCronSecret(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Run the update process
    await executeCronJob(CronJob.EXAMPLE);
    
    return NextResponse.json({ success: true, message: 'News update completed' });
  } catch (error) {
    const errorResponse = await handleCronError(error, 'update-news');
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Configure route to bypass CORS
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 