# Living Plant Atlas — open-source interaction reference review

Date: 2026-09-04

## Goal

Use proven open-source 3D annotation patterns as implementation references while keeping the existing DTF420 Atlas contract, evidence model, accessible fallback, and fail-closed production-model release gates.

## References reviewed

### Google `<model-viewer>` annotations

Reference: https://modelviewer.dev/examples/annotations/

Useful patterns:
- hotspots are semantic DOM controls rather than text baked into WebGL;
- hotspot anchors are attached to model-space positions and can expose visibility state;
- camera-view hotspot controls can store a target/orbit and move the camera when selected;
- screen-space labels and SVG leader lines stay readable and accessible while the model moves;
- animated/surface-bound hotspots demonstrate why annotation position should ultimately come from the 3D model instead of permanent screen percentages.

Atlas adoption:
- keep labels/buttons in accessible HTML;
- treat each Atlas entity as a semantic hotspot with explicit label orientation now;
- next runtime phase should project canonical 3D entity anchors into screen space and publish visibility/position to the parent UI;
- selected hotspots should remain visually stronger than passive annotations;
- the inspector remains the authoritative detail surface.

### pmndrs React Three Fiber + Drei examples

References:
- https://github.com/pmndrs/react-three-fiber/tree/master/docs
- https://github.com/pmndrs/drei

Useful patterns:
- `Html` is used for readable DOM annotations connected to 3D scenes;
- `Bounds`/`Center` patterns provide robust framing for GLTF assets of varying geometry;
- reusable helpers separate camera/model concerns from application UI;
- model preload and explicit scene ownership reduce runtime surprises.

Atlas adoption:
- do not migrate the established iframe Three.js runtime to React Three Fiber merely for style;
- port the proven concepts instead: model-bound annotations, explicit bounds/framing, reusable camera presets, and DOM-first information surfaces;
- retain current production GLB loader, model QA gates, semantic entity IDs, and cross-frame state protocol.

## Current implementation changes informed by these references

1. Hotspot records now declare `labelSide` so leader annotations can open left or right around the specimen instead of using one generic card direction.
2. Hotspot DOM controls expose `data-entity-id`, `data-label-side`, and `data-selected` state for stable styling and Browser QA.
3. Desktop labels use a scientific leader-line treatment. Passive labels are visually quiet; the selected entity gets the stronger glass callout.
4. Mobile intentionally drops leader text and keeps large tappable hotspot targets, with detail content moving to the responsive inspector sheet.
5. The expandable right inspector remains a separate DOM surface so text, links, progress, and scientific explanation stay accessible and do not depend on WebGL.

## Next engineering phase

### Runtime-projected annotations

Replace static percentage coordinates during a live Three.js session with runtime-projected entity anchors:

- define canonical model-space anchor vectors for each semantic entity;
- after camera/control updates, project anchors with `Vector3.project(camera)`;
- convert normalized device coordinates to 0–100% viewport coordinates;
- determine front-facing / in-frustum state;
- optionally use a raycaster to suppress labels that are genuinely occluded by the specimen;
- publish a throttled `atlas:hotspots` message to the parent iframe host;
- parent React UI uses projected positions while retaining JSON percentage positions as fallback when WebGL is unavailable;
- Browser QA verifies labels move after orbit and remain inside the viewport.

This mirrors the strongest part of the `<model-viewer>` annotation architecture without introducing a second rendering framework.

### Production GLB framing

Use the equivalent of the R3F `Bounds`/`Center` pattern in the existing Three runtime:

- compute bounding box/sphere after GLB load;
- normalize the specimen to the Atlas world scale;
- bottom-anchor root/crown reference consistently;
- derive safe whole-plant camera distance from the bounding sphere and viewport aspect;
- keep entity-specific camera targets as semantic overrides after the whole-plant fit.

### Inspector media

The right inspector should become image-first when approved structure media exists:

- macro/microscopy image or model detail first;
- structure title + concise functional subtitle;
- short scientific explanation;
- key functions;
- related Anatomy / Micro / Data / Notes tabs;
- deeper lesson links below, not mixed into the primary visual hierarchy.

## Non-goals

- Do not copy third-party UI branding or copyrighted assets.
- Do not replace the existing evidence-backed content system with demo data.
- Do not turn an open-source example into a new competing Atlas runtime.
- Do not mark any production cannabis GLB released until it passes the existing rights, geometry, botanical, semantic, performance, provenance, and browser gates.
