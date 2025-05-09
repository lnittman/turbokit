/**
 * Re-export all schema definitions
 */

// Re-export schemas - handle fromPrisma export conflicts
export * from './user';

// Fix conflicting exports by re-exporting with explicit names
import { fromPrisma as userFromPrisma } from './user';

// Re-export fromPrisma utilities with namespaced names to avoid conflicts
export const fromPrisma = {
  user: userFromPrisma,
}; 