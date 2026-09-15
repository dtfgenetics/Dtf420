# Quack & Bake: Stoner Duck Race architecture

## Product goal

Build one extensible 2D arcade river-racing engine for the DTF Games hub. The same deterministic simulation supports:

- **Duck Derby** — AI/spectator-first party racing.
- **River Rally** — direct-control skill racing.
- **Chaos Derby** — Rally controls plus deterministic global chaos events.
- **Quack & Bake Cup** — four local championship races with cumulative points and persistent player progression.
- **Time Trial** — one controlled duck, deterministic course conditions, and persistent personal-best times per track.

The hard racer target remains **1–50 active ducks**. Spectators and temporarily reconnecting players are tracked separately from active racer slots.

## Runtime boundaries

### `game/stoner-duck-race/`

Renderer-independent game rules plus a thin Phaser adapter.

- `types.ts` — shared launch, race, network, and result contracts.
- `config.ts` — racer limits, tick rate, and track-aware configuration.
- `rng.ts` — deterministic seeded random source.
- `modes.ts` — Derby, Rally, and Chaos rule profiles.
- `characters.ts` — eight cosmetic duck identities and presentation metadata.
- `assets.ts` — stable production texture/audio keys plus procedural-fallback paths and animation contracts.
- `tracks.ts` — eight data-driven courses, current zones, hazards, and item placement.
- `simulation.ts` — authoritative fixed-step movement, AI, hazards, power-ups, ranking, Chaos events, shields, and finish state.
- `network.ts` — Colyseus browser adapter for create/join/input/state/leave plus automatic reconnection tuning.
- `progression.ts` — optional local profile persistence for races, wins, podiums, best finishes, time-trial PBs, level, and Bud Bucks.
- `scenes/RaceScene.ts` — Phaser world renderer, authored-asset loader, procedural fallback renderer, camera, touch/keyboard input, and local/online state adapter.
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
- Local Pause / Resume.
- Client-side audio mute that does not alter authoritative online state.
- Persistent local profile summary and per-track Time Trial PBs.
- Post-race results and Cup continuation.

Keeping these controls outside Phaser prevents text/input accessibility from being coupled to canvas rendering.

### `services/stoner-duck-race-server/`

Standalone Colyseus service. `RaceRoom` imports the same deterministic simulation used for local play.

The server owns race truth. Clients only send control intent. Authoritative position, rank, item state, shields, finish state, track choice, room host, racer ownership, and race phase are synchronized from the room.

Production service behavior includes:

- Node 22+ runtime.
- TypeScript compilation to plain ESM JavaScript under `build/`.
- Plain-Node `npm start`; production does not depend on `tsx`.
- `/healthz` readiness endpoint.
- 20-second reconnect grace for racers and spectators.
- Temporary AI takeover while a racer is dropped.
- Same-session ownership restoration through `onReconnect`.
- Permanent release/host migration only after reconnection grace expires or the player intentionally leaves.

Deployment details live in `services/stoner-duck-race-server/DEPLOYMENT.md`.

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

The compiled server QA now runs every track twice with 50 AI racers under the same seed and requires exact finish-record equality. It also fails if any track cannot complete all 50 racers within the bounded simulation budget. This validates the mass-race target against executable production output instead of only checking source structure.

A future replay record can remain compact because race reconstruction is based on:

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
  -> temporary disconnect: seat retained + duck switches to AI
  -> reconnect inside grace window: same session regains duck
  -> permanent leave: seat released / host migrates if needed
  -> synchronized finish state
```

The browser SDK uses automatic reconnection with bounded retries and a small outgoing-message queue. During the server grace window, dropped racers are counted separately as reconnecting racers rather than active racers. Spectators never consume racer slots.

The browser only attempts Online play when a real `NEXT_PUBLIC_DUCK_RACE_SERVER_URL` is configured. The UI reports the unconfigured state instead of simulating fake connectivity.

Remaining network production work after server deployment is latency/interpolation tuning, bandwidth/load profiling, and live multi-device soak testing through the actual reverse proxy/WSS endpoint.

## Progression

Local player progression is optional and stored in browser local storage under a versioned key. It records races, wins, podiums, cosmetic currency, best rank per track, and Time Trial personal bests. Only true one-duck Time Trial runs update PB times.

Bud Bucks are cosmetic progression currency only. The game does not contain cash wagering or real-money race betting.

## Production asset boundary

`game/stoner-duck-race/assets.ts` is the runtime source of truth for authored presentation. Every production path is optional. Phaser loads a production file only when its manifest path is populated and keeps procedural rendering as a safety fallback when the path is `null` or the authored asset is not yet present.

Stable asset families include:

```text
duck:<character-id>
powerup:<powerup-id>
hazard:<hazard-id>
track:<track-id>:background
track:<track-id>:foreground
track:<track-id>:preview
audio:<audio-id>
```

Duck sprite sheets use a normalized 128×128 frame contract with idle, paddle, boost, hit, and win animation ranges. Exact frame order, file destinations, transparent-background requirements, track-strip rules, and audio keys are documented in `docs/games/stoner-duck-race/ASSET_PRODUCTION.md`.

The recommended public runtime domain is:

```text
public/games/stoner-duck-race/
  ducks/
  tracks/
  hazards/
  powerups/
  ui/
  fx/
  audio/
```

Final sprite strips, track backgrounds/foregrounds, water animation, item icons, impact FX, title treatment, music, ambience, and SFX can therefore replace the procedural presentation incrementally without changing simulation state or multiplayer protocol.

## QA policy

Do **not** use Playwright for this game.

The repository protects this game with:

- deterministic/static game verification,
- TypeScript checks,
- lint,
- production Next.js build,
- static overlay export validation,
- isolated Colyseus dependency install and strict server typecheck,
- production ESM server compilation,
- compiled-entry verification,
- deterministic executable smoke tests across **8 tracks × 50 racers × 2 identical seeded runs**.

Before public multiplayer launch, add live load/bandwidth profiling and multi-device WSS soak tests against the deployed endpoint while keeping deterministic simulation verification in CI.
