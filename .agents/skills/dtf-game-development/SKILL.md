---
name: dtf-game-development
description: Use when researching, planning, coding, debugging, redesigning, testing, deploying, migrating, or locating any DTFSeeds game from Dtf420, especially when migration copies, aliases, routes, or production ownership could be confused.
metadata:
  author: dtfgenetics
  version: "1.0.0"
---

# DTF Game Development from Dtf420

Before implementation:

1. Fetch `dtfgenetics/Thc/data/game-registry-v2.json`.
2. Resolve the requested title through its `aliasMap`.
3. Read the matching game entry and establish canonical game ID, goal, `production.repository`, `production.sourcePaths`, game-design/source-of-truth document, architecture, alternate/deprecated locations, verification commands, `release.status`, blockers, and next milestone.
4. If Dtf420 is only a migration/development location, keep production ownership unchanged until an explicit cutover.
5. Read the local game source and `lib/game-runtime-registry.ts` only after the portfolio identity is resolved.
6. Use `dtf-game-router` and the appropriate specialist game skills for implementation.

A same-named Dtf420 route is not proof that Dtf420 owns production. A commit/build is not proof that a game is live. When a deliberate cutover changes ownership, route, architecture, or status, update the central v2 registry in the same work.

High-risk distinctions:
- Burn Buds → `protect-the-plants` production in `dtfgenetics/Thc`, not the Dtf420 migration copy.
- Seed Man → `seed-man-platformer`; Seed Ascent → separate `seed-ascent` game.
- Stoner Duck Race → active Dtf420 development until an explicit production-owner mapping is promoted.
