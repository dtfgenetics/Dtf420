# Deployment

## Current rule

Do not replace the existing `dtf420.com` website during bootstrap.

The new application must pass:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. Browser verification on desktop and mobile
5. Hostinger staging deployment verification

Only after those checks pass should the production domain be switched.

## Hostinger target

The web application is designed for Hostinger Business Web Hosting as a Node.js web app deployed from GitHub.

- Runtime: Node.js 22
- Build command: `npm run build`
- Start command: `npm run start`
- Repository: `dtfgenetics/Dtf420`

## Security hold

On August 20, 2026, Next.js announced a scheduled August 26 security release covering the 16.3 and 15.5 lines, including one critical issue. This bootstrap uses the current 16.3 line for compatibility testing, but it must not be exposed as a production deployment until the security patch is applied and verification passes again.

## Rollback

The existing public DTF420 site remains untouched until the replacement has been verified. Domain cutover is a separate operation from code deployment.
