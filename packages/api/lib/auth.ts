import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@repo/auth/server';
import { User } from '@repo/database';

import { ApiError } from './error';
import { ErrorMessage, ErrorType } from '../constants';
import { userService } from '../services/user';

/**
 * Define the type for your authenticated route handler
 */
type AuthenticatedRouteHandler<TParams = any> = (
  request: NextRequest,
  // Make context generic to accept specific params types
  context: { params: TParams; user: User } 
) => Promise<NextResponse | Response>; // Allow streaming Response

/**
 * Get or create a user record in the database
 * @returns User record
 */
export async function getOrCreateUserRecord() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw ApiError.unauthenticated(ErrorMessage.NOT_AUTHENTICATED);
  }

  return userService.getOrCreateUser(clerkId);
}

/**
 * Get authenticated user ID from Clerk and database
 * @returns Database user ID
 */
export async function getUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw ApiError.unauthenticated(ErrorMessage.NOT_AUTHENTICATED);
  }

  try {
    const user = await userService.getUserByClerkId(clerkId);
    return user.id;
  } catch (error) {
    // If it's a not found error, try to create the user
    if (error instanceof ApiError && error.code === ErrorType.NOT_FOUND) { // Changed error.type to error.code
      const newUser = await userService.getOrCreateUser(clerkId);
      return newUser.id;
    }
    throw error;
  }
}

/**
 * Require authentication before proceeding
 * For use in API routes
 * @returns Object with userId if authenticated, error object if not
 */
export async function requireAuth() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return { error: ErrorMessage.AUTHENTICATION_REQUIRED, status: 401 };
    }

    try {
      const user = await userService.getUserByClerkId(clerkId);
      return { userId: user.id };
    } catch (error) {
      if (error instanceof ApiError && error.code === ErrorType.NOT_FOUND) { // Changed error.type to error.code
        // Create user if not found
        const newUser = await userService.getOrCreateUser(clerkId);
        return { userId: newUser.id };
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth error:', error);
    return { error: 'Authentication error', status: 500 };
  }
} 

/**
 * Higher-order function to handle authentication and database user retrieval.
 * It fetches the Clerk user ID, gets/creates the corresponding database user,
 * and passes the database user object to the wrapped handler.
 *
 * @param handler The actual route handler function to wrap.
 * @returns A new route handler that includes the authenticated database user in its context.
 */
export function withAuthenticatedUser<TParams = any>(handler: AuthenticatedRouteHandler<TParams>) {
  // The returned handler needs to accept the potentially undefined context from Next.js
  return async (request: NextRequest, context: { params?: TParams }) => {
    const authObject = await auth();
    const clerkId = authObject.userId;

    if (!clerkId) {
      // This error will be caught by withErrorHandling
      throw new ApiError(ErrorType.AUTHENTICATION, 'User not authenticated.');
    }

    try {
      // getOrCreateUser ensures we always have a db user for a valid clerkId
      const dbUser = await userService.getOrCreateUser(clerkId);

      // Pass the dbUser to the actual handler
      return handler(request, { ...context, user: dbUser } as { params: TParams; user: User });
    } catch (error) {
      console.error('[withAuthenticatedUser] Error fetching/creating DB user:', error);
      if (error instanceof ApiError) {
        throw error; // Re-throw known API errors
      }
      // For unexpected errors during user retrieval
      throw new ApiError(ErrorType.SERVER_ERROR, 'Failed to retrieve user data.');
    }
  };
} 