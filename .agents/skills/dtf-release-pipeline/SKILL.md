---
name: dtf-release-pipeline
description: >
  Freeze, verify, merge, deploy, and live-check DTF420 changes without letting active development invalidate release evidence. Use for any site, education, genetics, tools, community, or game change that is intended to reach dtfseeds.com; for stale or stacked pull requests; for cancelled CI caused by moving branches; and for deployment/live-status work.
---

# DTF Release Pipeline

Use this skill for every change that is intended to become a release. Development and release are separate phases.

A commit is not a deployment. A merge is not a deployment. A deployment is not live-verified until the public route has been opened and tested after the host accepted the release.

## Core rule: freeze the candidate

Do not run final release approval against an actively changing development branch.

When a feature branch is still receiving commits, or when CI keeps cancelling because a newer commit supersedes the run:

1. Identify the newest coherent development SHA that should be considered for release.
2. Confirm it is based on, or cleanly reconciled with, current `main`.
3. Create a dedicated immutable-style release branch from that exact SHA using a name such as `release/<area>-YYYY-MM-DD`.
4. Open a non-draft release PR from the frozen branch to `main`.
5. Do not add unrelated development work to that release branch.
6. If the release candidate itself needs a fix, make the smallest release-specific patch, record the new SHA, and restart the gates on that exact SHA.

Ongoing development may continue on the feature branch while the release branch remains stable.

## Reconcile stale or stacked work first

Never merge a stale branch just because its historical CI was green.

For a stale, stacked, or conflicted PR:

1. Compare it with current `main`.
2. Identify the intended delta rather than replaying obsolete intermediate commits.
3. Recreate or reconcile that delta on current `main` when necessary.
4. Preserve newer verification scripts, routes, content, and package scripts already present on `main`.
5. Avoid replacing whole files when a narrow merge of the intended behavior is safer.
6. Close or supersede obsolete PRs so they cannot be merged accidentally.

## Required release gates

A release candidate must pass the repository's current gates on the exact release SHA.

Minimum project gates:

1. feature-specific verification scripts when present
2. `npm run verify`
3. lint
4. TypeScript typecheck
5. production build
6. Browser QA on desktop and phone-sized viewports
7. route and asset checks relevant to the changed area

For interactive features, Browser QA must exercise the actual rendered interaction, not only confirm that a route returns HTML.

Examples:

- game: open the game, verify assets, exercise the primary play loop, check keyboard/touch controls
- Learn: open the changed learning route, follow important navigation/search links, check mobile overflow
- Tools: open each changed tool, exercise its primary control flow, check mobile layout
- Genetics: open listing and detail routes, confirm content/asset rendering and literal links
- Community: open index/detail routes and verify records/navigation

Do not remove or weaken a failing test merely to make CI green. Fix the application or update only genuinely obsolete test contracts when the intended UI has changed.

## Exact-SHA merge rule

Immediately before merging:

1. Fetch the release PR head SHA.
2. Confirm the required workflow runs for that SHA ended in `success`.
3. Confirm the PR is mergeable and non-draft.
4. Merge using an expected-head-SHA guard when available.

If the head moved after validation, do not reuse the old green result. Validate the new SHA.

## CI cancellation handling

A cancelled workflow is not a pass and is not automatically a failure.

When CI is cancelled:

- check whether the branch head moved
- if the head moved, validate the newer candidate or freeze a release branch
- if the head did not move and cancellation was infrastructure/concurrency related, rerun the cancelled job
- never merge because all completed steps before cancellation happened to be green

Repeated cancellation from active development is a signal to freeze a release candidate.

## Deployment stage

Follow `docs/DEPLOYMENT.md` for host-specific release rules.

Current intended production shape:

- Hostinger Node.js application
- Node.js 22
- build: `npm run build`
- start: `npm run start`
- repository: `dtfgenetics/Dtf420`
- canonical origin: `https://dtfseeds.com`

Do not convert the app to a static export just to simplify deployment unless the architecture is explicitly changed and verified.

Before production cutover:

1. deploy the merged candidate to Hostinger staging or the configured Node deployment target
2. confirm the host built and started the expected commit
3. smoke-test primary changed routes on staging
4. preserve the previous working deployment for rollback
5. only then promote/cut over production

If the available tooling cannot access Hostinger's actual Node/Git deployment controls, state that as the deployment blocker rather than pretending the GitHub merge made the change live.

## Live verification

After deployment, hard-refresh public routes on `dtfseeds.com` and verify the changed behavior.

Check, as applicable:

- route returns the intended page instead of redirecting to a hub/fallback
- visible copy matches the merged release
- navigation works into and out of the route
- public assets load with correct case-sensitive paths
- no obvious browser/runtime error blocks use
- primary interaction works
- phone-sized layout is usable
- metadata/sitemap/robots changes appear when part of the release

A public production mismatch with `main` means deployment/source reconciliation is still incomplete.

## Status vocabulary

Use these states precisely:

- `developed`: implementation exists on a working branch
- `release-frozen`: a fixed candidate branch/PR exists
- `verified`: required CI gates passed on the exact release SHA
- `merged`: candidate is in `main`
- `deployed`: target host accepted and started the release
- `live-verified`: public dtfseeds.com behavior was tested after deployment

Never collapse these into the word `live`.

## Apply this to everything

This pipeline is repository-wide, not game-only.

For every substantive site change intended for production:

1. repair/reconcile on current `main`
2. add or preserve feature-specific verification
3. add rendered Browser QA for the changed user-facing behavior when practical
4. freeze a release candidate if development is still moving
5. require both Verify and Browser QA on the exact candidate SHA
6. merge with an expected SHA guard
7. deploy through the configured Hostinger Node path
8. smoke-test staging and then public production
9. report the exact final state using the status vocabulary above

## Completion report

For every release, report:

- feature/area released
- release branch and PR when used
- exact validated head SHA
- Verify result
- Browser QA result
- merge commit
- deployment target/status
- public routes tested
- final state: developed, release-frozen, verified, merged, deployed, or live-verified
- exact remaining blocker, if any
