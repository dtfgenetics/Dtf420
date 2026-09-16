# DTF Games portfolio audit — 2026-09-16

## Purpose

This is the working release audit for the DTF browser-game portfolio. It exists to stop game work from being split between stale site copies, standalone repositories, embedded runtimes, and live routes without a single verified ownership map.

The release target is not merely “route loads.” Every public game must have a coherent visual identity, obvious player actions, responsive controls, reliable asset loading, and a verified main loop on phone and desktop.

## Confirmed live hub state

The public `/games/` hub currently presents:

- 25 playable browser games
- 4 multiplayer tables
- 2 development projects

Prominent public routes include High IQ, High Land, Seed Man, THC Weekly Crossword, Who Took It?, Grower Conversations, Terpocalypse, High Life, Weedopolis, Strain Showdown, PhenoQuest, Bud or Bluff, Burn Buds, THC U Know, and Kush Kings Chess, plus the newer quick-play slate.

## Confirmed repository drift

`dtfgenetics/Dtf420` is the canonical site integration repository, but the current `lib/game-catalog.ts` still describes an older 11-entry catalog and does not match the larger live hub.

This is a release risk: a future site deployment that treats the old catalog as authoritative can regress discovery, release-state labels, or game count.

Standalone repositories also remain active sources for some runtimes and assets. Confirmed examples include:

- `dtfgenetics/Weedopolis-strain-Edition`
- `dtfgenetics/thc-u-know-card-game-`
- `dtfgenetics/Thc-crossword-`
- `dtfgenetics/Thc-chess-git`
- `dtfgenetics/Terpocalapse`
- `dtfgenetics/Thc-guess-who`
- `dtfgenetics/Thc-rpg`
- `dtfgenetics/Catching-phenos`
- `dtfgenetics/GANJUMANJI-The-Lost-Grower-s-Temple`

Most of these standalone repositories are not currently GitHub code-search indexed, so audits must not depend on global code search alone. Inspect their trees/files directly when a game is being changed.

## Immediate portfolio blockers

### P0 — source-of-truth and deployment consistency

1. Reconcile the live 25-game hub against `lib/game-catalog.ts` and any static-overlay/deployment source that currently generates `/games/`.
2. For every live route, record:
   - public URL
   - owning repository
   - owning source directory/file
   - asset repository/source
   - multiplayer/backend dependency if any
   - release status
   - verification script
3. Do not delete standalone repositories merely because a copy exists in Dtf420. First determine which one owns gameplay, art, data, and deployed assets.
4. Stop public UI from exposing internal build labels, repository terminology, asset-version labels, “prototype record” language, or implementation notes unless the route is intentionally a developer preview.

### P0 — visual release failures

The following patterns block a polished release even if gameplay works:

- blank or mostly empty first screen while JavaScript initializes
- placeholder panels or sparse browser-default controls
- implementation/debug copy visible to players
- HUDs that resemble admin dashboards rather than the game world
- tiny board/card text on mobile
- desktop side rails permanently shrinking the playfield on phones
- selected/legal/illegal states distinguished only by subtle color
- low-quality or inconsistent art styles inside one title
- approved assets existing in a repo but not being used by the live runtime
- image stretching, clipping, wrong aspect ratios, or raster artwork rendered above its useful resolution
- game actions that update a log without immediate visual feedback in the playfield

### P0 — interaction release failures

- duplicate actions from touch/click handling
- modal or menu opens while the game continues accepting input underneath
- restart creates duplicate event listeners, timers, Phaser instances, WebGL canvases, or audio
- required controls depend on hover
- no useful loading/error recovery state
- multiplayer state is not obvious or not synchronized between two sessions
- navigation away/back leaves a broken runtime

## Live-route findings sampled in this audit

### Weedopolis

Status: playable, but still carries production-polish debt.

Observed issues:

- The live text surface exposes internal V1/master-art terminology.
- The Dtf420 embed pins runtime CSS/JS and board assets to a specific commit in `Weedopolis-strain-Edition`, increasing the chance of visual drift between the standalone repo and site shell.
- The game has a sound structural concept: board-centered play stage, turn rail, property management, log, and a mobile dock. The next visual pass should preserve that architecture but make the active decision state dominate over passive panels.

Action already pushed in this audit:

- Reworded player-facing board loading/success/failure states to remove internal V1/approved-asset terminology.
- Replaced the visible “Gameplay data active” implementation chip with a player-facing “Ready” state.

Next Weedopolis pass:

- audit the pinned CSS at 360/390/768/1366 widths
- verify mobile dock hit targets and safe-area padding
- collapse passive Players/Log content behind drawers on small screens
- make Roll / Buy / Auction / End Turn the strongest visual actions for the current phase
- animate token movement and property acquisition without blocking input
- provide a compact turn transition that makes the next player unmistakable

### Seed Man

Status: major gameplay content is publicly described as a 20-level, 5-world campaign with Fire, Electric, and Ice phenotype combat.

Next pass:

