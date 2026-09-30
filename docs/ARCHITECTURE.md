# DTF Genetics Web Architecture

## Purpose

This repository is the **future unified Next.js migration/cutover application** for DTF Genetics. It is not the current whole-site production authority and it is not the canonical authoring source for product domains that already have dedicated owners.

Current production integration/deployment authority remains `dtfgenetics/Thc` until a reviewed cutover explicitly changes that decision.

## Canonical domain ownership

Until a documented cutover is approved, authoritative product work belongs in:

- `dtfgenetics/Tools` — cultivation tools, Plant Atlas, Terpene Atlas, cultivation math, and tool UI/runtime.
- `dtfgenetics/thc-grow-hub` — THC encyclopedia, general cultivation education, and education runtime.
- `dtfgenetics/Thc-learning-courses-` — THC Academy certification courses, assessments, practicals, and credential rules.
- `dtfgenetics/Thc-dataset` — Grow Doc diagnostics, diagnostic taxonomy/rules, reference metadata, and diagnostic model/data controls.
- `dtfgenetics/Thc` — current production integration, route ownership, deployment orchestration, rollback, and public release verification.
- Browser games — the owner recorded in the canonical DTF project/game registries.

Code for those domains may exist here as migration/cutover candidates, compatibility layers, or UI experiments, but must not silently become a second source of truth.

## Application stack

- Next.js App Router
- TypeScript
- React
- Phaser for Phaser-based browser games
- Node.js 22
- Hostinger Business Web Hosting as the current staging/cutover target
- Playwright for desktop/mobile browser QA

## Route families in this migration application

This application currently implements or prototypes route families including:

- `/seeds`
- `/learn`
- `/tools`
- `/games`
- `/community`
- `/journal`
- `/about`
- `/contact`

Implementation of a route here does **not** establish canonical ownership or production authority. Route ownership changes only through an explicit reviewed cutover that removes dual writers, preserves rollback, and updates the canonical repository registry.

## Migration and cutover rule

For any overlapping product area:

1. Identify the current canonical owner.
2. Compare this implementation against the canonical source.
3. Port uniquely useful improvements into the canonical owner unless a whole-route cutover has been explicitly approved.
4. Validate equivalent or better behavior, content, accessibility, performance, and release safety.
5. Eliminate duplicate writers.
6. Preserve rollback/provenance.
7. Update ownership registries only after the cutover is reviewed and verified.

Do not keep two active implementations moving forward in parallel.

## Education content boundary

Education content in this repository is migration/cutover material unless explicitly promoted. Canonical general education belongs in `dtfgenetics/thc-grow-hub`; certification belongs in `dtfgenetics/Thc-learning-courses-`; diagnostics belong in `dtfgenetics/Thc-dataset`.

Scientific claims should remain connected to evidence when supporting sources are available. Internal production backlog language should not appear on public lesson pages.

## Tool and Atlas boundary

Tool, Plant Atlas, and Terpene Atlas code here is not canonical while `dtfgenetics/Tools` remains the registered owner. Uniquely useful UI or interaction work should be ported into `Tools` rather than maintained as a competing implementation.

## Game boundary

Resolve each browser game through the canonical DTF game/project registries before editing it. A game implemented here may be a migration shell, integration surface, or cutover candidate rather than the authoritative game source.

A title should be presented as playable only when its public route, runtime, controls, and QA are functioning.

## Multiplayer boundary

Do not place an authoritative long-lived WebSocket game server inside hosting that cannot reliably accept and maintain those connections. Real-time multiplayer should use a dedicated service where required.

## Repository rules

- Do not commit deployment secrets, API keys, private credentials, or user data.
- Do not introduce a new competing source of truth for a domain with an existing canonical owner.
- Keep migration/cutover routes and sitemap entries internally consistent.
- Preserve canonical URLs and redirects when replacing legacy content.
- Run `npm run verify` before a reviewed cutover.
- Treat production domain changes as separate, reversible operations from ordinary merges.
- Keep `docs/CONSOLIDATION_MIGRATION_QUEUE.json` and `scripts/validate-consolidation-boundaries.mjs` aligned with the canonical repository registry.

See `docs/DEPLOYMENT.md` for release and rollback requirements.
