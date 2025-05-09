# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build/Run: `pnpm dev` or `npm run dev` (runs Mastra dev server)
- Install: `pnpm install` (preferred) or `npm install`
- No test commands defined (package.json has placeholder test script)
- Linting/TypeChecking not explicitly configured

## Code Style
- TypeScript with ES modules (`"type": "module"` in package.json)
- Import conventions: absolute paths from project root (e.g., `src/mastra/...`)
- Error handling: Use try/catch with detailed error logging showing multiple attempts
- Use Zod for data validation and schema definition
- Follows Mastra.ai framework architecture (agents, workflows, tools)
- XML files for structured prompts with consistent sectioning
- Console logging uses levels from '@mastra/core/logger'
- Path handling with Node.js path module using multiple fallback paths

## Project Structure
- Agent definitions in `src/mastra/agents/`
- Workflows in `src/mastra/workflows/`
- Utility functions in `src/mastra/utils/`
- XML prompt files alongside TS implementation files