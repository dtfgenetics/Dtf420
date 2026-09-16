# Mobile UI standard

DTF Genetics treats mobile as a first-class product surface rather than a compressed desktop layout.

## Release requirements

- Primary navigation must not wrap into multiple desktop-style rows on small screens.
- Interactive controls should provide a practical touch target of at least 44 by 44 CSS pixels where layout permits, with enough separation to avoid accidental adjacent taps.
- Pages must not introduce horizontal document overflow at supported mobile viewports.
- Primary calls to action must remain readable, reachable, and visually distinct without hover.
- Dense desktop grids must collapse intentionally instead of shrinking content below readable sizes.
- Images and game canvases must remain contained within the viewport.
- Literal internal links must resolve to an application route, configured redirect, or public asset.
- Desktop and mobile Browser QA must pass before production cutover.

## Browser-game release requirements

These requirements apply to every public game route in addition to the general mobile rules above.

- The playfield is the visual priority. Persistent HUD, navigation, chat, logs, and instructions must not cover required gameplay.
- Reserve device safe areas for fixed controls with `env(safe-area-inset-*)` where relevant.
- Support pointer/touch and keyboard for core actions when the game mechanic permits it. Menus must remain usable with the same input methods supported by gameplay.
- Do not make hover the only way to discover a required action or state.
- Do not convey turn ownership, hit/miss, legal/illegal, selected/unselected, damage, or other required state through color alone.
- Give every accepted interaction immediate visible feedback. For public routes, target an Interaction to Next Paint (INP) of 200 ms or less at the 75th percentile on both mobile and desktop.
- Avoid duplicate input at the boundary: one tap, click, key press, or pointer action must not trigger the same game action twice.
- When dialogs, menus, or pause overlays are active, gameplay input behind them must be gated or suspended.
- Respect `prefers-reduced-motion` for nonessential camera shake, parallax, flashing, decorative transitions, and UI animation.
- Essential information communicated by sound must also have a visual equivalent. Music, effects, and speech should have separate mute/volume controls when those channels exist.
- Loading must have an explicit state and must fail into a useful recovery message instead of a blank canvas or permanently frozen spinner.
- A restart/new-game path must reset timers, listeners, animation loops, and engine instances instead of stacking duplicate runtimes.
- Mobile controls must remain reachable without precision tapping and must not collide with browser chrome or device safe areas.
- Board and card games may intentionally pan/zoom on small screens, but required labels and legal actions must remain readable and reachable at normal browser zoom.

## Game visual hierarchy

Every game should make these states visually obvious without forcing the player to read a log:

1. What the player can do now
2. Whose turn / phase / objective is active
3. Which object, card, lane, tile, or target is selected
4. Which actions are legal, unavailable, successful, or failed
5. Score, health, resources, progress, or remaining objectives
6. Result state and the next action after a round, level, or match ends

Secondary information such as history, detailed rules, collection data, and long-form help should collapse, open in a modal/drawer, or move to a secondary screen instead of permanently shrinking the playfield.

## Priority order on small screens

1. Brand and navigation
2. Page identity and primary action
3. Search/discovery where applicable
4. Primary genetics, learning, diagnostic, tool, or game content
5. Supporting references and secondary destinations
6. Community/editorial material
7. Footer navigation

The mobile experience may progressively disclose secondary navigation and dense supporting content rather than displaying every desktop element simultaneously.

## Verification matrix for games

Before a game is called release-ready, verify at minimum:

- 360 × 800 portrait phone
- 390 × 844 portrait phone
- 844 × 390 landscape phone where landscape play is supported
- 768 × 1024 tablet
- 1366 × 768 desktop
- keyboard-only navigation for DOM controls
- pointer/mouse interaction
- touch/pointer interaction
- reduced-motion preference
- route hard refresh, restart/new game, navigation away/back, and resize/orientation change

A build is not release-ready if the game technically runs but required controls are clipped, obstructed, too small, visually ambiguous, or slow enough that players can reasonably interpret an accepted action as ignored.

## Research basis

The game-specific requirements above incorporate current browser responsiveness guidance and established game-accessibility practices, including:

- web.dev Interaction to Next Paint guidance: https://web.dev/articles/inp
- web.dev INP optimization guidance: https://web.dev/articles/optimize-inp
- Game Accessibility Guidelines basic checklist: https://gameaccessibilityguidelines.com/basic/
- Game Accessibility Guidelines full checklist: https://gameaccessibilityguidelines.com/full-list/
