# DTF 3D Online Toolbox

This is a discovery map, not a permanent endorsement list. Re-check current documentation, licensing, pricing, API availability, retention policies, and browser support before adopting any external service.

## Runtime and scene authoring

| Need | First places to check | Why |
|---|---|---|
| React-hosted 3D | React Three Fiber + Three.js official docs | Best fit for DTF420's existing React/Next.js shell |
| Direct browser 3D | Three.js official docs/examples | Direct renderer/scene/camera control with a large browser ecosystem |
| Visual online 3D editor | PlayCanvas Editor | Browser-based scene hierarchy, materials, lights, physics, scripting and live preview |
| AI-assisted visual editing | PlayCanvas Editor MCP Server | Current official MCP route for an AI coding client to modify/verify an open Editor project |
| Integrated alternative engine | Babylon.js official docs | Strong all-in-one browser-engine option when its feature set fits better |
| Next-gen graphics research | Three.js WebGPURenderer, PlayCanvas WebGPU docs, MDN/browser-vendor docs | Use only after capability/fallback testing |

## Asset creation and sourcing

| Need | First places to check | Rules |
|---|---|---|
| HDRIs, PBR textures, realistic models | Poly Haven | CC0 according to current published license; preserve source record anyway |
| Game-ready stylized packs | Quaternius | Verify the current Quaternius Asset License for the exact acquisition date |
| Custom human-made assets | Blender + commissioned/original work | Keep source files and export controlled GLB derivatives |
| AI text/image to 3D | Meshy | Verify current model/API, commercial terms, retention, topology and output formats |
| AI text/image to 3D alternative | Tripo | Verify current API/model version and terms before pipeline integration |
| Controlled topology AI generation | Sloyd | Useful when target topology/face count controls matter; verify current API terms |
| Marketplace/downloadable models | Provider-specific licensed marketplaces | Never infer commercial rights from download availability; save the exact license |

Avoid ripped game assets, fan extractions, unclear-license downloads, and editorial-only models in production.

## Asset cleanup and shipping

| Need | First places to check | Notes |
|---|---|---|
| Modeling/retopo/rigging/UV/export | Blender | GLB/glTF exporter is the baseline bridge into the web runtime |
| Mesh optimization | Meshoptimizer / `gltfpack` | Measure size, decode and visual impact |
| Texture compression | KTX2 / Basis Universal tooling | Useful for reducing GPU texture memory and download bandwidth |
| Runtime loading | Three.js `GLTFLoader` or selected engine's official glTF loader | Use official extension support for KTX2/Meshopt/Draco |

## Physics and movement

| Need | First places to check | Notes |
|---|---|---|
| 3D physics | Rapier JS/WASM | Preferred custom Three/R3F candidate; use fixed/dynamic/kinematic/sensor bodies intentionally |
| Character movement | Rapier/controller docs + engine examples | Prove slopes, steps, grounded state and camera behavior in a minimal scene first |
| Collision debugging | Collider debug visualization | Visual mesh and collision shape must be inspectable separately |

## AI navigation

| Need | First places to check | Notes |
|---|---|---|
| Navmesh generation/query | `recast-navigation` / Recast-Detour ecosystem | Has browser/Node support and Three.js/PlayCanvas helpers |
| Static-world navmesh | Offline generation | Preferred over runtime generation when geometry rarely changes |
| Procedural navmesh | Worker-based generation after profiling | Do not block the render/main thread with expensive world processing |

## Multiplayer

| Need | First places to check | Notes |
|---|---|---|
| Real-time authoritative rooms/state | Colyseus | Current Node.js framework supports authoritative rooms, state synchronization and matchmaking |
| Turn-based/local | Existing DTF deterministic state patterns | Do not add a multiplayer server before local rules are stable |

## Browser and GPU debugging

| Need | First places to check |
|---|---|
| WebGL rules/limits/performance | MDN WebGL best practices |
| Engine behavior | Official engine docs/examples/source |
| GPU/frame inspection | Browser performance tools and SpectorJS when appropriate |
| Browser capability | MDN + target browser vendor documentation |
| Upstream bug/edge case | Current official GitHub issues/discussions using exact version/error |

## Research procedure for a new tool

Before adopting a tool not already in this list, answer and record:

1. What exact problem does it solve better than the existing stack?
2. Is it actively maintained?
3. What is the current stable version or API generation?
4. Does it support browser + TypeScript or the runtime we actually use?
5. What is its license?
6. What are the commercial-use terms?
7. Does it require a hosted service or can it be self-hosted?
8. What happens if the service disappears?
9. Can output be exported into an open format such as GLB/glTF?
10. What does it cost at the scale we need?
11. Does it store our source assets or prompts, and for how long?
12. Can we reproduce a minimal test locally?
13. What new bundle/runtime/performance cost does it introduce?
14. What is the rollback plan if it fails?

No external tool becomes a core dependency until these questions have adequate answers.
