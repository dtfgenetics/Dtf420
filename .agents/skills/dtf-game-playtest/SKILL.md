---
name: dtf-game-playtest
description: >
  Test DTF420 browser games from a player's perspective and turn failures into actionable fixes. Use for smoke tests, gameplay QA, screenshot review, mobile checks, canvas/WebGL defects, broken controls, visual regressions, route verification, or pre-release game audits.
---

# DTF Game Playtest

A build passing TypeScript is not proof that a game works. Test the rendered game and its actual interaction flow.

## Test order

1. Open the intended route directly, including a hard refresh.
2. Confirm the first actionable screen appears with no fatal console errors.
3. Exercise the primary game verbs.
4. Exercise turn/phase transitions and visible feedback.
5. Test reset/new-game and navigation away/back.
6. Test representative desktop and mobile viewports.
7. For multiplayer, use two independent sessions and follow `dtf-multiplayer-lobbies`.
8. Capture visual evidence when browser automation or screenshots are available.

## What to inspect

### Boot and assets

- route resolves
- no blank canvas
- required fonts/images/audio load
- no 404 asset requests
- loading state does not hang
- approved visuals appear instead of placeholders

### Gameplay

- legal actions work
- illegal actions are blocked or explained
- input cannot fire twice accidentally
- state changes match the visible animation
- turn ownership is obvious
- game-over and restart paths work

### Visual QA

- sprites/tokens/cards align correctly
- board labels remain readable
- HUD does not cover important playfield areas
- animation communicates actions without hiding information
- no clipping, z-index mistakes, stretching, or unexpected scrollbars

### Mobile

- touch targets work
- board/playfield fits or intentionally pans/zooms
- dialogs and menus remain dismissible
- portrait/landscape behavior is sane where relevant
- browser chrome/safe areas do not hide required controls

### Lifecycle

- revisiting the route does not create duplicate Phaser instances
- event listeners/timers do not multiply after restart
- pause/modal state does not leak input into gameplay
- refresh behavior is defined

## Findings format

Report defects in severity order. Each finding should include:

- what the player sees
- exact reproduction steps
- expected behavior
- likely owning subsystem/file when known
- whether it blocks release

Do not hide a visible defect because the underlying code looks reasonable.

## Release gate

A game is not ready merely because it builds. It must boot, accept its primary inputs, complete its main loop, survive restart/resize, show the intended assets, and remain usable on a phone-sized viewport. Multiplayer games must additionally remain synchronized across independent sessions.
