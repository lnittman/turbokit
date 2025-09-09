"use client";
import { useUploadFile } from "@convex-dev/r2/react";
import { api } from "@repo/backend/api";

// Hook wrapper for app usage; requires backend to export
// generateUploadUrl and syncMetadata at api.uploads.api.*
export function useAppUploadFile() {
  return useUploadFile((api as any).uploads.api);
}
