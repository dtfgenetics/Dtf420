---
name: dtf-3d-game-worlds
description: >
  Research, design, build, debug, optimize, and integrate 3D browser-game worlds for DTF420. Use for Three.js, React Three Fiber, PlayCanvas, WebGL/WebGPU, GLB/glTF assets, cameras, character controllers, Rapier physics, navmeshes, world streaming, animation, lighting, multiplayer 3D state, performance, or any unfamiliar 3D game-development problem that requires current external research before coding.
---

# DTF 3D Game Worlds

Use this skill for every 3D game or 3D-world task in DTF420. The goal is not to memorize every API. The goal is to use a repeatable engineering process that can reliably discover the correct current solution, prove it in the browser, and preserve what was learned.

## Core rule: research before guessing

Never invent an API, package feature, loader option, browser capability, file format behavior, shader feature, physics method, networking feature, or licensing term because it sounds plausible.

When a material technical detail is uncertain:

1. Inspect the repository and installed package versions first.
2. Search the official documentation for the exact installed/current version.
3. Inspect official examples, source, changelog, migration guide, or upstream GitHub repository when the docs are insufficient.
4. Check browser/platform compatibility when the answer depends on WebGL, WebGPU, WebXR, WASM, audio, input, workers, memory, or mobile behavior.
5. Search upstream issues/discussions for a concrete error message or undocumented edge case.
6. Build the smallest isolated reproduction when sources disagree or behavior remains unclear.
7. Verify the result in a real browser before integrating it into the game.
8. Record the verified conclusion in code comments, tests, project documentation, or this skill when it is broadly reusable.

Do not substitute random blog posts, copied snippets, AI-generated tutorials, or abandoned repositories for primary documentation when a primary source exists.

## Evidence hierarchy

Prefer sources in this order:

1. Installed package source/types and repository lockfile
2. Official documentation and official examples
3. Official GitHub repository releases, changelog, issues, and discussions
4. Browser-vendor documentation such as MDN or Chrome/WebKit documentation
5. Khronos specifications for glTF, KTX, WebGL, and related standards
6. Maintainer-authored examples or established ecosystem packages
7. Community discussion only when primary sources do not answer the problem

For time-sensitive APIs, package compatibility, licenses, pricing, model/API availability, or browser support, verify online every time.

## DTF420 baseline

- DTF420 is a Next.js + React + TypeScript application.
- Phaser remains the default for 2D games.
- 3D games must live inside the existing DTF game hub instead of becoming disconnected external prototypes unless a separate runtime is technically required and explicitly approved.
- Simulation/gameplay state must remain separate from renderer objects.
- Menus, HUD, inventory, settings, dialog, and accessibility-heavy UI should remain normal DOM/React UI by default.
- Mobile usability, loading behavior, asset integrity, browser compatibility, and deployability are release requirements.

## Engine decision

Choose the runtime deliberately. Do not install several 3D engines into one title without a strong technical reason.

### Default for DTF420: React Three Fiber

Use React Three Fiber when:

- the 3D game is embedded in the existing React/Next.js site;
- the scene needs to coordinate with React menus, HUD, account state, game hub state, or settings;
- declarative scene composition helps more than it hurts;
- common helpers from Drei and React-oriented Rapier integration are useful.

Typical stack after version verification:

- `three`
- `@react-three/fiber`
- `@react-three/drei`
- `@react-three/rapier`
- optional `@react-three/postprocessing`

Do not drive high-frequency gameplay by causing broad React rerenders every frame. Per-frame transforms and animation updates belong in the render loop or simulation bridge.

### Direct Three.js

Use direct Three.js when:

- the game needs explicit imperative ownership of renderer, scene, cameras, loading, and frame loop;
- React adds no meaningful value to the actual 3D runtime;
- a highly custom renderer architecture or performance-sensitive scene is easier to control directly.

