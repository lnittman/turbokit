import { z } from 'zod';

import { User as PrismaUser } from '@repo/database';

/**
 * Base User schema without relations
 */
export const userSchema = z.object({
  id: z.string().uuid(),
  clerkId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  hideSharedWarning: z.boolean()
});

/**
 * User preferences schema
 */
export const userPreferencesSchema = z.object({
  hideSharedWarning: z.boolean()
});

/**
 * Schema for updating user preferences
 */
export const updateUserPreferencesSchema = z.object({
  hideSharedWarning: z.boolean().optional()
});

/**
 * Types inferred from the schemas
 */
export type User = z.infer<typeof userSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UpdateUserPreferencesRequest = z.infer<typeof updateUserPreferencesSchema>;

/**
 * Utility functions to safely convert between Prisma and Zod validated types
 */
export const fromPrisma = {
  user: (prismaUser: PrismaUser): User => ({
    id: prismaUser.id,
    clerkId: prismaUser.clerkId,
    createdAt: prismaUser.createdAt,
    updatedAt: prismaUser.updatedAt,
    hideSharedWarning: prismaUser.hideSharedWarning
  }),
  
  preferences: (prismaUser: PrismaUser): UserPreferences => ({
    hideSharedWarning: prismaUser.hideSharedWarning
  })
}; 