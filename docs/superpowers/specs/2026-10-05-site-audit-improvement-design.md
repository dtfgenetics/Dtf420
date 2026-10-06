# DTF Seeds Site Audit Improvement Design

Date: 2026-10-05
Repository: dtfgenetics/Dtf420
Base: main

## Goal

Reduce production drift across dtfseeds.com by making public inventory and release status derive from canonical registries instead of duplicated page copy. Preserve the current information architecture and shared site shell.

## Findings addressed in this slice

1. The site shell is centralized in `configuration/site-shell.json`, but tool inventory is still embedded directly in `app/tools/page.tsx`.
2. Games already have a catalog/runtime contract and verification, showing the correct pattern for other site systems.
3. The tools hub currently has two Next-owned tool routes plus connected learning references, but there is no machine-checkable contract ensuring the hub and route tree remain aligned.
4. The production site has previously shown stale inventory/status copy, so public counts should be derived rather than manually written.

## Design

Create `lib/tool-catalog.ts` as the canonical registry for the tools hub. Each entry declares identity, title, description, href, role, ownership, and optional presentation metadata.

The tools page consumes the registry instead of declaring local arrays. Public summary copy derives the live workspace and connected-reference counts from the registry.

Add `scripts/verify-tool-catalog.mjs` to fail when:
- IDs or hrefs are duplicated.
- A Next-owned tool in the catalog has no page route.
- A direct `app/tools/*/page.tsx` route is missing from the catalog.
- The tools page stops consuming the canonical catalog.

Wire the verifier into `npm run verify` so pull requests cannot silently reintroduce inventory drift.

## Non-goals

- Do not migrate the full Tools repository in this slice.
- Do not redesign individual GrowLens or Grow Doc interfaces.
- Do not change WordPress ownership boundaries.
- Do not relabel preview software as production-ready.

## Verification

Required checks:
- `npm run verify:tool-catalog`
- `npm run verify:routes`
- `npm run verify:site-shell`
- `npm run typecheck`
- `npm run build`

The repository Verify workflow remains the merge gate.
