# DTF Genetics Web Platform

Production application repository for the DTF Genetics / Dream the Future web ecosystem served under `dtfseeds.com`.

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

Browser QA is maintained separately through the Playwright workflow and must also pass before production cutover.

## Architecture boundaries

- This repository is the web application source of truth for the unified DTF Genetics site experience.
- The canonical production origin is `https://dtfseeds.com`.
- Authoritative real-time multiplayer infrastructure, when required, should run as a separate service rather than being embedded in basic web hosting.
- Secrets and hosting credentials must not be committed to the repository.

See `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`, and `docs/UPDATE-POLICY.md` for operational details.
