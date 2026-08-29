# Deployment

## Current rule

Treat domain cutover as a separate release step from merging application code. The application uses `https://dtfseeds.com` as its canonical production origin, but production traffic should move only after the candidate build has passed the repository gates and a staging deployment has been checked on the target host.

A release candidate must pass:

1. `npm run verify` — content/data integrity checks, lint, typecheck, and production build
2. Browser QA on desktop and mobile
3. Hostinger staging deployment verification
4. Smoke tests for primary routes, canonical metadata, sitemap/robots output, and playable game routes

Do not bypass a failing gate to perform a domain cutover.

## Hostinger target

The web application is designed for Hostinger Business Web Hosting as a Node.js web app deployed from GitHub.

- Runtime: Node.js 22
- Build command: `npm run build`
- Start command: `npm run start`
- Repository: `dtfgenetics/Dtf420`
- Canonical production origin: `https://dtfseeds.com`

## Security baseline

The August 2026 Next.js security release was published on August 25, 2026. Next.js 16.3.3 is the patched Active LTS release for the two Critical vulnerabilities disclosed in that release. This repository is pinned to `next` 16.3.3 and `eslint-config-next` 16.3.3, so the earlier pre-release security hold no longer applies.

Security status must still be re-evaluated before a production cutover whenever framework dependencies change or a new vendor security advisory is published. A successful historical build is not sufficient evidence after a security-sensitive dependency change.

Vendor references:

- https://nextjs.org/blog
- https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36
- https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4

## Rollback

Keep the previously working production deployment available until the replacement release has passed staging verification and post-cutover smoke tests. Domain/DNS changes and application deployment should remain independently reversible where the hosting setup allows it.

If post-cutover checks fail, restore traffic to the last verified deployment before diagnosing nonessential follow-up work.
