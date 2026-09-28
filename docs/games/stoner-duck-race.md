# Quack & Bake: Stoner Duck Race — Game Contract

Status: active development  
Canonical repository: `dtfgenetics/Dtf420`  
Current game modules: `game/stoner-duck-race/`  
Current app route: `app/games/stoner-duck-race/`

## Product identity

Quack & Bake is a browser duck-racing game built around readable chaos, deterministic race simulation, multiple play modes, track hazards, powerups, AI racers, progression, replay, and optional authoritative online rooms.

The player fantasy is to pick a distinctive duck, survive unpredictable cannabis-themed waterways, use steering/boost/powerups at the right moment, and beat the field to the finish.

## Race modes

- **Derby** — mostly watch/party-race behavior; AI drives unclaimed ducks and human steering is disabled.
- **Rally** — active human steering with AI for unclaimed ducks.
- **Chaos** — active steering plus higher powerup frequency, stronger catch-up, and timed chaos events.

## Tracks

The current track system contains eight canonical track IDs:

1. Kush Creek
2. Munchie Marsh
3. Cloud 9 Canal
4. Dab Rapids
5. Trichome Trail
6. Greenhouse Run
7. Rosin River
8. Final Smokeout

Tracks define length, current zones, hazards, pickups, water/bank presentation, and lane forces.

## Core systems

- deterministic seeded race simulation
- up to the configured mass-race cap
- AI personalities and unclaimed-duck AI
- steering, boost, dive, and use-powerup actions
- hazards and current zones
- powerups including Munchie Rush, Dab Blast, Cloud Screen, Bubble Shield, Feather Boost, Snack Magnet, Mega Quack, and Super Duck
- three race-mode profiles
- rank/finish calculation
- local profile progression: races, wins, podiums, coins, best ranks and solo best times
- replay support
- character roster/assets
- track catalog
- Colyseus online room client
- room create/join
- host ownership
- spectators
- reconnect with bounded retries/message queue
- authoritative room snapshots

## Architecture

`simulation.ts` is the deterministic game simulation and must remain independent of Phaser/React presentation. Track content belongs in `tracks.ts`; mode tuning belongs in `modes.ts`; online room transport belongs in `network.ts`; persistent local progression belongs in `progression.ts`.

Online rooms use Colyseus. The server/room state is authoritative online; local race simulation remains deterministic and testable independently.

## Verification

Canonical Dtf420 checks:

```bash
npm run verify:stoner-duck-race
npm run typecheck
npm run build:static-overlay
npm run verify:static-overlay
```

## Definition of finished

The game is release-ready when all eight tracks and three modes complete reliably on desktop/mobile, online rooms can create/join/reconnect/spectate without state divergence, progression and replay survive expected browser lifecycle events, race feedback is visually clear, performance remains smooth at supported field sizes, and one explicit production owner/public route is registered and verified.

## Current next goal

Finish presentation/game-feel and multiplayer QA, define the final production owner and route, and then promote through the DTFSeeds release pipeline.
