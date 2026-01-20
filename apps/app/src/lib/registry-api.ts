/**
 * TurboKit Registry API
 *
 * Manual API object for the global registry.
 * This file manually defines the API since we don't have codegen for the registry.
 */

import { makeFunctionReference } from "convex/server";

// Create function references for registry queries
export const registryApi = {
  queries: {
    listPresets: makeFunctionReference<"query">("queries:listPresets"),
    getPreset: makeFunctionReference<"query">("queries:getPreset"),
    getStats: makeFunctionReference<"query">("queries:getStats"),
  },
} as const;