Prefer TypeScript and the official Three.js addons. Use `GLTFLoader` for glTF/GLB assets and add KTX2, Draco, or Meshopt support only when the asset pipeline actually produces those formats.

### PlayCanvas

Evaluate PlayCanvas when:

- a browser-based visual editor would materially speed world construction;
- designers need to arrange a scene without editing code;
- its Engine/Editor workflow or current AI-agent skills solve a concrete problem better than the existing React stack;
- WebGPU/WebGL fallback, tooling, and rapid 3D iteration are central requirements.

PlayCanvas can be used standalone through npm or through its Editor. If chosen, inspect its current official agent skills and documentation instead of reproducing old API examples from memory.

### Babylon.js

Evaluate Babylon.js when its integrated feature set, WebXR support, tooling, GUI, physics integrations, or engine architecture provides a clear advantage. It is an alternative path, not the DTF default.

### WebGPU

Treat WebGPU as progressive enhancement unless target-browser testing proves it can be required. A production DTF browser game should preserve a viable WebGL2 path when practical. Verify current support before relying on a WebGPU-only feature.

## World architecture

For a substantial 3D title, prefer boundaries similar to:

```text
app/games/<game>/
  page.tsx
  GameShell.tsx
  ui/

lib/games/<game>/
  simulation/
    state.ts
    actions.ts
    systems/
    rules/
  world/
    world-manifest.ts
    zones/
    spawn-points.ts
  render/
    SceneRoot.tsx
    cameras/
    characters/
    environment/
    fx/
    loaders/
  physics/
    world.ts
    collision-layers.ts
    character-controller.ts
  input/
    actions.ts
    keyboard.ts
    touch.ts
    gamepad.ts
  ai/
    navigation.ts
    behavior/
  audio/
  persistence/
  diagnostics/

data/games/<game>/
public/games/<game>/
  models/
  textures/
  audio/
  environments/
  nav/
```

Adjust this structure to the actual game rather than creating empty architecture for its own sake.

## Coordinate and world conventions

Lock these before importing many assets:

- world up axis: `+Y`
- use a right-handed coordinate convention for Three.js/glTF workflows
- default scale: `1 world unit = 1 meter`
- player origin and collision capsule dimensions must be documented
- reusable prop pivots should be predictable, normally ground-centered or object-centered as appropriate
- forward direction must be consistent across player models and animations
- environment chunks need stable IDs independent of filenames

Do not fix mismatched scales and rotations with dozens of random runtime offsets. Correct the asset pipeline or manifest.

## Simulation and frame loop

Keep canonical game state independent of Three.js/R3F objects.

Use:

- a fixed or bounded simulation timestep for physics and gameplay that require determinism;
- variable-rate rendering for visual interpolation;
- explicit bridges that copy simulation transforms to rendered objects;
- serializable state for saves and multiplayer state;
- renderer objects only for presentation.

Do not store `Mesh`, `Object3D`, materials, DOM nodes, Rapier handles, or React components in save data.

## Character controller

A usable 3D character needs more than WASD movement.

Define and test:

- walk/run acceleration and deceleration
- grounded detection
- jump behavior
- slopes and maximum climb angle
- steps/ledges
- walls and ceilings
- moving platforms if present
- spawn safety
- falling/reset behavior
- camera collision
- touch controls
- gamepad mapping when required

Prefer a capsule-like character collider or an engine-supported character-controller strategy rather than using the detailed visual mesh as the player's collision shape.

## Camera system

Create camera behavior as its own system. Possible modes include:

- first person
- over-the-shoulder third person
- chase camera
- orbit inspection
- fixed room camera
- rail/cinematic camera

For third-person cameras, handle obstruction rather than allowing the camera to pass through walls. Separate player facing, movement direction, camera heading, and aiming direction instead of assuming they are always identical.

## Physics

Rapier is the preferred JavaScript/WebAssembly physics candidate for custom Three.js/R3F 3D worlds unless the selected engine provides a better integrated option.

Model bodies intentionally:

