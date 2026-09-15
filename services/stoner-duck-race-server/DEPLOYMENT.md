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
npm run smoke
npm start
```

`npm run build` compiles the server and shared deterministic game modules into ESM under `build/`. `npm start` runs the compiled JavaScript with plain Node; production does not depend on `tsx`.

The compiled entry is:

```text
build/services/stoner-duck-race-server/src/index.js
```

The smoke suite executes the compiled production simulation across all eight tracks with 50 racers, repeats every race with the same seed, and requires exact deterministic finish records.

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

The browser adapter uses that endpoint for Colyseus room creation, join-by-ID, state synchronization, input messages, and automatic reconnection. Do not configure this variable until the endpoint is actually reachable; the site intentionally fails closed when it is absent.

## Health check

The service exposes:

```text
GET /healthz
```

A healthy response is HTTP 200 JSON containing `ok: true`, service identity, racer capacity, spectator target, and process uptime.

Recommended platform health-check path: `/healthz`.

## Reconnection behavior

Temporary network drops receive a 20-second server reconnection grace window.

During that window:

- the racer keeps the same session/duck ownership;
- the duck temporarily switches to AI so stale input does not freeze it in the river;
- the player is counted as reconnecting rather than actively connected;
- the browser SDK performs bounded automatic retries and keeps a small outgoing-message queue;
- successful reconnection restores human control to the same duck.

Only a permanent leave after the grace window releases the duck and triggers host migration when required.

This behavior should be tested through the actual public reverse proxy, not only localhost, because mobile network switches and WebSocket proxy timeouts are deployment-dependent.

## Reverse proxy / load balancer

The public endpoint must preserve WebSocket upgrade headers and long-lived connections. Do not place the Colyseus endpoint behind a proxy configuration that strips `Upgrade` / `Connection` headers or forces short HTTP request timeouts.

Proxy/load-balancer idle timeouts must be long enough to avoid disconnecting healthy rooms. Reconnection grace is a recovery path, not a substitute for correct WebSocket configuration.

## Capacity

Each race room supports up to 50 active racer slots plus the configured spectator target. CI verifies deterministic completion for the full 50-racer field, but public launch still needs concurrent-room bandwidth/load profiling before raising autoscaling targets.

## Release checklist

1. `npm run typecheck` passes.
2. `npm run build` produces the compiled ESM entry.
3. `npm run smoke` passes all eight 50-racer deterministic course tests.
4. `/healthz` returns HTTP 200 after launch.
5. WebSocket upgrade works through the public hostname.
6. Create Room succeeds from the production site.
7. A second browser can join by room ID or `?duckRoom=` invite URL.
8. Host start, racer input, spectators, temporary disconnect-to-AI, reconnect-to-same-duck, permanent leave, host migration, and finish state are verified.
9. Set `NEXT_PUBLIC_DUCK_RACE_SERVER_URL` only after steps 1–8 pass.
