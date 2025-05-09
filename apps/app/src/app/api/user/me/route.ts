import { NextRequest } from 'next/server';

import { successResponse, withErrorHandling } from '@repo/api/lib/response';
import { User } from '@repo/database';

import { withAuthenticatedUser } from '@/lib/auth';

/**
 * GET - Get the current user's profile
 * @param request - The NextRequest object
 * @param context - Context containing the authenticated user object
 * @param context.user - The authenticated database User object
 * @returns A success response with the current user's profile
 */
export const GET = withErrorHandling(
  withAuthenticatedUser(async function getCurrentUser(
    request: NextRequest,
    context: { user: User }
  ) {
    const { user } = context;

    return successResponse(user);
  })
);