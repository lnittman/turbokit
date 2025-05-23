import { z } from 'zod';

import { database as db } from '@repo/database';
import { User as PrismaUser } from '@repo/database';

import { ResourceType, ErrorType } from '../constants';
import { ApiError } from '../lib/error';
import { validateWith } from '../lib/validation';
import { 
  updateUserPreferencesSchema,
  fromPrisma,
  User,
  UserPreferences
} from '../schemas/user';

/**
 * Input schema for creating a user
 */
const createUserSchema = z.object({
  clerkId: z.string(),
  hideSharedWarning: z.boolean().optional()
});
type CreateUserInput = z.infer<typeof createUserSchema>;

export class UserService {
  /**
   * Create a new user (admin operation)
   */
  async createUser(data: CreateUserInput): Promise<User> {
    try {
      // Validate input data
      const validatedData = await validateWith(createUserSchema, data);
      
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { clerkId: validatedData.clerkId }
      });
      
      if (existingUser) {
        throw new ApiError(
          ErrorType.VALIDATION, 
          'User with this Clerk ID already exists',
          { clerkId: validatedData.clerkId }
        );
      }
      
      // Create new user
      const newUser = await db.user.create({
        data: {
          clerkId: validatedData.clerkId,
          hideSharedWarning: validatedData.hideSharedWarning ?? false
        }
      });
      
      return fromPrisma.user(newUser);
    } catch (error) {
      console.error('[UserService.createUser] Error creating user:', error);
      throw error instanceof ApiError ? error : new ApiError(ErrorType.SERVER_ERROR, 'Failed to create user');
    }
  }

  /**
   * Get all users (admin operation)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await db.user.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return users.map(fromPrisma.user);
    } catch (error) {
      console.error('[UserService.getAllUsers] Error fetching users:', error);
      throw new ApiError(ErrorType.SERVER_ERROR, 'Failed to fetch users');
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(clerkId: string): Promise<User> {
    return this.getUserByClerkId(clerkId);
  }

  /**
   * Get or create a user record for the authenticated user
   * This is useful during onboarding or initial authentication
   */
  async getOrCreateUser(clerkId: string): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { clerkId }
      });
      
      if (existingUser) {
        return fromPrisma.user(existingUser);
      }
      
      // Create a new user if not found
      const newUser = await db.user.create({
        data: {
          clerkId,
          hideSharedWarning: false
        }
      });
      
      return fromPrisma.user(newUser);
    } catch (error) {
      console.error('[UserService.getOrCreateUser] Error getting/creating user:', error);
      throw new ApiError(ErrorType.SERVER_ERROR, 'Failed to get or create user');
    }
  }

  /**
   * Get a user by their Clerk ID
   */
  async getUserByClerkId(clerkId: string): Promise<User> {
    try {
      const user = await db.user.findUnique({
        where: { clerkId }
      });
      
      if (!user) {
        throw ApiError.notFound(ResourceType.USER);
      }
      
      return fromPrisma.user(user);
    } catch (error) {
      console.error('[UserService.getUserByClerkId] Error fetching user:', error);
      throw error instanceof ApiError ? error : new ApiError(ErrorType.SERVER_ERROR, 'Failed to fetch user');
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      // Fetch user by DB ID
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw ApiError.notFound(ResourceType.USER);
      }
      return fromPrisma.preferences(user as PrismaUser);
    } catch (error) {
      console.error('[UserService.getUserPreferences] Error fetching preferences:', error);
      throw error instanceof ApiError ? error : new ApiError(ErrorType.SERVER_ERROR, 'Failed to fetch user preferences');
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: z.infer<typeof updateUserPreferencesSchema>): Promise<UserPreferences> {
    try {
      // Validate input data
      const validatedData = await validateWith(updateUserPreferencesSchema, preferences);
      
      // Find user by DB ID to ensure they exist and get current prefs
      const currentUser = await db.user.findUnique({ where: { id: userId } });
      if (!currentUser) {
        throw ApiError.notFound(ResourceType.USER);
      }
      
      // Update user preferences
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          hideSharedWarning: validatedData.hideSharedWarning ?? currentUser.hideSharedWarning
        }
      });
      
      return fromPrisma.preferences(updatedUser);
    } catch (error) {
      console.error('[UserService.updateUserPreferences] Error updating preferences:', error);
      throw error instanceof ApiError ? error : new ApiError(ErrorType.SERVER_ERROR, 'Failed to update user preferences');
    }
  }
}

export const userService = new UserService();
