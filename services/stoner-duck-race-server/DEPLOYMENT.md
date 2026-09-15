# Stoner Duck Race multiplayer deployment

The multiplayer service is a standalone Colyseus process. It runs the same deterministic race simulation as the browser build and owns authoritative race state for online rooms.

## Runtime requirements

- Node.js 22 or newer
- WebSocket-capable hosting
- A public HTTPS/WSS endpoint
- The repository root available during the build because the server compiles the shared `game/stoner-duck-race` modules

## Build and start

From `services/stoner-duck-race-server`:

```bash
npm install --no-package-lock --no-audit --no-fund
npm run typecheck
npm run build
npm start
```

`npm run build` compiles the server and shared deterministic game modules into `build/`. `npm start` runs the compiled JavaScript with plain Node; production does not depend on `tsx`.

The compiled entry is:

```text
build/services/stoner-duck-race-server/src/index.js
```

## Environment

`PORT` is optional and defaults to `2567`.

Example:

```bash
PORT=2567 npm start
```

The site needs the public server origin at build time:

```text
NEXT_PUBLIC_DUCK_RACE_SERVER_URL=https://multiplayer.example.com
```

The browser adapter uses that endpoint for Colyseus room creation, join-by-ID, state synchronization, and input messages. Do not configure this variable until the endpoint is actually reachable; the site intentionally fails closed when it is absent.

## Health check

The service exposes:

```text
GET /healthz
```

A healthy response is HTTP 200 JSON containing `ok: true`, service identity, racer capacity, spectator target, and process uptime.

Recommended platform health-check path: `/healthz`.

## Reverse proxy / load balancer

The public endpoint must preserve WebSocket upgrade headers and long-lived connections. Do not place the Colyseus endpoint behind a proxy configuration that strips `Upgrade` / `Connection` headers or forces short HTTP request timeouts.

## Capacity

Each race room supports up to 50 active racer slots plus the configured spectator target. Capacity testing should be performed before raising concurrency limits or autoscaling targets.

## Release checklist

1. `npm run typecheck` passes.
2. `npm run build` produces the compiled entry.
3. `/healthz` returns HTTP 200 after launch.
4. WebSocket upgrade works through the public hostname.
5. Create Room succeeds from the production site.
6. A second browser can join by room ID or `?duckRoom=` invite URL.
7. Host start, racer input, spectators, disconnect-to-AI, host migration, and finish state are verified.
8. Set `NEXT_PUBLIC_DUCK_RACE_SERVER_URL` only after steps 1–7 pass.
