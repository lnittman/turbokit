# TypeScript Config Package - AI Agent Instructions

## Overview
This package provides shared TypeScript configurations for TurboKit applications, ensuring consistent type checking, compilation settings, and language features across all packages and apps. It includes presets for Next.js apps, React libraries, and base Node.js packages.

## Quick Start Checklist
- [ ] Choose appropriate config preset for your package
- [ ] Extend base configuration in tsconfig.json
- [ ] Configure path aliases if needed
- [ ] Set up build output directories
- [ ] Enable/disable incremental compilation
- [ ] Configure module resolution strategy

## Architecture

### Package Structure
```
packages/typescript-config/
├── base.json          # Base configuration for all packages
├── nextjs.json        # Next.js app configuration
├── react-library.json # React component library configuration
└── package.json       # Package metadata
```

### Configuration Hierarchy
```
base.json (shared foundation)
    ├── nextjs.json (for Next.js apps)
    └── react-library.json (for React packages)
```

## Configuration Presets

### Base Configuration (`base.json`)
Foundation for all TypeScript projects in the monorepo:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    // Type Checking
    "strict": true,                          // Enable all strict type checks
    "strictNullChecks": true,                // Null/undefined checking
    "noImplicitAny": true,                   // Error on implicit any
    "noUnusedLocals": true,                  // Error on unused variables
    "noUnusedParameters": true,              // Error on unused parameters
    "noFallthroughCasesInSwitch": true,     // Error on switch fallthrough

    // Module System
    "module": "NodeNext",                    // Modern Node.js modules
    "moduleResolution": "bundler",           // Bundler-style resolution
    "moduleDetection": "force",              // Treat all files as modules
    "esModuleInterop": true,                 // CommonJS interop
    "resolveJsonModule": true,               // Import JSON files

    // Compilation
    "target": "ES2022",                      // Modern JavaScript output
    "lib": ["es2022", "DOM", "DOM.Iterable"], // Available libraries
    "jsx": "preserve",                       // Keep JSX for tooling
    "declaration": true,                     // Generate .d.ts files
    "declarationMap": true,                  // Generate source maps for .d.ts
    "sourceMap": true,                       // Generate source maps

    // Performance
    "incremental": false,                    // Disable incremental by default
    "isolatedModules": true,                 // Ensure compatibility with bundlers
    "skipLibCheck": true,                    // Skip checking .d.ts files

    // File Handling
    "forceConsistentCasingInFileNames": true, // Enforce consistent casing
    "allowJs": false,                        // Don't allow JS files
    "checkJs": false                         // Don't check JS files
  }
}
```

### Next.js Configuration (`nextjs.json`)
Optimized for Next.js applications:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  "compilerOptions": {
    // Next.js specific
    "jsx": "preserve",                       // Next.js handles JSX
    "allowJs": true,                         // Allow JavaScript files
    "checkJs": true,                         // Type check JS files
    "incremental": true,                     // Faster rebuilds
    "noEmit": true,                          // Next.js handles emit

    // Module resolution
    "module": "esnext",                      // ESNext modules
    "moduleResolution": "bundler",           // Bundler resolution

    // React configuration
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",

    // Path mapping
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"]
    },

    // Next.js plugins
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "out",
    "public"
  ]
}
```

