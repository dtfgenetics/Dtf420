# DTFSeeds.com 3D Game Integration Contract

This skill exists to build 3D games for **dtfseeds.com**.

The GitHub repository is `dtfgenetics/Dtf420`, but the product target is the public DTF Seeds website and its `/games` experience. Do not confuse the repository name with the destination site.

## Required destination

Unless a specific technical experiment is explicitly marked temporary, every production 3D game must be designed to integrate into:

```text
https://dtfseeds.com/games/<game-slug>
```

The exact public routing/deployment architecture must be verified against the current site before release.

## External tools are production tools, not destinations

PlayCanvas, Blender, Meshy, Tripo, Sloyd, online editors, asset marketplaces, code sandboxes, and other external services may be used to create or test assets and systems.

They are **not** the final game destination.

A game is not finished because:

- it runs in the PlayCanvas Editor;
- a Meshy/Tripo/Sloyd model preview works;
- it runs on CodePen, StackBlitz, Replit, Base44, Lovable, or another sandbox;
- a standalone HTML file works locally;
- an external hosted prototype has a public URL.

The production requirement is integration and verification on dtfseeds.com.

## DTFSeeds integration requirements

Every production game must:

1. Have a stable route in the existing DTF Seeds game hub.
2. Preserve the site's global navigation and a clear path back to `/games`.
3. Use DTF-approved branding and assets rather than generic template styling.
4. Avoid duplicating a game implementation that already exists elsewhere in the repository/history.
5. Load game code and assets in a way compatible with the current dtfseeds.com deployment architecture.
6. Keep large 3D dependencies and assets out of unrelated site routes where practical through route-level loading/code splitting.
7. Have a deliberate loading state for models, textures, audio, physics WASM, and world chunks.
8. Fail intelligibly if WebGL/WebGPU or a critical asset cannot initialize.
9. Work at supported desktop and mobile viewport sizes.
10. Avoid breaking the rest of dtfseeds.com through global CSS, event handlers, memory leaks, runaway animation loops, or oversized shared bundles.
11. Clean up render loops, event listeners, workers, audio, physics worlds, render targets, and GPU resources when leaving the game route where required.
12. Use production-safe paths and filename case.
13. Keep canonical game state serializable and separate from renderer objects.
14. Pass the repository verification/build gates before merge.
15. Pass browser playtesting after integration.
16. Be checked on the actual public dtfseeds.com route after deployment before being labeled live or playable.

## Performance contract with the main site

3D games can be heavier than ordinary web pages, but they must not make the entire site heavy.

Prefer:

- dynamic/lazy loading of 3D runtime code on the game route;
- loading only the first playable area's required assets initially;
- route-specific model/texture/audio manifests;
- compressed production assets when measurement supports them;
- disposal/cleanup when the user exits the game;
- a low-quality/mobile mode when needed;
- retaining normal HTML/React navigation outside the WebGL canvas.

Do not place large world assets or 3D engine initialization in global layout code unless there is a proven site-wide need.

## Visual integration

The 3D world can have its own strong visual identity, but the surrounding experience should still feel like DTF Seeds.

Keep:

- readable DTF game title and status;
- consistent back/navigation affordances;
- accessible settings and controls;
- responsive layout;
- truthful development/playable status;
- DTF-approved logos/marks only where appropriate.

Do not wrap an immersive 3D game in excessive website cards. Once play starts, favor the world plus a restrained HUD.

## Production verification

Before saying a 3D game is live, verify all of the following against dtfseeds.com:

- the public route resolves;
- JavaScript chunks load;
- GLB/glTF models load;
- textures/HDRIs load;
- physics/WASM dependencies load if used;
- no route-specific 404s occur;
- no repeated console exceptions or WebGL errors occur;
- movement/input works;
- mobile layout/control path works if mobile is supported;
- leaving and re-entering the game does not create duplicate canvases/listeners;
- the `/games` hub links to the correct route and reports truthful status;
- site navigation still works after a game session;
- the game does not materially regress unrelated dtfseeds.com pages.

## Decision rule

When choosing between two technically valid approaches, prefer the one that integrates cleanly into dtfseeds.com, can be maintained in the DTF repository, can be tested automatically, and does not make unrelated pages pay the performance cost of the game.
