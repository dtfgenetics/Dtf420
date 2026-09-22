# DTF game platform foundation

This document defines the shared engineering boundary for browser games in DTF420.

## Goal

Keep each game's best-fit runtime while standardizing the contracts around it. A game may be React, Phaser, Canvas 2D, Three.js, or an iframe-hosted legacy bundle. It still needs one registered route, explicit capabilities, deterministic rules where applicable, validated persistence, and release checks.

## Source of truth

`lib/game-runtime-registry.ts` is the runtime source of truth.

`lib/game-catalog.ts` remains the player-facing catalog. The registry verifier requires both sources to describe the same set of slugs and release states.

The registry owns runtime facts:

- route
- host type
- engine type
- orientation
- input methods
- save/replay/multiplayer capabilities
- persistence version
- multiplayer authority/protocol
- iframe runtime entrypoint
- compatibility aliases

## Runtime families

### React-native games

Use React for text-heavy, turn-based, trivia, card, and party interfaces when a canvas does not improve the experience.

Current examples:

- Bud or Bluff
- High IQ
- Grower Conversations
- Who Took It
- Strain Showdown

Game rules should move out of React components into deterministic domain modules. React renders snapshots and dispatches actions.

### Phaser games

Use Phaser for real-time 2D playfields, animated boards, camera motion, particles, audio, and continuous controls.

Current example:

- Stoner Duck Race

Keep simulation/rules outside Phaser scenes. Scenes translate input into actions and render simulation state.

### Canvas 2D games

Existing custom Canvas runtimes may remain while they are progressively separated into simulation, input, rendering, audio, and persistence modules.

Current example:

- Seed Ascent

Do not rewrite a working Canvas game solely to make the technology uniform.

### Three.js games

Use Three.js only when the game genuinely needs a 3D world.

Current example:

- PhenoQuest

Keep game rules and saves independent from renderer objects.

### Iframe-hosted runtimes

Legacy or separately packaged games may remain iframe-hosted while they are migrated behind a common host protocol.

Current examples:

- Weedopolis
- Seed Ascent
- THC RPG
- PhenoQuest

The long-term host protocol should support ready/pause/resume/mute/restart/save/error/performance messages with strict origin validation.

## Determinism

Gameplay randomness must come from a seeded deterministic source when the result can affect:

- movement
- cards/decks
- AI choices
- item drops
- combat
- scoring
- multiplayer state
- replay output

Cosmetic randomness may use an isolated stream, but it must never perturb gameplay randomness.

`game/core/random/DeterministicRng.ts` is the shared deterministic RNG implementation. Its core sequence is compatibility-sensitive because existing Stoner Duck Race seeds depend on it.

## Two game cores

Do not force every game into one state model.

### Turn/action games

Canonical form:

```text
State + Action + RNG -> Next State + Domain Events
```

State must be serializable. Renderers never own canonical rules.

### Real-time games

Canonical form:

```text
Input -> fixed simulation tick -> state/events -> presentation
```

Simulation state and presentation state are separate. Networked games remain server-authoritative.

## Persistence

Every persistent runtime declares a save version. New schemas should migrate old saves instead of silently discarding them.

Small preferences/progression may use localStorage. Larger saves, replay libraries, user-generated content, or offline data should move to IndexedDB or server persistence when required.

## Multiplayer

Clients submit intent, not authoritative outcomes.

Servers validate identity, phase, legal actions, sequence/revision, and limits before mutating match state.

Stoner Duck Race remains the reference architecture for deterministic server-authoritative real-time simulation. The next networking phase is to evaluate migration from manual input messages and `setSimulationInterval()` toward Colyseus 0.18 fixed timestep input/prediction APIs without changing gameplay results.

## Verification

Static source-presence checks are useful guardrails but are not sufficient proof of behavior.

The verification stack should progressively include:

1. registry/route/entrypoint contracts;
2. deterministic core compatibility tests;
3. domain invariant tests;
4. replay equivalence tests;
5. save/load migration tests;
6. multiplayer room tests;
7. load tests for high-player-count games;
8. lint, typecheck, build, and deployed route verification.

## Current known registry warning

Burn Buds currently advertises a canonical multiplayer target at `/games/protect-the-plants`, but that target route is not present in the Dtf420 integration repository. The registry intentionally reports this as a warning so the mismatch is visible while the platform foundation lands. It must be reconciled before Burn Buds is considered release-ready.

## Next implementation sequence

1. Land the runtime registry and deterministic RNG foundation.
2. Reconcile Burn Buds route/catalog/runtime ownership.
3. Add shared input/action contracts.
4. Extract deterministic turn engines from large React components.
5. Separate Seed Ascent gameplay RNG from cosmetic RNG and extract its simulation.
6. Add replay/action-log contracts to turn-based games.
7. Upgrade Duck Race networking against the Colyseus 0.18 fixed-timestep/prediction stack.
8. Add behavior/property tests for board/card/trivia engines.
9. Introduce the shared GameHost/iframe messaging contract.
10. Consolidate production assets and remove unnecessary runtime CDN dependencies.
