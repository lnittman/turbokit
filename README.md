<div align="center">
  <img src="https://v3.fal.media/files/tiger/E1HmgLuqI38QEtv5Myub-.png" alt="turbokit logo" width="80" height="80">
  
  # turbokit
  
  **high-performance development toolkit with turborepo monorepo architecture**
</div>

<br>

## Overview

TurboKit is a modern development framework built on Turborepo, designed for building scalable applications with shared packages and optimized build processes.

## Architecture

Built as a monorepo with:
- **Apps** - Application deployments
- **Packages** - Shared libraries and utilities  
- **Docs** - Documentation and guides
- **Tooling** - Development configuration and scripts

## Features

- ⚡ **Turbocharged Builds** - Optimized with Turborepo caching
- 📦 **Shared Packages** - Reusable components and utilities
- 🔧 **Modern Tooling** - Biome, TypeScript, and modern standards
- 🏗️ **Scalable Architecture** - Designed for team collaboration
- 📋 **Workspace Management** - PNPM workspaces for efficiency

## Quick Start

```bash
git clone https://github.com/lnittman/turbokit
cd turbokit
pnpm install
pnpm dev
```

## Workspace Structure

```
turbokit/
├── apps/              # Applications
├── packages/          # Shared packages
├── docs/              # Documentation
├── turbo.json         # Turbo configuration
├── pnpm-workspace.yaml # Workspace config
└── biome.json         # Code quality config
```

## Development Commands

```bash
pnpm build          # Build all packages and apps
pnpm dev            # Start development servers  
pnpm lint           # Run code quality checks
pnpm test           # Execute test suites
```

## Technology Stack

- **Monorepo**: Turborepo with PNPM workspaces
- **Language**: TypeScript throughout
- **Quality**: Biome for linting and formatting
- **Build**: Optimized caching and parallelization

## Philosophy

TurboKit embraces the principles of shared code, optimized builds, and developer experience. Every tool and configuration choice is made to maximize development velocity while maintaining code quality.

---

*Built for speed, designed for scale*