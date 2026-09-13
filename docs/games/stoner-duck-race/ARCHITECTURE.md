# Stoner Duck Race architecture

## Goal

Build one extensible river-racing engine that supports three rulesets without forking the game code:

- **Duck Derby** — AI/spectator-first party racing, up to 50 racers.
- **River Rally** — direct-control arcade racing using the same race simulation.
- **Chaos Derby** — the shared simulation with high-frequency global events and stronger comeback pressure.

The architectural hard target is **50 active racers**. Spectators are separate from racer slots.

## Runtime boundaries

### `game/stoner-duck-race/`

Renderer-independent gameplay plus the Phaser adapter used by the DTF site.

- `types.ts` — network-safe game contracts.
- `config.ts` — racer limits, tick rate, default track configuration.
- `rng.ts` — deterministic seeded PRNG used by simulation logic.
- `modes.ts` — Derby, Rally, and Chaos rule profiles.
- `simulation.ts` — authoritative race state and fixed-step rules.
- `scenes/RaceScene.ts` — Phaser presentation/input adapter only.
- `main.ts` — Phaser bootstrap.

The simulation must never depend on Phaser, React, DOM APIs, browser timing, or canvas state.

### `components/game/`

React client boundary used by Next.js. Phaser is dynamically loaded with SSR disabled and destroyed when the route unmounts.

### `app/games/stoner-duck-race/`

DTF site route and development-facing shell.

### `services/stoner-duck-race-server/`

Colyseus authoritative multiplayer service. It imports the same shared simulation used by the local prototype.

The room owns race truth. Clients send intent/input; they do not submit authoritative position, rank, progress, or finish state.

## Simulation model

Each duck is represented by lightweight logical state rather than a rigid-body physics object.

Primary coordinates:

- `progress` — normalized course completion from 0 to 1.
- `lateral` — river-relative horizontal position from -1 to +1.

This gives deterministic ranking and allows future curved rivers, forks, shortcuts, current zones, and waterfalls without ranking racers from screen coordinates.

The current prototype runs at **20 simulation ticks per second**. Phaser may render more frequently and interpolated multiplayer clients may render at 60 FPS.

## 50-player rules

`DUCK_RACE_LIMITS.massRaceMax` is the canonical racer cap and is set to 50.

Large races use soft-body separation rather than full rigid-body duck-on-duck physics. Explicit hazards and future powerup effects may remain authoritative, while cosmetic wake, particles, camera effects, and animation are client-side.

This avoids 50-body pileups and keeps network state compact.

## Determinism

Simulation randomness comes only from `DeterministicRng` initialized by `RaceConfig.seed`.

Do not call `Math.random()` from the shared simulation.

A production replay record should eventually require only:

1. race seed,
2. track/version,
3. racer configuration,
4. timestamped inputs,
5. externally-authored race events if any.

This enables exact bug reproduction, daily seeds, ghost races, server verification, and compact replays.

## Multiplayer

The Colyseus room is prepared for:

- up to 50 racer slots,
- additional spectators,
- server-authoritative fixed-step simulation,
- input messages only,
- schema-based state synchronization,
- automatic AI takeover when a racer disconnects.

Production networking work still needs interpolation, client prediction for River Rally, reconnection UX, room-code matchmaking, bandwidth profiling, and deployment infrastructure.

## Content expansion

Tracks, duck characters, cosmetics, hazards, and powerups should be data-driven content packages. Avoid adding new tracks or ducks by editing `RaceScene`.

Planned track package shape:

```text
content/tracks/kush-creek/
  track.json
  river.json
  currents.json
  hazards.json
  pickups.json
  shortcuts.json
  checkpoints.json
  preview.webp
```

Planned production asset domains:

```text
assets/stoner-duck-race/
  ducks/
  tracks/
  hazards/
  powerups/
  ui/
  fx/
  audio/
```

## QA policy

Do not use Playwright for this game. Prefer deterministic Node-based tests, static route/package validation, TypeScript checks, production builds, and seeded headless simulation tests.

The first performance target is not merely visual FPS; verification must eventually simulate repeated 50-racer races headlessly and confirm deterministic finishing order from identical seeds and inputs.
