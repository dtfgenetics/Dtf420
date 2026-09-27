# Approved external building blocks

This file records third-party projects that are good candidates for DTF/THC work. It exists to prevent agents from repeatedly reinventing solved infrastructure or copying arbitrary code without checking licensing and maintenance.

## Adoption rule

Prefer a maintained package or narrowly adapted documented pattern over copying a repository wholesale. Preserve license notices when code is adapted. Do not add a dependency until it solves a real product need and passes Node 22 / Next.js / React compatibility checks.

## Approved candidates

| Problem | Candidate | License | Use |
| --- | --- | --- | --- |
| Unified local full-text search | MiniSearch (lucaong/minisearch) | MIT | Courses, encyclopedia, glossary, Atlas, tools, SOPs and troubleshooting search. Prefix/fuzzy search, field boosting and suggestions without a search server. |
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

1. MiniSearch for unified THC search.
2. Better Auth + database adapter for learner identity.
3. Zod for assessment/API/data contracts.
4. Drizzle after the database target is selected.
5. Lighthouse CI as supplemental regression reporting.
6. ZXing for certificate verification after credential issuance is implemented.
