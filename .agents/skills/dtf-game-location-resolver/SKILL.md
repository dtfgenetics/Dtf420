---
name: dtf-game-location-resolver
description: Resolve the production owner and all known DTF420 migration/prototype locations for a game before editing it. Use for every game task in Dtf420.
metadata:
  author: dtfgenetics
  version: "1.0.0"
---

# DTF420 Game Location Resolver

Dtf420 is a migration/unified-app repository. A same-named game here is not automatically the production source.

## Canonical cross-repo memory

For live-production ownership, read:

`dtfgenetics/Thc/data/game-location-registry.json`

Use the GitHub connector when working from Dtf420. The registry contains canonical IDs, aliases, public routes, production repositories/source paths, integration/runtime paths, Drive asset pointers, and known Dtf420 development copies.

Then read local:
- `lib/game-runtime-registry.ts`
- `lib/game-catalog.ts`
- the specific local source path

## Resolution rule

1. Normalize the game name through the canonical Thc registry alias map.
2. If the request is a live fix, edit the registry's production owner unless the task explicitly performs a cutover.
3. If the request is a Dtf420 migration/improvement, work in the local runtime but preserve the recorded production owner until release ownership changes.
4. Never treat a prototype as canonical solely because it is easier to edit.
5. When the local implementation becomes production, update both the Thc location registry and Dtf420 runtime registry in the same cutover work.

## Known high-risk duplicates

- Burn Buds: Dtf420 `game/burn-buds` is not the current production implementation; current production is Thc `games/protect-the-plants` + `site/public-route-patch/games/protect-the-plants`.
- Seed Man: Dtf420 `public/seed-ascent` is an alternative migration runtime; current production Seed Man remains Thc `games/seed-man-platformer`.
- Weedopolis, Who Took It?, PhenoQuest, THC RPG and other standalone-repo games retain their recorded external canonical owners until an explicit cutover.
- Stoner Duck Race currently lives only as active Dtf420 development under `game/stoner-duck-race`, `components/game/StonerDuckRaceGame.tsx`, and `services/stoner-duck-race-server`.

## Before editing

Know:
- canonical portfolio ID;
- production owner;
- local Dtf420 path;
- public route;
- whether this is production, migration, prototype, mirror, or archived code;
- relevant asset and deployment owner.

If those facts conflict, reconcile them before writing code.
