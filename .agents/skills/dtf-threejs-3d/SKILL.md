---
name: dtf-threejs-3d
description: >
  Build, repair, optimize, and verify interactive 3D browser-game surfaces for DTF projects using Three.js or React Three Fiber. Use for 3D boards, pieces, environments, camera controls, GLB/glTF assets, picking, animation, mobile WebGL performance, 3D multiplayer presentation, and 2D fallback behavior.
---

# DTF Three.js / React Three Fiber 3D Games

Use this skill when the game requires a real WebGL playfield or 3D presentation. Compose it with `dtf-game-router` and the rules, multiplayer, mobile UI, asset, playtest, and deployment skills as needed.

## First principle

The 3D renderer is presentation, not authority.

Keep canonical gameplay state serializable and independent from Three.js objects, meshes, React refs, cameras, animation mixers, and scene graph state. Render from canonical state and send validated player actions back to the rules/network layer.

For multiplayer games, the server or authoritative game engine decides whether an action is legal. Never trust a client-submitted final board position merely because the 3D scene can display it.

## Stack selection

Prefer:

- React Three Fiber when the existing game is React/Next.js and scene state naturally follows React state.
- Plain Three.js when the game already uses an imperative runtime or needs tight low-level scene control.
- Phaser for primarily 2D games; do not add Three.js merely for decorative depth.

Preserve the project’s pinned React/Next.js versions. Match React Three Fiber major versions to the installed React major instead of upgrading React just to obtain a newer renderer.

## Architecture boundary

A maintainable 3D game should have these layers:

1. **Rules/state** — serializable match state, deterministic rules, move/action validation.
2. **Transport** — room identity, player identity, server actions, revisions/reconnect.
3. **3D adapter** — converts state such as board coordinates, entities, or FEN-like snapshots into render descriptors.
4. **WebGL scene** — meshes, lights, cameras, shadows, animation and picking.
5. **DOM HUD** — lobby, room code, chat, settings, move log, accessibility controls, errors and menus.

Do not bury lobby/chat/forms inside the WebGL canvas. Keep text-heavy and accessibility-critical UI in normal DOM unless a game mechanic truly requires 3D text.

## Board and grid games

For chess, tactics, tabletop, placement, or tile games:

- Define one canonical square/cell-to-world transform and its inverse.
- Unit-test or manually verify corners and orientation: top-left, top-right, bottom-left, bottom-right.
- Rotate the rendered board for player orientation without changing canonical square ids.
- Give every interactive piece/cell stable semantic metadata such as entity id or square id.
- Stop propagation from pieces when piece clicks and board clicks share the same raycast surface.
- Treat drag/orbit gestures differently from click/tap actions so camera movement does not create accidental moves.
- Render legal targets, selection, last action, warning/check state, and opponent actions distinctly.

## Cannabis parody art

Parody pieces must be original DTF designs, not traced or copied from another game or brand.

Preferred workflow:

1. Start with simple procedural geometry if gameplay integration must be proven first.
2. Replace procedural art with approved optimized GLB/glTF assets when art is ready.
3. Maintain stable piece/entity names and interfaces so art replacement does not rewrite gameplay logic.
4. Keep visual readability stronger than ornamentation: silhouettes must remain distinguishable at phone scale and angled camera views.
5. Use a consistent material language, scale, pivot/origin, and ground contact across the set.

For a themed chess set, preserve the mapping between standard chess identities and branded display identities in data rather than changing the chess engine’s internal piece codes.

## GLB / glTF asset pipeline

Before shipping imported 3D assets:

- use GLB/glTF rather than heavy source formats in the browser
- normalize scale and forward/up axes
- center pivots intentionally for placement/rotation
- remove hidden geometry and unused materials
- reuse materials/textures when practical
- compress textures and geometry where supported
- keep texture dimensions reasonable for mobile GPUs
- verify filename case exactly as deployed
- preload only what the first scene needs; lazy-load secondary scenes/assets
- provide a visible loading/failure state

Do not replace approved art with generic placeholders just because an asset path is broken. Repair the asset path or pipeline.

## Camera and interaction

Default controls should be easy to understand without instructions:

- pointer drag: orbit/rotate when appropriate
- wheel/pinch: bounded zoom
- tap/click: select or act
- optional reset-camera button
- optional player-view and cinematic presets

Constrain camera polar angle and distance so users cannot lose the board, move below the floor, or zoom through pieces.

For competitive board games, the default camera should favor board readability over cinematic drama.

## Mobile and accessibility

Mobile is a release requirement.

- Clamp DPR instead of blindly rendering at native high-DPI resolution.
- Use large enough tap targets and avoid hover-only actions.
- Preserve a DOM-based 2D/low-power fallback when the game can support it economically.
- Respect reduced-motion preferences for decorative animation.
- Keep chat, lobby, status, errors, move logs and settings usable without interacting with the canvas.
- Avoid canvas layouts that force horizontal page scrolling.

If WebGL initialization fails, fail visibly and offer a fallback or actionable error rather than a blank rectangle.

## Performance budget

Prefer predictable frame time over maximum visual complexity.

- Reuse geometry/materials.
- Use instancing for many repeated static objects.
- Avoid creating new Three.js resources every React render.
- Dispose resources created imperatively when scenes unmount.
- Limit real-time shadows; use one main shadow-casting light unless the scene proves it needs more.
- Bound shadow-map resolution for mobile.
- Avoid per-frame React state updates.
- Use `useFrame` only for visual/runtime updates that actually need frame cadence.
- Pause or reduce expensive effects when the tab is hidden or the game is inactive when practical.

## Multiplayer 3D rule

Synchronize actions/state, not transforms, for turn-based games.

Example:

- client selects `e2 -> e4`
- authoritative chess/rules service validates the move
- authoritative state/PGN/FEN is updated
- every client renders the resulting state in 3D

Do not let each client independently mutate a 3D piece and later attempt to reconcile divergent board states.

For real-time movement games, define a separate replication/interpolation model; do not reuse turn-based assumptions.

## Required verification

Before calling a 3D game release-ready:

1. lint and typecheck
2. production build
3. desktop rendered smoke test
4. phone-sized rendered smoke test
5. verify camera rotate/zoom/reset behavior
6. verify every primary clickable/tappable game action
7. verify board/entity coordinate mapping from more than one orientation
8. verify no browser console errors or missing assets
9. verify 2D/low-power fallback when provided
10. for multiplayer: test at least two independent sessions, reconnect, finish/reset/rematch, and confirm authoritative agreement
11. run the repository release/deployment gates for the exact candidate SHA

A passing build proves compilation, not playability. Browser QA is still required.

## Reusable component contract

Prefer 3D components that accept canonical render data and callbacks rather than owning rules. For a board game, a useful interface looks conceptually like:

- position/state snapshot
- player orientation
- selected cell/entity
- legal target ids
- last-action ids
- warning/highlight ids
- disabled/read-only state
- `onSelect` / `onAction` callbacks

This makes the same renderer reusable for live games, spectators, replays, tutorials, and local analysis.

## Proven DTF reference

`dtfgenetics/Thc-chess-git` uses the intended pattern for Kush Kings Chess: `chess.js` and Socket.io remain authoritative while React Three Fiber renders the 3D board and cannabis-parody pieces. Preserve that separation when extending it or adapting the pattern to other DTF games.

## Completion report

State:

- canonical rules/state source
- 3D renderer and asset paths changed
- interaction/camera behavior added
- mobile/fallback behavior
- tests/build/browser QA performed
- multiplayer authority verification when applicable
- deployment/live verification status using the release-pipeline vocabulary
