# DTF Genetics Web Platform

Unified Next.js application candidate for the DTF Genetics / Dream the Future web ecosystem intended for a future controlled cutover under `dtfseeds.com`.

## Current production status

This repository contains a broad unified application, but it is **not the current whole-site production orchestration authority** for `dtfseeds.com`.

Until an explicit cutover decision is reviewed and verified, current production route ownership, WordPress reconciliation, protected deployment workflows, rollback controls, and visitor-facing verification are governed from `dtfgenetics/Thc`.

Do not deploy this repository over existing `dtfseeds.com` WordPress, genetics, education, static-game, or tool routes merely because the application contains a corresponding route. Treat overlap as migration/cutover work that requires a route-by-route ownership decision and rollback plan.

## Current scope

This is no longer a framework bootstrap. The repository contains the shared Next.js application for:

- Genetics project records and seed-reference pages
- Teaching Healthy Cultivation education, Academy, Living Plant Atlas, diagnostics, evidence sources, and printable learning tools
- GrowLens, Grow Doc, and related cultivation tools
- Browser games, including Bud or Bluff and Burn Buds
- Community, Journal, About, and Contact surfaces
- SEO metadata, redirects, robots, and sitemap generation

Incomplete or experimental features should remain clearly separated from public playable or production-facing routes.

## Stack

- Node.js 22
- Next.js 16.3.3
- React 19
- TypeScript
- Phaser 4 for Phaser-based browser games
- Playwright for desktop/mobile browser QA

## Local commands

```bash
npm install
npm run dev
npm run verify
```

`npm run verify` runs the repository's content and data-integrity checks, game/Atlas/education verification, ESLint, TypeScript checking, and a production Next.js build.

Browser QA is maintained separately through the Playwright workflow and must also pass before any production cutover.

## Architecture boundaries

- This repository is the source of truth for the unified Next.js application code and its future migration/cutover package.
- `dtfgenetics/Thc` is the current production orchestration and route-ownership authority for `https://dtfseeds.com` until a documented cutover replaces that decision.
- The canonical target origin is `https://dtfseeds.com`.
- Authoritative real-time multiplayer infrastructure must follow the currently approved backend decision for the affected game rather than introducing a second room authority from this app.
- Secrets and hosting credentials must not be committed to the repository.

See `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`, and `docs/UPDATE-POLICY.md` for operational details.
