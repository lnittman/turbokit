# TurboKit Product Documentation

This is the documentation site for **TurboKit itself** - the template/framework.

## Structure

- **`./docs`** - Documentation for TurboKit as a product (this directory)
  - How to use TurboKit
  - Architecture decisions
  - Setup guides
  - Deployment instructions
  
- **`apps/docs`** - Template documentation site for YOUR application
  - This is what users of TurboKit will customize
  - Pre-configured Fumadocs setup
  - Ready to document their own app

## Development

```bash
# Run TurboKit documentation (port 3003)
pnpm docs:dev

# Run template docs for your app (port 3002) 
pnpm --filter @repo/docs dev
```

## Key Difference

- **This site** (`./docs`): Documents how to USE TurboKit
- **Template site** (`apps/docs`): Documents YOUR app built WITH TurboKit

When someone runs `npx create-turbokit@latest`, they get `apps/docs` to document their own application, while this `./docs` site remains the central documentation for TurboKit itself.