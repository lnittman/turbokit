/**
 * TurboKit Global Registry Convex Client
 *
 * Separate Convex client that connects to the global TurboKit preset registry.
 * This is hardcoded and shared across all TurboKit users.
 */

import { ConvexReactClient } from "convex/react";

// Global TurboKit Registry Convex deployment
// This is the SAME for all TurboKit users (shared registry)
const REGISTRY_URL = process.env.NEXT_PUBLIC_TURBOKIT_REGISTRY_URL ||
  "https://loyal-buzzard-850.convex.cloud";

// Singleton registry client
export const registryClient = new ConvexReactClient(REGISTRY_URL);