- fixed: static world geometry
- dynamic: physics-controlled movable objects
- kinematic: player controllers, elevators, moving platforms, scripted bodies when appropriate
- sensor colliders: triggers, checkpoints, pickups, interaction volumes, zone detection

Rules:

- use simplified collision proxies instead of render meshes where practical;
- never create high-detail triangle-mesh colliders for every prop by default;
- keep collision groups/layers explicit;
- define trigger behavior separately from solid contact behavior;
- test high-speed movement and tunneling risks;
- keep physics stepping independent from display frame rate.

## AI navigation

For floor-based 3D NPC navigation, evaluate a navmesh system rather than writing ad hoc obstacle avoidance.

Current research candidates include Recast/Detour JavaScript/WASM integrations such as `recast-navigation`, which can generate/query navmeshes and has Three.js and PlayCanvas helpers. For largely static levels, prefer offline navmesh generation. For procedural worlds, consider worker-based generation only after measuring its cost.

The navmesh is not the AI. Keep these separate:

- path planning
- steering/movement
- perception
- target selection
- behavior/state machine
- combat or interaction rules

Always render a debug navmesh/path overlay during development.

## 3D asset pipeline

### Shipping format

Use GLB/glTF 2.0 as the default runtime model format. Keep source `.blend`, FBX, or generator files outside the runtime asset contract.

Recommended pipeline:

```text
source asset
  -> inspect license/provenance
  -> clean topology/materials
  -> normalize scale/orientation/pivots
  -> UV/material cleanup
  -> animation/rig validation
  -> collision proxy generation
  -> LOD generation when needed
  -> export GLB/glTF
  -> optimize mesh data
  -> compress textures where justified
  -> runtime validation
  -> manifest registration
  -> browser/mobile test
```

### Compression and optimization

Evaluate, measure, and version-pin tools such as:

- Meshopt / `gltfpack` for mesh optimization and compression
- KTX2/Basis Universal for GPU-friendly compressed textures
- Draco only when its tradeoffs make sense for the asset set

Do not blindly compress everything. Compare download size, decode time, GPU memory, visual quality, and mobile behavior.

### Textures

- use PBR textures intentionally: base color, normal, roughness/metalness, emissive, AO only when needed;
- do not ship source-resolution textures because they exist;
- provide mipmaps for 3D textures;
- use compressed texture formats when the measured memory/bandwidth savings justify the pipeline;
- audit alpha textures because overdraw can become expensive;
- maintain color-space correctness.

### Repeated objects

Use instancing or batching when large numbers of props share geometry/materials. Trees, pots, rocks, lamps, repeated buildings, particles, and decorative props should not automatically become thousands of independent draw calls.

## Asset sourcing and generation

Search/recover DTF-owned assets before acquiring new ones. Then choose from controlled sources.

Preferred research sources include:

- Poly Haven for CC0 HDRIs, textures, and models
- Quaternius for game-ready asset packs under its current published license
- reputable licensed marketplaces where the exact asset license is recorded
- Blender for cleanup, retopology, UVs, rigging, animation fixes, collision proxies, and GLB export
- Meshy, Tripo, Sloyd, or other current AI 3D generators when generation materially helps and their current terms/API capabilities have been verified

Never assume an asset is commercially usable because it is downloadable. Record:

- source URL/provider
- creator when relevant
- license name/version
- acquisition date
- modifications
- original file
- optimized derivative
- game(s) using it

Avoid editorial-only, trademark-sensitive, ripped-game, fan-extracted, or unclear-license assets for production.

## AI-generated 3D assets

AI generation is a starting point, not a finished game pipeline.

After generation:

1. inspect silhouette and proportions;
2. check topology and face count;
3. repair non-manifold or broken geometry if necessary;
4. inspect UVs/material assignments;
5. retopologize if the mesh is wasteful;
6. normalize orientation, dimensions, origin, and pivot;
7. rig and test deformation if animated;
8. create collision proxies;
9. create LODs if needed;
10. export and optimize GLB;
11. test in the actual browser scene.

