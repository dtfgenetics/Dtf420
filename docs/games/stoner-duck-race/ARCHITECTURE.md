# Quack & Bake: Stoner Duck Race architecture

## Product goal

Build one extensible 2D arcade river-racing engine for the DTF Games hub. The same deterministic simulation supports:

- **Duck Derby** — AI/spectator-first party racing.
- **River Rally** — direct-control skill racing.
- **Chaos Derby** — Rally controls plus deterministic global chaos events.
- **Quack & Bake Cup** — four local championship races with cumulative points and persistent player progression.
- **Time Trial** — one controlled duck, deterministic course conditions, and persistent personal-best times per track.

The hard racer target remains **1–50 active ducks**. Spectators are separate from racer slots.

## Runtime boundaries

### `game/stoner-duck-race/`

Renderer-independent game rules plus a thin Phaser adapter.

- `types.ts` — shared launch, race, network, and result contracts.
- `config.ts` — racer limits, tick rate, and track-aware configuration.
- `rng.ts` — deterministic seeded random source.
- `modes.ts` — Derby, Rally, and Chaos rule profiles.
- `characters.ts` — eight cosmetic duck identities and presentation metadata.
- `tracks.ts` — eight data-driven courses, current zones, hazards, and item placement.
- `simulation.ts` — authoritative fixed-step movement, AI, hazards, power-ups, ranking, Chaos events, shields, and finish state.
- `network.ts` — Colyseus browser adapter for create/join/input/state/leave.
- `progression.ts` — optional local profile persistence for races, wins, podiums, best finishes, time-trial PBs, level, and Bud Bucks.
- `scenes/RaceScene.ts` — Phaser world renderer, camera, touch/keyboard input, and local/online state adapter.
- `main.ts` — Phaser bootstrap and race-result callback boundary.

The shared simulation does not depend on Phaser, React, DOM APIs, browser timing, canvas state, or network transport.

### `components/game/StonerDuckRaceGame.tsx`

The React/DOM shell owns text-heavy and responsive game setup:

- Local or Online source.
- Quick Race, four-race Cup, or Time Trial.
- Derby, Rally, or Chaos mode where applicable.
- Eight-track selection.
- 1–50 racer count.
- Seed and player name.
- Duck cosmetic selection.
- Create Room / Join Room / spectator intent.
- Shareable `?duckRoom=<room-id>` invite links that prefill the Join flow.
- Host start control and room population status.
- Persistent local profile summary and per-track Time Trial PBs.
- Post-race results and Cup continuation.

Keeping these controls outside Phaser prevents text/input accessibility from being coupled to canvas rendering.

### `services/stoner-duck-race-server/`

Standalone Colyseus service. `RaceRoom` imports the same deterministic simulation used for local play.

The server owns race truth. Clients only send control intent. Authoritative position, rank, item state, shields, finish state, track choice, room host, racer ownership, and race phase are synchronized from the room.

## Current content catalog

### Tracks

1. **Kush Creek** — balanced baseline river with marsh, spray, logs, reeds, and a whirlpool finish section.
2. **Munchie Marsh** — sticky mud and reed-heavy technical routing.
3. **Cloud 9 Canal** — higher turbulence, fans, spray, whiteout sections, and a waterfall finish.
4. **Dab Rapids** — aggressive high-speed current changes, falls, and offensive-item lines.
5. **Trichome Trail** — cleaner technical lanes that reward precise steering and item discipline.
6. **Greenhouse Run** — fan and irrigation hazards with narrow shifting current sections.
7. **Rosin River** — long technical water with barrels, falls, and heavy current changes.
8. **Final Smokeout** — the championship gauntlet combining the hardest hazard and current patterns.

Each course owns its length, colors, current zones, hazards, and pickup positions through `TrackDefinition`.

### Duck identities

Eight cosmetic identities are defined in `characters.ts`: Mellow Mallard, Dab Duck, Hippie Quacker, Grower Goose, Rosin Runner, Cloud Nine, Science Duck, and Old School Quack. Character selection never changes competitive physics or hidden stats.

### Power-ups

The deterministic item catalog contains:

- `munchie-rush`
- `dab-blast`
- `cloud-screen`
- `bubble-shield`
- `feather-boost`
- `snack-magnet`
- `mega-quack`
- `super-duck`

### Hazards

The reusable hazard catalog contains logs, mud, whirlpools, reeds, sprinklers, fans, barrels, and waterfalls.

## Simulation model

Each duck uses lightweight logical state rather than rigid-body multiplayer physics.

Primary coordinates:

- `progress` — normalized course completion from 0 to 1.
- `lateral` — river-relative position from -1 to +1.

Simulation runs at **20 authoritative ticks per second**. Rendering can run at display refresh rate. Large fields use soft-body separation instead of rigid-body duck pileups.

AI reads upcoming hazards and item lines, combines them with per-duck deterministic personality values, and decides steering, boost, dive, and item use without `Math.random()`.

## Determinism and replayability

All simulation randomness comes from `DeterministicRng` initialized with `RaceConfig.seed`.

The shared simulation must never call `Math.random()`.

A future replay record can be compact because race reconstruction is based on:

1. simulation/content version,
2. race seed,
3. mode and track,
4. racer configuration,
5. timestamped player inputs.

## Multiplayer lifecycle

The online room lifecycle is:

```text
Create room
  -> authoritative lobby
  -> first racer becomes host
  -> racers/spectators join by room ID or invite deep link
  -> host starts race
  -> 3-second simulation countdown
  -> server-authoritative race
  -> synchronized finish state
```

If a human racer disconnects, its duck returns to AI control. Spectators never consume racer slots. If the host leaves before start, host ownership migrates to another connected racer.

The browser only attempts Online play when a real `NEXT_PUBLIC_DUCK_RACE_SERVER_URL` is configured. The UI reports the unconfigured state instead of simulating fake connectivity.

Remaining network production enhancements after server deployment are reconnection UX, latency/interpolation tuning, and bandwidth/load profiling.

## Progression

Local player progression is optional and stored in browser local storage under a versioned key. It records races, wins, podiums, cosmetic currency, best rank per track, and Time Trial personal bests. Only true one-duck Time Trial runs update PB times.

Bud Bucks are cosmetic progression currency only. The game does not contain cash wagering or real-money race betting.

## Production asset boundary

The current renderer deliberately uses procedural duck/course presentation so game rules can be verified independently of final artwork. Production assets should land through stable manifest keys under:

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

Final duck sprite strips, course backgrounds/foregrounds, water animation, item icons, impact FX, title treatment, music, ambience, and SFX can replace procedural presentation without changing simulation state or multiplayer protocol.

## QA policy

Do **not** use Playwright for this game.

The repository protects this game with:

- deterministic/static game verification,
- TypeScript checks,
- lint,
- production Next.js build,
- static overlay export validation,
- isolated Colyseus server dependency install and server typecheck.

Future performance QA should add repeated seeded 50-racer headless simulations and server load/bandwidth profiling while preserving deterministic finishing order for identical inputs and seeds.
