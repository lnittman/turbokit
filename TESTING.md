# Testing

This repo uses **Vitest** for unit tests and **Playwright** for E2E tests.

## quick commands

```bash
# lint (biome via ultracite)
pnpm lint

# typecheck
pnpm typecheck

# unit tests (workspace)
pnpm test

# e2e (smoke)
pnpm test:e2e
```

## unit tests

- App unit tests live under `apps/app/src/**/__tests__/` or `apps/app/src/**/*.test.ts(x)`.
- Shared unit tests live next to the code they test.

Run only the app tests:

```bash
pnpm --filter ./apps/app test
```

## e2e tests (playwright)

- E2E tests live under `apps/app/e2e/`.
- Default config: `apps/app/playwright.config.ts`.

```bash
pnpm --filter ./apps/app test:e2e
pnpm --filter ./apps/app test:e2e:ui
```

## backend notes (convex)

Convex runs from `packages/backend/`.

```bash
pnpm dev:backend
```

## ci expectations

CI runs:
- lint
- typecheck
- unit tests (coverage upload is informational)
- e2e smoke## local @lnittman/* packages (optional)

If you’re iterating on `~/Developer/packages` locally, you can install `@lnittman/*` deps from disk (instead of GitHub Packages):

```bash
LN_USE_LOCAL_PACKAGES=1 pnpm install

# optional: custom path
LN_PACKAGES_PATH=~/Developer/packages LN_USE_LOCAL_PACKAGES=1 pnpm install
```

This uses `pnpmfile.cjs` (enabled via `.npmrc`). Make sure your shared packages are built:

```bash
cd ~/Developer/packages && pnpm build
```
