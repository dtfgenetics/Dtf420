# Approved external building blocks

This file records third-party projects that are good candidates for DTF/THC work. It exists to prevent agents from repeatedly reinventing solved infrastructure or copying arbitrary code without checking licensing and maintenance.

## Adoption rule

Prefer a maintained package or narrowly adapted documented pattern over copying a repository wholesale. Preserve license notices when code is adapted. Do not add a dependency until it solves a real product need and passes Node 22 / Next.js / React compatibility checks.

## Approved candidates

| Problem | Candidate | License | Use |
| --- | --- | --- | --- |
| Static whole-site search | Pagefind (Pagefind/pagefind) | MIT | **Preferred primary search** for the growing THC corpus. Index the generated static HTML after export so courses, encyclopedia pages, glossary, Atlas, SOPs, tools and troubleshooting do not need their source JSON bundled into the search page. Low-bandwidth segmented indexes, ranking, filters/metadata and Web Worker search fit the static-overlay deployment model. |
| In-memory application search | MiniSearch (lucaong/minisearch) | MIT | Keep as a fallback for small dynamic datasets or app-local search where documents already exist in memory. Do not use it as the primary whole-education index while the search page would need to import the entire content corpus. |
| Performance/accessibility regression budgets | Lighthouse CI (GoogleChrome/lighthouse-ci) | Apache-2.0 | PR/release regression reporting and performance budgets. Keep this supplemental to deterministic repository checks; it must not replace them. |
| Authoritative multiplayer rooms | Colyseus (colyseus/colyseus) | MIT | Only for games that truly require server-authoritative realtime rooms, reconnects and state synchronization. Do not create a second authority for a title that already has a canonical backend. |
| Authentication / authorization | Better Auth (better-auth/better-auth) | MIT | Preferred candidate for new learner identity, sessions, account security and certification authorization work. Evaluate database adapter and migration plan before adoption. |
| Runtime schema validation | Zod (colinhacks/zod) | MIT | Validate assessment submissions, API inputs, route registries, tool inputs and imported datasets at runtime. |
| Typed database access | Drizzle ORM (drizzle-team/drizzle-orm) | Apache-2.0 | Candidate for certification attempts, learner progress, credentials and other SQL-backed state if the chosen hosting/database target supports it. |
| QR verification / scanning | ZXing JS (zxing-js/library) | Apache-2.0 | Candidate for credential verification QR workflows where scanning/decoding is required. |

## Do not adopt yet

- Do not add an external search service until the local corpus is too large for a generated client/server index.
- Do not migrate released multiplayer games merely because Colyseus exists.
- Do not add authentication until the persistent user/progress schema and hosting database decision are documented.
- Do not add a browser automation framework to routine production QA. Repository standards explicitly favor deterministic Node/static/build validation.

## Next evaluation order

1. Pagefind for unified THC search; retain the existing custom search UI and feed it Pagefind results rather than replacing the UI wholesale.
2. Better Auth + database adapter for learner identity.
3. Zod for assessment/API/data contracts.
4. Drizzle after the database target is selected.
5. Lighthouse CI as supplemental regression reporting.
6. ZXing for certificate verification after credential issuance is implemented.
