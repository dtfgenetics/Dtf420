# Seed Man: Seed Ascent — Game Contract

Status: active development / migration runtime  
Canonical repository: `dtfgenetics/Dtf420`  
Public target: `/games/seed-ascent/`  
Runtime entry: `/seed-ascent.html`

## Product identity

Seed Ascent is a **separate Seed Man game** from `Seed Man: Grow. Fight. Restore.`. Do not redirect Seed Ascent development into the 20-level production Seed Man platformer unless an explicit consolidation decision changes ownership.

The fantasy is a fast side-scrolling ascent campaign: move Seed Man through increasingly difficult grow-themed stages, defeat powered enemies and minor bosses, acquire temporary phenotype powers, and reach the end of all six worlds.

## Current scope

- 12 side-scrolling stages
- six grow-themed worlds
- Plant base form
- Fire, Electric, and Ice temporary phenotype powers
- powered enemies and minor bosses
- keyboard/touch browser play
- Next.js route wrapper at `app/games/seed-ascent/page.tsx`
- dedicated static runtime under `public/seed-ascent.html` and `public/seed-ascent/`

## Core loop

1. Enter a stage.
2. Run/jump through traversal hazards.
3. Defeat or avoid enemies.
4. Acquire phenotype power opportunities.
5. Use Fire, Electric, or Ice abilities before their timers expire.
6. Reach the stage objective.
7. Advance through the 12-stage campaign.

## Architecture

The Next.js page is a product wrapper only. The dedicated static Seed Ascent runtime owns gameplay.

Keep simulation/game state separate from wrapper UI and deployment shell. Browser input must reset safely on blur/visibility changes and must support pointer/touch ownership without stuck controls.

## Verification

Canonical Dtf420 checks:

```bash
npm run verify:seed-ascent
npm run verify:seed-ascent-animations
npm run typecheck
npm run build:static-overlay
npm run verify:static-overlay
```

## Definition of finished

Seed Ascent is release-ready only when all 12 stages are playable from start to finish on desktop and mobile, progression/powers/animation state are deterministic, no stage is blocked by route or asset failures, the DTFSeeds integration has one explicit production owner, and the exact visitor route is verified after deployment.

## Current next goal

Keep this identity distinct from the 20-level Seed Man platformer, finish stage/progression/game-feel QA, and establish explicit final production ownership before promoting it as a public game.