- compare actual world visuals against the promised five distinct worlds
- verify every level uses the approved Seed Man character treatment rather than temporary geometry or mismatched art
- make damage, invulnerability, power pickup duration, boss phases, checkpoints, death, and level completion visually unambiguous
- keep touch controls below/around the playfield without covering threats
- add a compact controls/help drawer instead of permanent instructional text during play
- verify camera scaling and asset resolution at desktop and phone widths

### High Land

Status: public wrapper is extremely sparse before/without the JavaScript runtime.

Next pass:

- establish a branded loading/boot state that visually matches the board
- verify the continuous road/path remains the dominant visual element
- confirm tokens sit on spaces, movement count matches game state, and forward/back card effects animate clearly
- make current player, roll result, destination, special-space outcome, and next action visually obvious
- verify the board remains legible and navigable on phone rather than simply shrinking the full desktop board

### Strain Showdown

Status: playable prototype, but developer/prototype language is still highly visible on the public route.

Observed issues:

- “prototype,” “rules lab,” and unfinished-effect language is presented as part of the player experience
- the route currently emphasizes system explanation over card spectacle and battle readability

Next pass:

- separate development notes from player-facing UI
- give cards clear stage/family/stat hierarchy and high-resolution family-specific visual treatment
- make legal lanes, Focus cost, target selection, attack resolution, damage, defeat, and evolution visually explicit
- move long How-to-Play content into a modal/drawer
- retain battle feed as secondary evidence, not primary action feedback

### Burn Buds

Status: live multiplayer route exists and the hub describes a 15×15 two-player game with room recovery and chat.

Next pass:

- verify placement mode, targeting mode, hit, miss, completed formation, active turn, waiting state, reconnect, rematch, and opponent disconnect all have distinct visual states
- prioritize the two grids and current action; chat should not crowd the battlefield on a phone
- verify each cell remains tappable without precision errors
- add stronger target hover/focus/touch preview and confirmation feedback without requiring color alone

### High IQ

Status: strongest information architecture sampled in this pass.

Strengths to reuse elsewhere:

- clear challenge builder
- visible keyboard shortcuts
- progress/score/streak/accuracy separated from question content
- explanation and verification are intentionally secondary to answering

Next pass:

- visually reduce the amount of introductory text before first play on returning visits
- make answer-state transitions more game-like while preserving educational clarity
- ensure verified/source UI remains collapsed until requested
- maintain readable answer targets and keyboard/touch parity

## Portfolio visual system to standardize

All DTF games should share release conventions without looking like the same reskinned dashboard:

- consistent game-route top bar: back to Games, game identity, sound/settings, optional fullscreen
- consistent loading/error/retry behavior
- consistent pause/settings drawer behavior
- consistent focus ring and keyboard semantics for DOM controls
- shared safe-area and mobile-control tokens
- shared result/restart/rematch pattern
- shared reduced-motion handling
- shared asset-error logging for QA, but never exposed as technical language to players

The art direction, playfield, HUD shape, type treatment, motion language, and interaction feedback should remain title-specific.

## Measurable release gates

Use `docs/mobile-ui-standard.md` plus the game-specific skills in `.agents/skills/`.

For every public game:

- route hard-refresh works
- first actionable state is visible and understandable
- primary loop can be completed
- restart/new game works cleanly
- 360×800, 390×844, 768×1024, and 1366×768 layouts are usable
- no horizontal document overflow unless the playfield intentionally owns a controlled pan surface
- primary touch controls are approximately 44×44 CSS px or larger where practical
- keyboard focus is visible for DOM controls
- required game state is not color-only or sound-only
- reduced motion is respected for nonessential effects
- accepted input produces immediate visible feedback
- target INP is <= 200 ms at the 75th percentile on mobile and desktop
- no missing required art/audio/font requests
- no low-quality placeholder visuals on a route labeled playable
- no internal implementation language on a route labeled playable

## Fix order

1. Reconcile live hub/catalog/deployment ownership.
2. Seed Man visual/gameplay completion pass.
3. High Land board/readability/movement pass.
4. Weedopolis active-turn/mobile-board polish.
5. Burn Buds multiplayer battlefield/mobile pass.
6. Strain Showdown card/battle presentation pass.
7. Who Took It visual asset integration and case-board hierarchy.
8. High IQ motion/presentation polish without harming learning clarity.
9. THC U Know / Kush Kings Chess multiplayer consistency pass.
10. Crossword, Terpocalypse, High Life, PhenoQuest and newer quick-play slate.
11. Only after the existing playable slate clears the release gate: promote additional standalone repository games.

## Research basis

- web.dev INP: https://web.dev/articles/inp
- web.dev Optimize INP: https://web.dev/articles/optimize-inp
- Game Accessibility Guidelines — Basic: https://gameaccessibilityguidelines.com/basic/
- Game Accessibility Guidelines — Full list: https://gameaccessibilityguidelines.com/full-list/

These standards are used as implementation guidance, not as a substitute for actual rendered playtesting.
