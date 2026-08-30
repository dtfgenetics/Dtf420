---
name: dtf-game-ui-mobile
description: >
  Design and repair responsive game UI for DTF420 browser games. Use for HUDs, menus, touch controls, mobile layouts, overlays, dialogs, lobby screens, accessibility, canvas sizing, safe areas, or playfield obstruction problems.
---

# DTF Game UI and Mobile

The playfield must remain the visual priority. UI should explain and control the game without covering it.

## Ownership

- Phaser/canvas owns the game world and motion.
- React/DOM owns text-heavy HUD, menus, lobby controls, settings, dialogs, instructions, and accessible controls unless there is a strong reason otherwise.
- Keep one explicit state bridge between UI and gameplay.

## Responsive workflow

1. Identify the smallest supported viewport and the intended desktop layout.
2. Define which UI is persistent, contextual, collapsible, or modal.
3. Reserve safe areas before sizing the playfield.
4. Test portrait and landscape behavior where relevant.
5. Verify touch targets, scrolling, keyboard focus, and pointer behavior.
6. Confirm opening a menu cannot accidentally trigger the playfield beneath it.

## Mobile rules

- No horizontal page scrolling caused by the game shell.
- Primary controls must be reachable without precision tapping.
- Do not depend on hover for required information.
- Keep important board/card labels legible at normal phone zoom.
- Prefer collapsible secondary panels over permanently shrinking the playfield.
- Respect device safe areas for fixed controls.
- Avoid fixed pixel layouts that only work at one screenshot size.

## HUD rules

- Surface only information needed for the current decision.
- Turn state, selected object, legal actions, score/resources, and error feedback must be visually distinct.
- Disable or clearly mark unavailable actions rather than letting them fail silently.
- Confirmation dialogs are appropriate for destructive/reset actions, not ordinary turns.
- Instructions should be dismissible once the player understands the game.

## Accessibility and input

- Preserve keyboard focus for DOM controls.
- Provide visible focus states.
- Use semantic buttons for interactive DOM elements.
- Do not rely on color alone for hit/miss, legal/illegal, selected/unselected, or turn ownership.
- Respect reduced-motion preferences for nonessential UI motion where practical.

## Common failures

- Canvas overlaps navigation -> inspect container sizing, stacking context, and route shell layout.
- HUD blocks board on mobile -> collapse/reflow secondary information and resize the playfield around reserved UI.
- Touch causes double actions -> add action locking/debouncing at the input boundary.
- Modal opens but game still reacts -> suspend or gate playfield input while modal state is active.
- Text is crisp in DOM but blurry in canvas -> move text-heavy UI out of the canvas or render at appropriate resolution.

## Completion gate

Verify at representative desktop, tablet, and phone widths. A route is not release-ready if the game is technically functional but the board, controls, or required information are clipped, obscured, or too small to use.
