# DTF 3D Research Log

Keep durable, source-backed conclusions here when they affect dtfseeds.com 3D architecture.

## 2026-08-31 — First vertical slice runtime

- The production site is Next.js + React + TypeScript, but Three/R3F/Rapier are not currently first-class repository dependencies.
- `three` current npm latest checked on 2026-08-31: `0.185.1`; npm reports zero runtime dependencies.
- `@react-three/rapier` v2 documents support for React Three Fiber v9 and React 19.
- Because the repository uses a locked `npm ci` deployment flow, the first world proof should not add runtime dependencies without regenerating `package-lock.json`.
- Existing Seed Ascent establishes a site-owned pattern where `/games/<game>` embeds a static browser runtime from `public/` in an iframe.
- Therefore the first 3D proof can use pinned direct Three.js as a temporary bootstrap, then migrate to R3F + Rapier after movement/camera/interaction behavior is proven.

## Rule

A temporary bootstrap decision does not become permanent merely because it works. Re-evaluate it at the stated upgrade gate.