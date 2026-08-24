# DTF420 Update Policy

This project is designed so routine code, dependency, and tooling updates are easy to apply without bypassing verification.

## Source of truth

GitHub is the source of truth. Do not edit production files directly on the host.

## Routine dependency updates

Dependabot checks npm packages and GitHub Actions every week and opens pull requests when updates are available.

- Minor and patch npm updates are grouped by runtime vs development dependencies.
- Minor and patch GitHub Actions updates are grouped.
- Major updates remain separate so they receive explicit review.
- No dependency update should be merged only because it is available; the Verify workflow must pass first.

## Code changes

Use a branch and pull request for normal changes. Every pull request runs the same verification used for dependency updates.

Required verification command:

```bash
npm run verify
```

That runs:

1. ESLint
2. TypeScript type checking
3. A production Next.js build

## Deterministic installs

`package-lock.json` is committed. CI and deployment should install with:

```bash
npm ci
```

This ensures the tested dependency tree is the one being installed.

## Manual verification

The Verify GitHub Action can also be started manually from the Actions tab. Use this after hosting/runtime changes or whenever a clean verification run is wanted without changing code.

## Higher-risk upgrades

Treat these as explicit upgrade work, not routine automatic merges:

- Node.js major versions
- Next.js major versions
- React major versions
- Phaser major versions
- TypeScript major versions
- ESLint major versions
- Authentication/database changes
- Multiplayer protocol/server changes
- Deployment workflow changes

For these, update on a branch, read migration notes, run Verify, test staging, and only then merge.

## Deployment

Production should deploy from `main` only. A staging deployment should be used before a production domain cutover or for major runtime/game-engine changes.

Never upload a different copy of the application manually to production, because that creates code drift from GitHub.

## Security updates

Security fixes take priority over the weekly update cycle. Apply them in a dedicated branch/PR and run the same Verify workflow before deployment whenever possible.

GitHub Dependabot alerts and security updates should be enabled in repository Code security settings so security advisories are surfaced automatically.
