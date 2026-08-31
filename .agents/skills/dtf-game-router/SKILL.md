---
name: dtf-game-router
description: >
  Route DTF420 browser-game work to the correct project skill before editing code. Use for any request to build, repair, improve, test, deploy, or integrate games on dtfseeds.com, including Weedopolis, High Land, High IQ, Strain Showdown, Bud or Bluff, Burn Buds, 3D worlds, and future games.
---

# DTF Game Router

Use this skill first for game-related work in this repository.

## Product target

- The repository is `dtfgenetics/Dtf420`; the production website and game destination is **dtfseeds.com**.
- New and repaired games are built for the existing dtfseeds.com `/games` experience.
- External editors, generators, sandboxes, and prototype hosts are tools only. They are not the finished destination.
- Never call a game live until its actual dtfseeds.com production route and assets are verified.

## Project baseline

- Preserve the repository's pinned stack unless the user explicitly requests a migration.
- Current game-capable stack is Next.js + React + TypeScript + Phaser, with 3D runtimes added per title only when a game actually requires them.
- Games belong inside the existing dtfseeds.com site and must not become disconnected external prototypes.
- Mobile usability, asset integrity, working navigation, and deployability are release requirements.

## Route by task

Load the matching skills before editing:

- Phaser scene, renderer, movement, board animation, sprite behavior -> `dtf-phaser-2d`
- Three.js, React Three Fiber, PlayCanvas evaluation, 3D worlds, cameras, GLB/glTF, Rapier physics, navmeshes, 3D performance, or unfamiliar 3D implementation research -> `dtf-3d-game-worlds`
- Missing images, sprites, boards, cards, atlases, audio, 3D models, textures, or broken asset paths -> `dtf-game-assets`
- HUD, menus, responsive layout, touch controls, readability -> `dtf-game-ui-mobile`
- Board-game rules, cards, decks, turn state, deterministic resolution -> `dtf-board-card-games`
- Rooms, invite links, player naming, synchronized turns -> `dtf-multiplayer-lobbies`
- Broken gameplay, visual regressions, browser/mobile testing -> `dtf-game-playtest`
- Build failures, route failures, production readiness, live-site verification -> `dtf-game-deploy`

Multiple skills may compose. Example: a multiplayer 3D exploration game may require `dtf-3d-game-worlds` + multiplayer + assets + UI + playtest.

## Mandatory workflow

1. Inspect the relevant existing files before creating new architecture.
2. Search for duplicate or abandoned implementations before assuming code is missing.
3. Identify the current dtfseeds.com route, game state model, render layer, asset manifest/paths, and verification scripts.
4. For unfamiliar APIs, engines, browser capabilities, formats, or technical behavior, research current primary sources instead of guessing. Use the dedicated 3D skill's unknown-problem protocol for 3D work.
5. Make the smallest coherent change that moves the existing implementation forward.
6. Never replace real game assets with placeholder rectangles, emoji, generic gradients, or invented art when the repository already contains approved assets.
7. Keep simulation/rules separate from Phaser/React/Three.js rendering state.
8. Run the narrowest relevant checks, then lint, typecheck, and build when practical.
9. Verify the route and asset URLs expected on dtfseeds.com, not only local imports or external previews.
10. Report what changed, what was verified, and any remaining blocker with exact file paths.

## Project rules

- Do not create a second implementation of a game just because the current one is incomplete.
- Prefer repairing and integrating existing work.
- Do not remove features to make tests pass unless the user explicitly approves the scope reduction.
- Do not silently change game rules, board geometry, card data, branding, or approved visual assets.
- Treat runtime warnings, missing assets, dead links, hydration errors, mobile overflow, WebGL/WebGPU errors, and unresolved asset licenses as real defects.
- Never claim a game is live until production deployment and the public dtfseeds.com route are verified.
