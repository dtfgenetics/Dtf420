# dtfseeds.com First 3D Vertical Slice

This file records the bootstrap decision for the first 3D playable slice on dtfseeds.com.

## Why the first slice uses direct Three.js

The production repository is lockfile-controlled and does not currently install Three.js / React Three Fiber / Rapier as first-class dependencies. Do not make `npm ci` fail by changing `package.json` dependencies without regenerating and validating the lockfile.

For the first proof, use a static Three.js ES-module runtime embedded through the same site-owned iframe pattern already used by Seed Ascent. Pin the external module to an exact verified version. This is a bootstrap strategy, not the long-term runtime architecture.

Current verified bootstrap pin on 2026-08-31:

- Three.js `0.185.1`
- npm reports zero runtime dependencies for the `three` package

## Slice acceptance target

The first slice must prove these systems before adding models or a large world:

1. `/games/dtf-world-lab` route in the normal dtfseeds.com shell.
2. One rendered 3D environment.
3. Third-person player movement.
4. Camera follow/orbit behavior.
5. Ground and obstacle collision.
6. One reachable interaction objective.
7. Keyboard and touch controls.
8. Pause/focus-safe input handling.
9. Resize and device-pixel-ratio handling.
10. Basic FPS/frame-time diagnostics.
11. Loading/error UI.
12. Game-hub status remains `Development preview`.

## Upgrade gate to R3F + Rapier

After the slice proves the interaction model:

- install and lock compatible `three`, `@react-three/fiber`, `@react-three/drei`, and `@react-three/rapier` versions;
- regenerate `package-lock.json` with the repository's pinned npm version;
- run the full verification gate;
- move canonical simulation state out of the static bootstrap runtime;
- replace ad hoc flat-world collision with Rapier character-controller/physics integration;
- preserve the verified controls, camera feel, objective logic, and mobile UX unless testing shows they should change.

Do not expand the bootstrap into a large permanent engine. It exists to prove the vertical slice safely.