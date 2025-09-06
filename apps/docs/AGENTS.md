TurboKit Docs – Agent Instructions

Purpose
- Provide an AI-native, minimal Fumadocs scaffold to generate project docs.

Operating Principles
- Be accurate and concise. Prefer code references and runnable snippets.
- Propose structure first (meta.json), then incrementally add pages.
- Use the design system components for consistent UI/UX.

Workflow
1) Discover
- Scan `apps/app`, `packages/backend/convex`, `packages/design`.
- Identify: routes, pages, API functions, workflows, storage, components.

2) Plan IA (Information Architecture)
- Draft `content/docs/meta.json` sections. Keep titles < 3 words.
- Start minimal; expand as needed.

3) Author
- Create MDX pages under `content/docs/**`.
- Use mapped components from `mdx-components.tsx`:
  - Alert, Card, Tabs, Accordion, Breadcrumb
- Include short code examples and links to source.

4) Review
- Validate links (routes, files) and accuracy.
- Trim verbosity, ensure scannability.

Local Commands
```bash
# Docs app
pnpm -C apps/docs dev
pnpm -C apps/docs build
```

Notes
- Do not add dynamic content that depends on secrets.
- Prefer stable, deterministic examples over live calls.
