# DTF420 Deployment

## Deployment rule

GitHub is the source of truth. Do not upload a separate copy of the application to production and do not edit production files directly on the host.

The current public `dtf420.com` site must remain untouched until the replacement application has passed staging verification.

## Authoritative production settings

- Repository: `dtfgenetics/Dtf420`
- Production branch: `main`
- Runtime: Node.js 22
- Package manager: npm
- Lockfile: `package-lock.json`
- Locked install: `npm ci`
- Build command: `npm run build`
- Start command: `npm run start`
- Health check: `/api/health`

## Required path for every change

```text
feature/fix/dependabot branch
        ↓
pull request
        ↓
Verify workflow
        ↓
locked npm install
        ↓
ESLint
        ↓
TypeScript
        ↓
production Next.js build
        ↓
merge to main
        ↓
Hostinger staging deployment
        ↓
health + browser verification
        ↓
production deployment/cutover
```

## Hostinger staging setup

Create the new Node.js application as a separate Hostinger web app. Do not replace the existing public DTF420 website during bootstrap.

Use these values when connecting the application:

1. Connect GitHub repository `dtfgenetics/Dtf420`.
2. Select branch `main`.
3. Select Node.js 22 when a runtime choice is shown.
4. Use the repository root as the application root.
5. Build with `npm run build`.
6. Start with `npm run start`.
7. Use the generated temporary Hostinger address first.
8. Do not point `dtf420.com` at the new application yet.

If Hostinger exposes a custom dependency-install command, use `npm ci`. The committed lockfile must remain the dependency source of truth.

## Staging acceptance test

A staging deployment is accepted only when all of the following pass:

- `/api/health` returns HTTP 200 and `status: "ok"`.
- `/` loads without a server error.
- `/games` loads.
- `/games/burn-buds` loads and the Phaser canvas initializes in a browser.
- `/learn`, `/tools`, and `/community` load directly and after browser refresh.
- Android/mobile layout is usable.
- Desktop layout is usable.
- Browser console has no blocking runtime errors.
- A fresh GitHub change merged to `main` causes the staging deployment to update without manual file copying.

## Branch protection requirement

Before production deployment, protect `main` in GitHub so normal changes cannot bypass verification.

Required repository rule:

- require a pull request before merging
- require the `verify` status check
- require the branch to be up to date before merging
- block force pushes
- block deletion of `main`
- no additional human approval requirement is necessary while this remains a solo-maintained repository

## Rollback

Keep the existing public DTF420 site available until the replacement is proven. Keep the GitHub branch `backup/pre-reconcile-main` until the new deployment has been stable and the archived Atlas material has been migrated.

If staging fails, do not change the production domain. Fix the failure on a branch, rerun verification, and redeploy staging.

## Atlas preservation

The previous static THC Living Plant Atlas prototype is preserved under `legacy/atlas-static/`. Its structured source/data directories remain in `content/`, `configuration/`, and `downloadables/` for migration into the Next.js application. The old root GitHub Pages deployment is intentionally retired.

## Security hold

The new application must not replace the public production site until the scheduled August 26, 2026 Next.js security update has been applied and the full verification/staging path passes again.
