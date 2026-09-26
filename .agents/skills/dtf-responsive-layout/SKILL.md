---
name: dtf-responsive-layout
description: >
  Design, repair, and review responsive DTF420 layouts across phones, tablets,
  laptops, desktops, wide displays, and constrained-height viewports. Use before
  changing shared CSS, page shells, course layouts, tools, games, navigation,
  cards, tables, forms, modals, canvases, or any viewport-sensitive UI.
metadata:
  author: dtfgenetics
  version: "1.0.0"
---

# DTF Responsive Layout

Use this skill for every substantive visitor-facing layout or CSS change.

Read first:

- `docs/RESPONSIVE_LAYOUT_STANDARD.md`
- `app/globals.css`
- route-specific CSS loaded after globals
- `.agents/skills/dtf-release-pipeline/SKILL.md` for release-bound work

## Canonical viewport bands

- small phone: 320–420 CSS px
- large phone: 421–700 CSS px
- tablet: 701–900 CSS px
- compact desktop / large tablet: 901–1120 CSS px
- desktop: 1121–1440 CSS px
- wide desktop: above 1440 CSS px with capped content widths

Prefer fluid sizing inside those bands with `clamp()`, `min()`, `max()`, `minmax(0,1fr)`, and shared spacing tokens.

## Conflict prevention

Before adding a media query:

1. inspect every stylesheet affecting the component;
2. identify load order;
3. find overlapping selectors/properties;
4. compare media-query ranges;
5. reconcile contradictions instead of stacking another override.

A later stylesheet that reverses an earlier phone/tablet rule is a defect.

## Required implementation rules

- shared layout fixes before page-local fixes;
- tablet must be treated as its own composition state;
- grid/flex children with text/media need `min-width:0`;
- media must not force page width;
- long tokens must wrap safely;
- dense tables/code must use local scrolling;
- primary touch targets should be at least 44 CSS px high;
- mobile menus/dialogs/sticky panels must fit inside `100dvh`;
- do not hide required content to make narrow layouts fit;
- do not use page-level clipping as the only fix for an oversized child;
- games/canvas surfaces need a responsive shell with readable controls.

## Required QA matrix

Inspect at minimum:

- 360×800
- 390×844
- 430×932
- 768×1024
- 820×1180
- 1024×768
- 1280×800
- 1440×900

Also test a constrained-height viewport when sticky navigation, game HUDs, dialogs, or overlays are involved.

Verify no unexpected page-level horizontal scroll, usable navigation, intentional grid reflow, reachable controls, stable media, local table/code scrolling, readable sticky UI, and working primary interactions.

## Deterministic guardrail

Run:

```bash
npm run verify:responsive
```

This catches shared responsive contract regressions and known breakpoint conflicts. It supplements rendered QA.

## Release handoff

For release-bound work:

1. `npm run verify:responsive`;
2. relevant feature verification;
3. lint/typecheck/build;
4. rendered desktop/tablet/mobile QA;
5. PR review on the exact head SHA;
6. release pipeline and live-route verification.
