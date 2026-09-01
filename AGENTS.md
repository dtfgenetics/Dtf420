# DTF420 Agent Guidance

For any change intended to reach production, load and follow `$dtf-release-pipeline` from `.agents/skills/dtf-release-pipeline/SKILL.md`. Treat development, release verification, merge, deployment, and public live verification as separate states.

## Current production authority

This repository owns the unified Next.js application code and future migration/cutover package. It is **not currently the whole-site production deployment authority for `dtfseeds.com`**.

Until a documented cutover replaces the current decision, `dtfgenetics/Thc` owns live route mapping, WordPress/static production orchestration, protected deployment/reconciliation workflows, rollback controls, and visitor-facing release verification. A route implemented here must not overwrite its current production owner merely because both repositories contain that route.

For a future route cutover, identify the current owner, validate equivalent or better behavior/content, preserve rollback data, eliminate dual writers, deploy through a reviewed production lane, and verify the public route before changing the ownership claim.

For any browser-game task in this repository, also load and follow `$dtf-game-router` from `.agents/skills/dtf-game-router/SKILL.md` before editing game code.

Use the router to compose the project skills under `.agents/skills/` for Phaser runtime work, asset recovery, mobile UI, board/card rules, multiplayer lobbies, playtesting, and game-specific deployment verification.

Project-wide rules:

- Inspect and repair existing implementations before creating replacements.
- Preserve the pinned framework/engine versions unless a migration is explicitly requested.
- Reuse approved repository assets and existing verified content before generating replacements.
- Preserve newer verification, route, content, and package-script changes when reconciling stale branches.
- Treat mobile usability, broken asset paths, console errors, dead routes, redirects to the wrong page, and production/source mismatches as release defects.
- Add or preserve feature-specific verification and rendered Browser QA for substantive user-facing changes when practical.
- Do not merge a moving development branch based on stale green CI; freeze a fixed release candidate and validate the exact SHA.
- Do not bypass a failing or cancelled release gate.
- Follow `docs/DEPLOYMENT.md` for Hostinger staging and any explicitly approved production cutover, rollback, and live-route verification.
- Do not claim anything is live until the public production route is verified after deployment.

Game-specific architecture rules:

- Keep canonical gameplay state serializable and separate from Phaser/React rendering state.
- Reuse approved game assets before generating placeholders or replacement art.
- Verify the primary gameplay loop and phone-sized controls before release.
