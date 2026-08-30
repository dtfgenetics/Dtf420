---
name: dtf-game-deploy
description: >
  Prepare, verify, and troubleshoot DTF420 browser-game changes for production on dtfseeds.com. Use for failed builds, broken game routes, missing production assets, deployment regressions, stale releases, CI failures, or claims that a game should now be live.
---

# DTF Game Deploy

Never equate a committed change with a live game. Deployment is complete only after the production route is verified.

## Pre-deploy checks

Inspect the current repository scripts and deployment configuration before changing them.

Run or reason through the narrowest relevant checks first, then the project gates when practical:

1. game-specific verification scripts if present
2. lint
3. TypeScript typecheck
4. production build
5. route/asset verification

Do not remove failing verification from the pipeline just to make the build green.

## Production-risk checklist

- game route is included in the active Next.js app
- route does not depend on local-only files or dev-server behavior
- public asset paths are correct for production
- filename case matches exactly
- client-only APIs are not executed during server rendering
- Phaser initialization occurs only in a browser environment
- React/Phaser cleanup prevents duplicate instances after navigation
- dynamic imports and lazy-loaded assets resolve in the production build
- environment-dependent features fail clearly when configuration is absent
- no secret or private key is exposed to the browser bundle

## Diagnose failed pushes/deployments

When a deployment or merge failed:

1. Identify the exact failing commit/workflow/build log when available.
2. Reproduce the relevant failure from repository state rather than guessing.
3. Separate code failure, content failure, asset failure, dependency failure, and deployment-platform failure.
4. Repair the root cause in the smallest coherent patch.
5. Re-run the affected checks.
6. Confirm newer commits did not already supersede the failing code before resurrecting old changes.

## Route verification

For each changed game:

- verify the intended URL/route exists
- hard-refresh the route rather than relying on client navigation
- verify navigation into and out of the game
- check browser console/network failures
- verify required visual assets render
- verify at least the primary gameplay loop
- check a phone-sized viewport

## Live-site claims

Use precise status language:

- `committed` means source is in GitHub
- `build verified` means the production build passes
- `deployed` means the hosting platform accepted the release
- `live verified` means the public dtfseeds.com route was opened and tested after deployment

Never call a game live based only on a GitHub commit or successful local build.

## Completion report

State:

- files/areas changed
- checks run and their outcome
- commit or pull-request status when relevant
- production route checked
- whether the change is committed, build-verified, deployed, or live-verified
- exact remaining blocker, if any
