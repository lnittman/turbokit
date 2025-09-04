# Backend Package - Type System

This package provides the Convex backend for TurboKit, including a clean type export system that avoids brittle imports from generated paths.

## Type Imports

### ✅ Recommended: Import from @repo/backend/types

```typescript
// In your app code (e.g., apps/app/src/components/ProjectList.tsx)
import type { Project, User, ProjectId } from "@repo/backend/types";

// Use the types
function ProjectCard({ project }: { project: Project }) {
  // TypeScript knows all the fields of a Project document
  return <div>{project.name}</div>;
}
```

### ✅ Using convenience aliases

```typescript
import type { 
  User,           // Instead of Doc<"users">
  Project,        // Instead of Doc<"projects">
  Thread,         // Instead of Doc<"threads">
  Message,        // Instead of Doc<"messages">
  UserId,         // Instead of Id<"users">
  ProjectId,      // Instead of Id<"projects">
} from "@repo/backend/types";

// Much cleaner than:
// import type { Doc, Id } from "@repo/backend/convex/_generated/dataModel";
// type User = Doc<"users">;
// type Project = Doc<"projects">;
```

### ✅ Using API functions

```typescript
import { api } from "@repo/backend/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

function MyComponent() {
  const projects = useQuery(api.functions.queries.projects.list);
  const createProject = useMutation(api.functions.mutations.projects.create);
}
```

### ❌ Avoid: Deep imports from _generated

```typescript
// Don't do this - brittle path that could break
import type { Doc } from "@repo/backend/convex/_generated/dataModel";
```

## Available Type Exports

### Core Convex Types
- `Doc<T>` - Document type for a table
- `Id<T>` - ID type for a table
- `DataModel` - The complete data model type

### Document Type Aliases
- `User` - Alias for `Doc<"users">`
- `Project` - Alias for `Doc<"projects">`
- `Thread` - Alias for `Doc<"threads">`
- `Message` - Alias for `Doc<"messages">`
- `Activity` - Alias for `Doc<"activities">`

### ID Type Aliases
- `UserId` - Alias for `Id<"users">`
- `ProjectId` - Alias for `Id<"projects">`
- `ThreadId` - Alias for `Id<"threads">`
- `MessageId` - Alias for `Id<"messages">`
- `ActivityId` - Alias for `Id<"activities">`
- `StorageId` - Alias for `Id<"_storage">`

### Enums and Status Types
- `UserRole` - "user" | "admin"
- `ProjectStatus` - "active" | "archived" | "draft"
- `MessageRole` - "user" | "assistant" | "system"
- `SubscriptionStatus` - "active" | "trialing" | "past_due" | "cancelled"
- `SubscriptionTier` - "free" | "starter" | "pro" | "enterprise"

### Utility Types
- `WithoutSystemFields<T>` - Removes _id and _creationTime
- `WithTimestamps<T>` - Adds createdAt and updatedAt
- `PartialFields<T, K>` - Makes specified fields optional
- `ConvexResult<T>` - Promise that may return null
- `ConvexPaginatedResult<T>` - Paginated result type

### Metadata Types
- `UserMetadata` - Flexible user metadata object
- `ProjectSettings` - Project configuration object

## Example Usage in Components

```typescript
// apps/app/src/components/UserProfile.tsx
import type { User, Project } from "@repo/backend/types";
import { api } from "@repo/backend/convex/_generated/api";
import { useQuery } from "convex/react";

interface UserProfileProps {
  userId: UserId;
}

export function UserProfile({ userId }: UserProfileProps) {
  const user = useQuery(api.functions.queries.users.getById, { id: userId });
  const projects = useQuery(api.functions.queries.projects.listByUser, { userId });
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <h2>Projects ({projects?.length ?? 0})</h2>
      {projects?.map((project: Project) => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const statusColors: Record<ProjectStatus, string> = {
    active: "green",
    archived: "gray", 
    draft: "yellow",
  };
  
  return (
    <div className={`border-${statusColors[project.status]}-500`}>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
    </div>
  );
}
```

## Type Safety Benefits

1. **IntelliSense**: Full autocomplete for all document fields
2. **Type Checking**: Compile-time validation of field access
3. **Refactoring**: Rename fields safely across the codebase
4. **Documentation**: Types serve as documentation
5. **Clean Imports**: No brittle paths to generated files

## Why This Pattern?

Per Convex best practices:
- Generated `dataModel.d.ts` is the source of truth for types
- Re-exporting from a stable location prevents brittle imports
- Type aliases provide cleaner, more semantic code
- Maintains full type safety while improving DX

## Adding New Types

When you add a new table to the schema:

1. Add it to `convex/schema.ts`
2. Run `npx convex dev` to generate types
3. Add convenience aliases to `types.ts`:
   ```typescript
   export type NewTable = Doc<"newTable">;
   export type NewTableId = Id<"newTable">;
   ```
4. Use in your app:
   ```typescript
   import type { NewTable } from "@repo/backend/types";
   ```