Never wire a temporary generated-asset URL directly into production. Store approved assets under project control.

## Lighting and visual quality

Start with physically coherent lighting before adding effects.

Prefer:

- environment/HDR lighting where appropriate
- a limited number of important dynamic lights
- baked/static lighting strategies for large static environments when practical
- PBR materials
- correct tone mapping/color management for the selected renderer

Post-processing such as bloom, depth of field, SSAO, outlines, fog, or color grading is optional. It must improve the game and remain within frame budget.

## Large worlds

Do not load an entire large world because the browser technically can.

For larger environments, consider:

- zone/chunk manifests
- distance-based loading/unloading
- LODs
- instancing
- occlusion/frustum culling
- pooled objects
- texture reuse/atlases when appropriate
- simplified distant collision
- offline-generated navmesh tiles
- worker-based heavy preprocessing

The player must never see a missing floor because a chunk was unloaded too aggressively. Streaming correctness comes before sophistication.

## Browser performance budget

Measure instead of arguing from intuition.

Track at minimum:

- FPS and frame time
- CPU scripting time
- GPU/render time when tooling permits
- draw calls
- triangles/vertices
- active lights and shadow casters
- texture/GPU memory estimates
- JS heap growth
- asset download size
- initial playable load time
- shader compilation hitches
- long tasks

Use lower render resolution or adaptive quality before allowing unstable mobile frame rates.

Performance rules:

- reuse geometry/materials
- prefer instancing for repeated meshes
- avoid allocating temporary objects every frame
- avoid broad React state updates in `useFrame`
- dispose of GPU resources that are genuinely no longer used
- do not leak loaders, workers, textures, render targets, or physics objects
- make shadows and post-processing quality adjustable

Use browser performance tools and GPU/frame debugging tools when the bottleneck is unclear.

## WebGL/WebGPU resilience

- handle resize correctly;
- test device pixel ratio behavior;
- expect WebGL context loss;
- avoid blocking GPU readbacks in gameplay;
- remove WebGL errors instead of ignoring them;
- detect capabilities rather than assuming extensions exist;
- keep a degraded quality mode for weak devices;
- verify Safari/iOS separately from Chromium desktop.

## Multiplayer 3D

Never make a networked 3D game authoritative on the browser client when cheating or synchronization matters.

For real-time shared worlds, evaluate an authoritative server framework such as Colyseus after checking its current version and requirements.

Server owns authoritative:

- player identity
- legal actions
- canonical transforms or simulation inputs as appropriate
- health/resources
- inventory
- pickups
- combat results
- world state
- match outcome

Client owns presentation and may predict/interpolate movement, but it must reconcile with server authority.

Prototype locally first. Do not introduce multiplayer before the single-player/local simulation is stable enough to synchronize.

## Audio

Use Web Audio or engine abstractions deliberately:

- user gesture is normally required before audible playback;
- spatial audio should be reserved for sounds where 3D direction matters;
- music/UI audio can remain non-spatial;
- pool frequent short sounds;
- expose volume controls;
- pause/suspend appropriately when the page/game is inactive.

## The unknown-problem protocol

Use this whenever the task contains something we do not know how to implement reliably.

### Step 1 — State the unknown precisely

Bad: `3D movement is broken.`

Good: `The Rapier kinematic player capsule climbs 0.6 m ledges but should stop above 0.35 m in @react-three/rapier version X.`

### Step 2 — Inspect local reality

Check:

- package/version
- lockfile
- relevant source files
- runtime error
- browser/device
- minimal reproduction path
- whether the code is ours, engine code, asset data, or browser behavior

### Step 3 — Research primary sources

Search using the exact package/API/error/version. Prefer official docs, official examples, upstream source and current issues.

### Step 4 — Cross-check

Require a second supporting source when:

