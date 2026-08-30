# Deployment

## Current rule

`https://dtfseeds.com` is the only production website target for this application. Do not deploy application routes, staging cutovers, canonical metadata, redirects, health identities, or public links to `dtf420.com` or any other brand domain.

Treat production cutover as a separate release step from merging application code. The application uses `https://dtfseeds.com` as its canonical production origin, but production traffic should move only after the candidate build has passed the repository gates and a staging deployment has been checked on the target host.

GitHub `main` is the application source of truth. Do not maintain a separate hand-edited production copy of this application on the host.

A release candidate must pass:

1. `npm run verify` — feature/content/data integrity checks, lint, typecheck, and production build
2. Browser QA on desktop and mobile
3. Hostinger staging deployment verification
4. `/api/health` readiness check on the deployed Node application
5. Smoke tests for primary routes, canonical metadata, sitemap/robots output, and playable game routes

Do not bypass a failing or cancelled gate to perform a production cutover.

## Hostinger target

The web application is designed for Hostinger Business Web Hosting as a Node.js web app deployed from GitHub.

- Runtime: Node.js 22
- Package manager: npm using the committed lockfile
- Install command when configurable: `npm ci`
- Build command: `npm run build`
- Start command: `npm run start`
- Repository: `dtfgenetics/Dtf420`
- Production branch: `main`
- Application root: repository root
- Health endpoint: `/api/health`
- Health service identity: `dtfseeds-web`
- Canonical production origin: `https://dtfseeds.com`

Use a Hostinger staging/temporary address first when establishing or repairing the Node deployment. A staging hostname is only a temporary validation surface; it must never become a canonical URL or public navigation target. Do not replace the working public site until staging has passed the acceptance checks below.

## Staging acceptance

A Hostinger staging candidate is accepted only when all of the following are true:

- the host reports a successful build/start for the intended `main` commit
- `/api/health` returns HTTP 200 with `status: "ok"`, `service: "dtfseeds-web"`, `canonicalOrigin: "https://dtfseeds.com"`, and `runtime: "nodejs"`
- `/` loads without a server error
- `/learn`, `/tools`, `/games`, `/seeds`, and `/community` load directly after a hard refresh
- changed feature routes load directly rather than redirecting to a hub or fallback
- changed games render required assets and complete their primary tested interaction
- Android/phone-sized layout remains usable
- desktop layout remains usable
- browser/runtime errors do not block the changed experience
- a fresh merged GitHub change can be reflected by the staging deployment without manual file copying
- canonical tags, sitemap URLs, robots references, public links, and production redirects resolve only to `https://dtfseeds.com`

Only after staging passes should the dtfseeds.com production deployment be promoted.

## Production smoke test

After production deployment, hard-refresh the public `dtfseeds.com` routes affected by the release and verify the merged behavior. At minimum check `/api/health`, `/`, and every route changed by the release.

A mismatch between public production and `main` means deployment/source reconciliation is still incomplete. Do not fix that mismatch by deleting newer `main` work or uploading an arbitrary older build over production.

## Security baseline

The August 2026 Next.js security release was published on August 25, 2026. Next.js 16.3.3 is the patched Active LTS release for the two Critical vulnerabilities disclosed in that release. This repository is pinned to `next` 16.3.3 and `eslint-config-next` 16.3.3, so the earlier pre-release security hold no longer applies.

Security status must still be re-evaluated before a production cutover whenever framework dependencies change or a new vendor security advisory is published. A successful historical build is not sufficient evidence after a security-sensitive dependency change.

Vendor references:

- https://nextjs.org/blog
- https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36
- https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4

## Rollback

Keep the previously working production deployment available until the replacement release has passed staging verification and post-cutover smoke tests. Domain/DNS changes and application deployment should remain independently reversible where the hosting setup allows it.

If staging fails, leave production unchanged and repair the candidate on a branch. If post-cutover checks fail, restore dtfseeds.com traffic to the last verified deployment before diagnosing nonessential follow-up work.
