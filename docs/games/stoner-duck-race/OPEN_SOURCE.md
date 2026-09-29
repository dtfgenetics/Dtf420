# Open-source intake and licensing

This file records framework/reference sources approved for Stoner Duck Race research and implementation. Public visibility on GitHub is **not** treated as permission to copy code or assets; explicit license terms are required.

## Production dependencies

### Phaser

- Source: https://github.com/phaserjs/phaser
- License: MIT
- Role: browser rendering, scene orchestration, input, cameras, sprites, particles, audio integration.
- Project status: already present in the DTF420 root package at Phaser 4.2.1 when this game foundation was created.
- Policy: game rules stay outside Phaser scenes.

### Colyseus

- Source: https://github.com/colyseus/colyseus
- License: MIT
- Role: authoritative multiplayer rooms, matchmaking/state synchronization, WebSocket transport.
- Version line researched for this scaffold: Colyseus bundle 0.18.x; server package currently pins `colyseus ^0.18.5` and `@colyseus/schema ^5.0.8`.
- Policy: server owns progress, rank, finish state, race events, and authoritative inputs.

## Approved reference code

Reference projects may inform algorithms or architecture, but their bundled media is not automatically approved for shipping.

### Phaser TypeScript/Vite template

- Source: https://github.com/phaserjs/template-vite-ts
- License: MIT
- Use: project/bootstrap reference only.
- Note: DTF420 already has Next.js plus Phaser 4.2.1, so nesting the template would duplicate build systems. We adopt its client/bootstrap ideas inside the existing site instead.

### Colyseus Phaser tutorial

- Source: https://github.com/colyseus/tutorial-phaser
- License: MIT for source code; CC0 1.0 for the tutorial assets (verified against the repository README during the 2026-09-29 intake review).
- Use: room lifecycle, client/server separation, state synchronization, interpolation/reconnection research.
- Intake decision: reference/adapt the architecture only. Do **not** vendor the tutorial project because DTF420 already owns its Next.js + Phaser build and shared multiplayer adapter; copying the whole client/server scaffold would duplicate infrastructure.
- Policy: game rules stay in the shared DTF deterministic simulation and the server remains authoritative.

### Phaser3-Road

- Source: https://github.com/jamessimo/Phaser3-Road
- License: MIT (verified during research)
- Use: pseudo-3D road/projection ideas if a later 2.5D river presentation is pursued.
- Do not use as the production foundation; it is an older Phaser racing experiment.

### PsycoRally

- Source: https://github.com/abidibo/psycorally
- License: MIT (verified during research)
- Use: acceleration, friction, angular/racing movement research.

### JavaScript Racer

- Source: https://github.com/jakesgordon/javascript-racer
- License: MIT for code; repository media has separate restrictions called out by the original project.
- Use: road segments, curves, hills, camera/projection research.
- Policy: no copied music or unverified sprite media.

### Matter.js

- Source: https://github.com/liabru/matter-js
- License: MIT
- Potential role: selected environmental rigid-body interactions such as logs, barrels, bumpers, moving hazards.
- Policy: ducks themselves should remain lightweight deterministic simulation entities rather than 50 rigid bodies.

### LDtk

- Source: https://github.com/deepnight/ldtk
- License: MIT
- Potential role: visual environment/track authoring while the race spline/current data remains in our own track format.

## Asset policy

Production duck characters, stoner/cannabis theming, tracks, UI, powerup art, effects, music, audio, branding, and promotional imagery should be original DTF assets or separately documented assets whose licenses explicitly permit our intended use.

Do not copy artwork simply because it is bundled with an MIT code repository. Code and media frequently have different rights.

## Intake checklist

Before any external source file or asset is committed:

1. record source URL,
2. record exact revision/version,
3. record license/SPDX identifier,
4. record the files or subsystem reused,
5. preserve required copyright/license notices,
6. record modifications,
7. separately verify media licensing,
8. reject sources with no usable license unless we only study the behavior and independently implement our own solution.

## 2026-09-29 consolidation decision

The portfolio now centralizes endpoint normalization, room-code validation, and bounded Colyseus reconnection behavior in `game/core/network/MultiplayerRuntime.ts`. Stoner Duck Race consumes that adapter instead of owning a second reconnection policy.

The canonical cross-game browser utilities remain in `dtfgenetics/Thc/games/shared-platform` (settings/accessibility, input, audio, replay, deterministic RNG, loading, state machine, validation, experience helpers). DTF420 must not import that repository through an undeclared filesystem path. Cross-repo consolidation must use an explicit synchronized/vendor package with revision and license provenance before replacing the remaining local RNG/input compatibility surfaces.

### External code intake rule

Prefer mature MIT/CC0 building blocks that remove infrastructure we would otherwise maintain. Do not clone entire starters merely to gain boilerplate already provided by Next.js, Phaser, TypeScript, or the DTF shared platform. Any future copied source must record exact upstream revision, SPDX license, imported files, modifications, and required notices in this document before merge.
