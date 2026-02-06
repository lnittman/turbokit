# TEMP Delivery Reconciliation Report

Generated: 2026-02-06T11:04:59.049Z
Commit window: last 40 commits

## Summary

- linked commits: 0
- orphan commits (no TEMP-* key): 40
- linked TODO/FIXME lines: 0
- orphan TODO/FIXME lines (no TEMP-* key): 4

## Issue Coverage

| issue | commits | TODO/FIXME |
| --- | ---: | ---: |
| (none) | 0 | 0 |

## Orphan TODO/FIXME

- apps/app/src/components/shared/prompt-bar/index.tsx:34 — // TODO: Implement your submission logic here
- packages/media/src/hooks/useFal.ts:76 — // TODO: Handle abort signal if needed
- packages/media/src/hooks/useOpenRouter.ts:82 — // TODO: Handle abort signal if needed
- packages/media/src/hooks/useOpenAI.ts:65 — // TODO: Handle abort signal if needed

## Orphan Commits

- 07aaa0a (2026-02-06) feat: unify sidebar and command action registry
- 5052fe6 (2026-02-06) feat: restore backend reliability paths for media push and rag
- 0a485a8 (2026-02-06) feat: add typed starter layout seams and unified state handling
- 3eb33bc (2026-02-06) fix: stabilize project quality gates and typecheck scope
- 4ceec63 (2026-02-06) feat: checkpoint full turbokit refactor baseline
- 46c407a (2026-02-06) feat: refactor turbokit foundations layouts and settings
- c66f2ad (2026-02-06) chore: checkpoint current turbokit state
- 4c301e0 (2026-02-05) feat: Base UI migration with overlay routes and command palette
- dee4ba8 (2026-01-20) feat: add presets system, notifications, and UI updates
- 166a798 (2025-10-08) feat: integrate next-forge 5.1 updates (Radix monopackage, new components, PostHog/Sentry patterns)
- 05c80b0 (2025-09-16) docs: create comprehensive AGENTS.md documentation for all packages
- b91b714 (2025-09-12) refactor: remove spurious environment variables
- 77ff732 (2025-09-12) chore: remove unused Better Stack integration
- 38e6ee3 (2025-09-11) feat: complete Clerk x Convex authentication setup
- f437bf7 (2025-09-11) feat(webgl): sync package with charlie-xyz (typed SDK surface, improved viewport, utils, docs)
- 5814ecb (2025-09-10) docs: finalize client integration + orchestration guidance; ready for today
- 249a623 (2025-09-10) structure: group domains under convex/app; update imports and api/internal paths; keep providers/ at root; http/webhooks updated; build green
- 3db6fe3 (2025-09-10) docs: ensure CLAUDE.md symlink next to all AGENTS.md
- 165f478 (2025-09-10) docs: make CLAUDE.md a symlink to AGENTS.md for Claude Code
- df279fb (2025-09-10) docs: add Convex layout + cron example to AGENTS.md; reference example from crons.ts (comment only)
- ac6c1a7 (2025-09-10) billing: move Autumn client to billing/autumn.ts; update imports; build green
- a1d17a5 (2025-09-10) structure: keep root clean (no domains/); move agents definitions into agents/definitions; remove db/; confirm root http.ts+webhooks.ts; imports updated; build green
- 2162ce1 (2025-09-10) structure: remove components/; relocate email→emails/resend, r2→uploads/r2, rateLimiter/actionCache→lib; consolidate HTTP into http.ts; move ai/actions→agents/actions; add db/schema re-export; update imports; build green
- 637d647 (2025-09-09) docs: clarify Autumn frontend note (no UI shipped by default)
- e579698 (2025-09-09) cleanup: remove agent UI + AutumnProvider from app; drop autumn-js and r2 from app deps; scrub remaining Polar mentions in docs; rename test fixture to autumnSubscriptionCreated; note migration-neutral comment; rebuild
- 7cdc485 (2025-09-09) billing: align Autumn to official Convex component; remove Polar and unneeded webhook; add convex/autumn.ts exports; add Agent Playground demo page; add AutumnProvider example; R2 clientApi remains; build green with stubs
- 91cd84b (2025-09-09) backend: swap Polar→Autumn; add official Convex components (R2/action-cache/streaming/workpool/presence); domain-oriented layout; remove Next API stubs; R2 clientApi + hook; update agents/workflows to latest APIs; diagnostics banner + docs to Autumn; build green
- ec28206 (2025-09-06) chore(knip): refine ignores; fix unlisted deps; prune unused devDeps in docs/testing
- 32118ef (2025-09-06) chore: restore useful building blocks (menu, modal, utils, docs components, analytics server, scripts); configure Knip to ignore template/library dirs
- 01225d0 (2025-09-06) chore: remove unused files and scripts; prune unused deps (analytics/docs/root); add required deps to design; build green
- 4be05cc (2025-09-06) chore: bump core deps; remove prisma plugin; fix motion types; stabilize fumadocs build; add knip config; tidy deps (design/docs)
- 901d32c (2025-09-05) docs(apps/docs): symlink CLAUDE.md -> AGENTS.md for Claude-friendly entrypoint
- 6ea6423 (2025-09-05) docs(apps/docs): add AGENTS.md with AI-native authoring workflow
- c7c1e6a (2025-09-05) docs(apps/docs): convert to AI-native template skeleton; remove example pages; add agent usage instructions
- 915d474 (2025-09-05) design(components): remove wildcard export from ./ui to avoid missing index; re-export individually
- f6005f7 (2025-09-05) app: unblock build by removing cross-package CSS import; keep Tailwind only for now
- 0df5597 (2025-09-05) chore(design): explicitly export styles/globals.css for app CSS import
- 4ec5b8c (2025-09-05) chore(design): export postcss.config.mjs for Next CSS pipeline
- 06db443 (2025-09-05) docs(apps/docs): wire custom MDX components (Accordion fallbacks) into docs page renderer
- b3f69b2 (2025-09-05) docs(apps/docs): add minimal Accordion MDX fallbacks to satisfy content

