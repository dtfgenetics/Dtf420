---
name: dtf-game-dossier-resolver
description: Resolve exact canonical and Dtf420 subsystem paths for a game after ownership is known. Use for rules, UI/rendering, data/content, assets, tests, scripts, network/server, docs, workflows, package snapshots, and publication state.
metadata:
  author: dtfgenetics
  version: "1.0.0"
---

# DTF420 Game Dossier Resolver

After `dtf-game-location-resolver`, read the canonical portfolio dossier:

`dtfgenetics/Thc/data/game-dossier-registry.json`

The dossier maps each game to:
- canonical source roots;
- rules/simulation files;
- UI/rendering files;
- data/content files;
- runtime assets;
- tests and verification scripts;
- multiplayer/server/API files;
- documentation/source-of-truth;
- game-specific workflows;
- package snapshots;
- public-navigation/publication state;
- Dtf420 migration/prototype locations;
- recommended specialized skills.

## Dtf420 rule

When the dossier says the production owner is another repository, do not silently fix only the Dtf420 copy and call the live game repaired. Either:
1. repair canonical production source; or
2. explicitly perform a migration/cutover and update both registries.

When the task is specifically Dtf420 migration work, use the dossier's `development` / `primaryDevelopment` paths.

## Keep memory current

If you discover an important file or subsystem missing from the dossier, update the canonical Thc dossier registry during the same project pass or open a synchronization PR. Do not leave newly discovered project structure only in chat memory.