### React Library Configuration (`react-library.json`)
For React component packages:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "React Library",
  "extends": "./base.json",
  "compilerOptions": {
    // React specific
    "jsx": "react-jsx",                      // React 17+ JSX transform
    "lib": ["ES2022", "DOM", "DOM.Iterable"],

    // Library output
    "declaration": true,                     // Generate type definitions
    "declarationMap": true,                  // Source maps for definitions
    "emitDeclarationOnly": false,            // Also emit JS
    "composite": true,                       // Enable project references

    // Module format
    "module": "esnext",                      // ESNext modules
    "target": "es2022",                      // Modern JS output

    // Development
    "sourceMap": true,                       // Enable source maps
    "inlineSources": true                    // Include sources in maps
  },
  "include": [
    "src/**/*",
    "index.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/*.stories.tsx"
  ]
}
```

## Using Configurations

### In a Next.js App
```json
// apps/app/tsconfig.json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@repo/ui": ["../../packages/design/index.tsx"],
      "@repo/backend": ["../../packages/backend/convex"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### In a React Package
```json
// packages/design/tsconfig.json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist"
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist", "**/*.test.tsx"]
}
```

### In a Node.js Package
```json
// packages/backend/tsconfig.json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "module": "esnext",
    "target": "es2022",
    "lib": ["es2022"],
    "noEmit": true
  },
  "include": ["convex/**/*"],
  "exclude": ["node_modules", "convex/_generated"]
}
```

## Compiler Options Explained

### Strict Type Checking
```json
{
  "strict": true,                    // Enable all strict checks
  "strictNullChecks": true,          // null/undefined must be explicit
  "strictFunctionTypes": true,       // Strict function type checking
  "strictBindCallApply": true,       // Strict bind/call/apply
  "strictPropertyInitialization": true, // Class properties must be initialized
  "noImplicitAny": true,            // No implicit any types
  "noImplicitThis": true,           // No implicit this types
  "alwaysStrict": true              // Use strict mode in all files
}
```

### Module Resolution
```json
{
  "moduleResolution": "bundler",     // For webpack/vite/esbuild
  // or
  "moduleResolution": "node",        // Traditional Node.js resolution
  // or
  "moduleResolution": "node16",      // Node.js with ESM support

  "resolveJsonModule": true,         // Import JSON files
  "allowSyntheticDefaultImports": true, // Default imports from CJS
  "esModuleInterop": true            // Better CommonJS interop
}
```

### JSX Configuration
```json
{
  "jsx": "preserve",           // Keep JSX (Next.js)
  // or
  "jsx": "react",              // Classic React.createElement
  // or
  "jsx": "react-jsx",          // React 17+ automatic
  // or
  "jsx": "react-jsxdev",       // Development mode with debug info

  "jsxImportSource": "react",  // For custom JSX runtimes
  "jsxFactory": "h",           // Custom JSX factory (e.g., Preact)
}
```

### Output Configuration
```json
{
  "target": "ES2022",          // JavaScript version to compile to
  "module": "esnext",          // Module system to use
  "outDir": "./dist",          // Output directory
  "rootDir": "./src",          // Root directory of source files
  "declaration": true,         // Generate .d.ts files
  "declarationMap": true,      // Generate .d.ts.map files
  "sourceMap": true,           // Generate source maps
  "removeComments": true,      // Remove comments from output
  "emitDeclarationOnly": false // Only emit .d.ts files
}
```

## Path Mapping

### Setting Up Path Aliases
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      // App aliases
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],

      // Monorepo packages
      "@repo/ui": ["../../packages/design"],
      "@repo/ui/*": ["../../packages/design/*"],
      "@repo/backend": ["../../packages/backend/convex"],
      "@repo/backend/*": ["../../packages/backend/convex/*"],

      // Test utilities
      "@test/*": ["./test/*"],
      "@test/utils": ["./test/utils/index.ts"]
    }
  }
}
```

### Using Path Aliases
```typescript
// Instead of:
import { Button } from '../../../packages/design/components/ui/button';
import { api } from '../../../packages/backend/convex/_generated/api';

// Use:
import { Button } from '@repo/ui/components/ui/button';
import { api } from '@repo/backend/_generated/api';
```

## Project References

### Setting Up Project References
```json
// Root tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./apps/app" },
    { "path": "./apps/docs" },
    { "path": "./packages/design" },
    { "path": "./packages/backend" },
    { "path": "./packages/auth" }
  ]
}
```

### Package Configuration with References
```json
// packages/design/tsconfig.json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../auth" }  // Depends on auth package
  ]
}
```

### Building with References
```bash
# Build entire project
tsc --build

# Build specific package
tsc --build packages/design

