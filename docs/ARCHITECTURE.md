# DTF Genetics Web Architecture

## Purpose

This repository powers the unified DTF Genetics web experience. Its canonical production origin is `https://dtfseeds.com`, and the application brings genetics references, Teaching Healthy Cultivation education, tools, games, community content, and editorial surfaces into one routed Next.js system.

## Application stack

- Next.js App Router
- TypeScript
- React
- Phaser for Phaser-based browser games
- Node.js 22
- Hostinger Business Web Hosting as the current web-hosting target
- Playwright for desktop/mobile browser QA

## Product areas

The application currently owns these public route families:

- `/seeds` — genetics project records
- `/learn` — Teaching Healthy Cultivation, Academy, Living Plant Atlas, plant-health references, symptom differentials, evidence, and printable learning tools
- `/tools` — interactive cultivation tools and methodology pages
- `/games` — browser games and game-release documentation
- `/community` — community programs and event surfaces
- `/journal` — editorial and educational publishing
- `/about` and `/contact` — organization and support-routing information

Shared navigation, metadata, redirects, canonical URLs, robots rules, and sitemap generation belong to this application rather than to separate microsites.

## Education content boundary

Education content is data-driven where possible. Canonical datasets live under `content/`, while rendering components and route shells live under `app/learn` and `components/`. Integrity scripts under `scripts/` verify routes, evidence mappings, diagnostic cases, Atlas learning data, and related links before merge.

Scientific claims should be connected to the evidence system when supporting sources are available. Internal production backlog language should not appear on public lesson pages.

## Game boundary

Phaser is loaded from client-side game components so the surrounding Next.js routes can retain normal server-rendering behavior. Games that do not need Phaser can use ordinary React/client components.

A title should be presented as playable only when its public route, runtime, controls, and browser QA are functioning. Concepts and incomplete migrations should remain visually distinct from released games.

## Multiplayer boundary

Do not place an authoritative long-lived WebSocket game server inside hosting that cannot reliably accept and maintain those connections. Real-time multiplayer, when a game requires it, should use a separate service with a dedicated endpoint while the browser client remains part of this application.

## Repository rules

- Do not commit deployment secrets, API keys, private credentials, or user data.
- Keep public routes and sitemap entries synchronized.
- Preserve canonical URLs and redirects when replacing legacy content.
- Run `npm run verify` and desktop/mobile Browser QA before production cutover.
- Treat production domain changes as a separate, reversible operation from merging application code.

See `docs/DEPLOYMENT.md` for release and rollback requirements.
