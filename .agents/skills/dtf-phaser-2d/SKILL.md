---
name: dtf-phaser-2d
description: >
  Build and repair Phaser 4 browser-game runtime code in DTF420. Use for scenes, board rendering, sprites, animation, cameras, input, timers, turn visualization, canvas sizing, or Phaser-to-React integration.
---

# DTF Phaser 2D

Target the Phaser version already pinned by the repository. Inspect `package.json` before using version-sensitive APIs.

## Architecture

- Game rules and serializable state must live outside Phaser scene objects.
- Phaser owns rendering, camera behavior, sprite animation, particles, tweens, audio playback, and input plumbing.
- Scenes should translate player input into game actions and render the resulting state.
- Keep renderer objects disposable; never make a sprite or scene the canonical source of game rules.
- Prefer stable asset keys and a central preload/manifest boundary instead of hard-coded paths spread through gameplay code.

## Scene pattern

Prefer a small scene graph:

1. Boot/preload scene for asset loading and validation.
2. Main gameplay scene for playfield rendering and interaction.
3. Optional overlay/debug scene only when it materially simplifies state inspection.

Do not create extra scenes simply to hold ordinary UI that belongs in React/DOM.

## Rendering rules

- Define board/grid geometry from data, not repeated pixel constants.
- Keep camera logic independent of rules and turn resolution.
- Use depth/layer ordering explicitly for board, pieces, effects, and interaction hints.
- Animation must communicate state changes; it must not determine whether the state change happened.
- Use tweens for movement and feedback but commit gameplay state before or independently from animation completion.
- On resize, recompute viewport-facing layout without mutating persistent game state.

## Input

- Map pointer, touch, and keyboard to named actions where possible.
- Prevent duplicate turn actions from double taps, key repeat, or rapid pointer events.
- Disable interaction during authoritative transitions when another action would corrupt state.
- Touch targets must remain usable on phone-sized screens.

## React integration

- React/DOM owns text-heavy HUD, menus, settings, lobby controls, dialogs, and accessible controls.
- Phaser owns the playfield.
- Use an explicit bridge for state/events. Avoid mutable globals shared unpredictably between React and Phaser.
- Clean up Phaser instances, event listeners, timers, and observers when the owning React component unmounts.

## Failure patterns

- Blank canvas -> check parent mount timing, container dimensions, renderer creation, scene registration, and asset preload failures.
- Game works once then duplicates -> check React remounts and Phaser instance cleanup.
- Pieces move visually but rules desync -> rules are probably stored in scene/sprite state instead of the simulation model.
- Mobile board is clipped -> use responsive scale/camera policy and inspect DOM container overflow.
- Assets load locally but not live -> hand off to `dtf-game-assets` and `dtf-game-deploy` for public-path and case-sensitivity checks.

## Verification

After changes, exercise boot, resize, primary interaction, reset/new-game flow, and scene teardown. Then use `dtf-game-playtest` for player-facing QA.
