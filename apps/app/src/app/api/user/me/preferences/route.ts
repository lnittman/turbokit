import { NextRequest } from 'next/server';

import { successResponse, validateWith, withErrorHandling } from '@repo/api/lib/response';
import { updateUserPreferencesSchema } from '@repo/api/schemas/user';
import { userService } from '@repo/api/services/user';
import { withAuthenticatedUser } from '@/lib/auth';
import { User } from '@repo/database';

/**
 * GET - Retrieve current user's preferences
 * @param request - The NextRequest object
 * @param context - Context containing the authenticated user
 * @param context.user - The authenticated database User object
 * @returns A success response with the user preferences object
 * 
 * This endpoint retrieves all preferences for the authenticated user.
 * Preferences include UI settings, notification preferences, and feature opt-ins.
 * If a user has never set preferences, default values are returned based on the
 * preference schema defaults.
 * 
 * This endpoint is used to populate user settings UI and apply user-specific
 * customizations throughout the application.
 */
export const GET = withErrorHandling(
  withAuthenticatedUser(async function getPreferences(
    request: NextRequest,
    context: { user: User }
  ) {
    const { user } = context;

    const preferences = await userService.getUserPreferences(user.id);

    return successResponse(preferences);
  })
);

/**
 * PATCH - Update user preferences
 * @param request - The NextRequest object
 * @param context - Context containing the authenticated user
 * @param context.user - The authenticated database User object
 * @param request.body - JSON body containing preference updates
 * @returns A success response with the complete updated preferences object
 * 
 * This endpoint allows users to update their preferences. The request body can
 * contain any subset of preference fields that need to be updated. Fields not
 * included in the request will maintain their current values.
 * 
 * The endpoint uses PATCH semantics, meaning it performs a partial update rather
 * than replacing the entire preferences object. All fields are validated according
 * to the updateUserPreferencesSchema requirements before being saved.
 * 
 * After updating, the full preferences object (with all fields, including those
 * that weren't modified) is returned in the response.
 */
export const PATCH = withErrorHandling(
  withAuthenticatedUser(async function updatePreferences(
    request: NextRequest,
    context: { user: User }
  ) {
    const { user } = context;

    // Validate request body
    const body = await request.json();
    const data = await validateWith(updateUserPreferencesSchema, body);

    const updatedPreferences = await userService.updateUserPreferences(user.id, data);

    return successResponse(updatedPreferences);
  })
);