# Clean build artifacts
tsc --build --clean
```

## Performance Optimization

### Incremental Compilation
```json
{
  "compilerOptions": {
    "incremental": true,              // Enable incremental compilation
    "tsBuildInfoFile": ".tsbuildinfo" // Cache file location
  }
}
```

### Skip Library Checking
```json
{
  "compilerOptions": {
    "skipLibCheck": true,            // Skip type checking of .d.ts files
    "skipDefaultLibCheck": true      // Skip default library .d.ts files
  }
}
```

### Isolated Modules
```json
{
  "compilerOptions": {
    "isolatedModules": true          // Ensure each file can be transpiled independently
  }
}
```

## Common Patterns

### Monorepo Root Config
```json
// tsconfig.json (root)
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "files": [],
  "references": [
    { "path": "./apps/app" },
    { "path": "./packages/design" }
  ]
}
```

### Library Package Config
```json
// packages/my-lib/tsconfig.json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.ts", "dist"]
}
```

### Test Configuration
```json
// tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "test/**/*"
  ]
}
```

## Type Checking Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",
    "build:types": "tsc --declaration --emitDeclarationOnly",
    "clean:types": "rm -rf dist *.tsbuildinfo"
  }
}
```

### Turbo Pipeline
```json
// turbo.json
{
  "tasks": {
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": []
    },
    "build:types": {
      "dependsOn": ["^build:types"],
      "outputs": ["dist/**", "*.tsbuildinfo"]
    }
  }
}
```

## IDE Integration

### VS Code Settings
```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.preferences.quoteStyle": "single",
  "typescript.format.semicolons": "insert",
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.inlayHints.propertyDeclarationTypes.enabled": true
}
```

### ESLint Integration
```json
// .eslintrc.json
{
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "settings": {
    "import/resolver": {
      "typescript": {
        "project": "./tsconfig.json"
      }
    }
  }
}
```

## Common Issues & Solutions

### Module Resolution Errors
```json
// Fix: Ensure correct moduleResolution
{
  "compilerOptions": {
    "moduleResolution": "bundler", // For build tools
    // or
    "moduleResolution": "node"     // For Node.js
  }
}
```

### Path Alias Not Working
```bash
# Install required packages
pnpm add -D tsconfig-paths

# For runtime (Node.js)
node -r tsconfig-paths/register ./src/index.ts

# For build tools, configure alias in tool config
```

### Type Definition Conflicts
```json
// Exclude conflicting types
{
  "compilerOptions": {
    "types": ["node", "react"], // Only include specific types
    "skipLibCheck": true        // Skip checking .d.ts files
  }
}
```

### Slow Type Checking
```json
// Optimize for performance
{
  "compilerOptions": {
    "incremental": true,
    "skipLibCheck": true,
    "skipDefaultLibCheck": true
  },
  "exclude": [
    "node_modules",
    "dist",
    ".next",
    "coverage",
    "**/*.test.ts"
  ]
}
```

## Best Practices

### 1. Use Strict Mode
Always enable strict mode for better type safety:
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### 2. Configure Path Aliases
Use path aliases for cleaner imports:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. Separate Test Config
Use a separate config for tests:
```json
// tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "include": ["**/*.test.ts", "test/**/*"]
}
```

### 4. Enable Source Maps
Always enable source maps for debugging:
```json
{
  "compilerOptions": {
    "sourceMap": true,
    "declarationMap": true
  }
}
```

### 5. Use Project References
For monorepos, use project references:
```json
{
  "compilerOptions": {
    "composite": true
  },
  "references": [
    { "path": "../other-package" }
  ]
}
```

## Migration Guide

### From JavaScript to TypeScript
1. Rename files from `.js` to `.ts` (or `.jsx` to `.tsx`)
2. Add `tsconfig.json` extending appropriate preset
3. Fix type errors incrementally
4. Add type annotations gradually

### Updating TypeScript Version
```bash
# Update TypeScript
pnpm up typescript@latest -r

# Check for breaking changes
pnpm typecheck

# Update config for new features
```

## Environment Variables
No environment variables required. Configuration is done through tsconfig.json files.

## Key Files
- `base.json` - Base TypeScript configuration
- `nextjs.json` - Next.js-specific configuration
- `react-library.json` - React library configuration

## TurboKit Conventions
- Strict type checking enabled by default
- Modern JavaScript target (ES2022)
- Path aliases for clean imports
- Optimized for monorepo structure
- Consistent configuration across all packages
- Performance optimizations enabled