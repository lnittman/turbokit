import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/api";

export function useUser() {
  const { userId: clerkId } = useClerkAuth();
  
  const user = useQuery(
    api.functions.queries.users.getUserByClerkId,
    clerkId ? { clerkId } : "skip"
  );
  
  return {
    user,
    isLoading: user === undefined && clerkId !== null,
    isAuthenticated: !!user,
  };
}

export function useCurrentUser() {
  const user = useQuery(api.functions.queries.users.getMe);
  
  return {
    user,
    isLoading: user === undefined,
    isAuthenticated: !!user,
  };
}

export function useUserProjects() {
  const projects = useQuery(api.functions.queries.users.getUserProjects);
  
  return {
    projects: projects || [],
    isLoading: projects === undefined,
  };
}

export function useActivities(limit?: number) {
  const activities = useQuery(
    api.functions.queries.users.getActivities,
    { limit }
  );
  
  return {
    activities: activities || [],
    isLoading: activities === undefined,
  };
}

export { useAuth } from "@clerk/nextjs";