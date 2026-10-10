# TopCoaching Simulations Monorepo

Dedicated standalone monorepo for TopCoaching interactive simulations.

## Monorepo Layout
- `apps/physics`: Next.js 16 App Router physics simulation site
- `packages/sim-core`: `@topcoaching/sim-core` subject-agnostic bridge, embed engine, store factory, HUD primitives
- `verification`: Playwright integration, contract & smoke tests
- `docs`: Architecture, slug specifications, copy manifest, known issues

## Quick Start
```bash
pnpm install
pnpm -r build
pnpm --filter physics dev
```
