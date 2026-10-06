# DTF Seeds Site Audit Improvement Plan

Spec: docs/superpowers/specs/2026-10-05-site-audit-improvement-design.md
Base branch: main

## Task 1 — Canonical tool catalog

Create `lib/tool-catalog.ts` containing all tool-hub entries with explicit ownership and role metadata. Export derived `primaryTools`, `supportingTools`, `liveToolCount`, and `connectedReferenceCount`.

Expected: public tool inventory has one source of truth.

## Task 2 — Tool catalog regression verifier

Create `scripts/verify-tool-catalog.mjs`.

It must reject duplicate IDs/hrefs, missing Next-owned pages, unregistered direct `app/tools/*/page.tsx` routes, and a tools hub that no longer imports the registry.

Expected: `npm run verify:tool-catalog` exits 0 on the intended tree and exits non-zero when ownership/inventory drifts.

## Task 3 — Consume registry in the tools hub

Replace local `primaryTools` and `supportingTools` arrays in `app/tools/page.tsx` with imports from the catalog. Expose derived live/reference counts in the intro without adding a separate dashboard.

Expected: the hub cannot display a manually maintained inventory count.

## Task 4 — Release gate integration

Add `verify:tool-catalog` to package scripts and include it in the aggregate `verify` command.

Expected: pull-request CI blocks tool inventory drift.

## Task 5 — Full verification and review

Open a PR against `main`, let GitHub Actions run the repository verification gate, inspect any failures, and correct regressions before merge.