- documentation conflicts with actual types/source;
- API behavior changed recently;
- the answer depends on browser support;
- licensing or commercial-use rights are involved;
- an issue report may describe an old version.

### Step 5 — Make a minimal spike

Create the smallest test that proves one thing. Do not rewrite the production game just to test an API.

### Step 6 — Integrate narrowly

Make the smallest coherent production change after the spike is understood.

### Step 7 — Verify

Run the specific test, browser scenario, responsive view, console check, then lint/typecheck/build when appropriate.

### Step 8 — Preserve knowledge

If the result will matter again, add one of:

- a regression test
- diagnostic helper
- project note
- asset-pipeline script
- reusable utility
- update to this skill

This is how DTF becomes better at game development over time instead of repeatedly rediscovering the same answer.

## Search-query patterns

Use precise searches such as:

```text
<package> <installed version> <exact API> official docs
<package> <exact error message> GitHub issue
<engine> official example third person character controller
<browser> <feature> support MDN
<format> extension Khronos specification
<package> migration <old version> <new version>
<engine> GLB KTX2 Meshopt official example
<physics> kinematic character controller slopes steps official docs
<multiplayer framework> authoritative movement interpolation official docs
```

Avoid vague searches like `best way to make 3d game javascript` once the actual technical problem is known.

## Source registry to check first

For common DTF 3D work, search these primary ecosystems first:

- Three.js: `threejs.org` and `github.com/mrdoob/three.js`
- React Three Fiber / pmndrs: `r3f.docs.pmnd.rs`, `docs.pmnd.rs`, and official pmndrs GitHub repositories
- Rapier: `rapier.rs`
- glTF/KTX: Khronos specifications and tooling
- Blender: `docs.blender.org`
- PlayCanvas: `developer.playcanvas.com`, API docs, and official GitHub repositories
- Babylon.js: `doc.babylonjs.com`
- Colyseus: `docs.colyseus.io`
- Recast navigation integrations: maintainer docs/source and upstream Recast documentation
- Browser graphics: MDN plus browser-vendor documentation
- Mesh optimization: Meshoptimizer / gltfpack upstream documentation

For online asset/generation providers, always re-check current licensing, pricing, API availability, retention, and commercial-use terms before adoption.

## First playable 3D vertical slice

Before building a huge world, prove this sequence:

1. route loads with no console errors;
2. renderer initializes on desktop and mobile-sized viewport;
3. player spawns on valid ground;
4. movement works;
5. camera works and does not clip badly;
6. collision works;
7. one interactive object works;
8. one NPC or moving hazard works if relevant;
9. one objective can be completed;
10. save/reset state works if required;
11. asset loading has a visible failure path;
12. performance telemetry is available;
13. page can exit back to the DTF game hub cleanly.

Only expand world size after this slice is stable.

## 3D release gate

A 3D game is not release-ready until:

- game rules are testable separately from rendering;
- all runtime assets resolve with no 404s;
- asset licenses/provenance are recorded;
- player cannot routinely fall through or escape intended world bounds;
- collision, triggers, camera, and respawn are tested;
- desktop keyboard/mouse works;
- required touch controls work on mobile;
- target mobile width has no unusable overlay or canvas sizing problems;
- no repeated WebGL/WebGPU console errors occur;
- load failure and unsupported-device behavior are understandable;
- memory does not continuously grow during normal traversal/restarts;
- performance is measured on at least one realistic lower-power target;
- lint/typecheck/build pass;
- browser playtest passes;
- production route and deployed asset URLs are verified.

## Related DTF skills

Compose this skill with:

- `dtf-game-router` for task routing
- `dtf-game-assets` for asset recovery and integrity
- `dtf-game-ui-mobile` for HUD/touch/menu behavior
- `dtf-multiplayer-lobbies` for rooms/invite flows
- `dtf-game-playtest` for browser QA
- `dtf-game-deploy` for production verification

Do not replace these skills. Use this one as the 3D architecture, research, renderer, world, physics, and performance specialist.
