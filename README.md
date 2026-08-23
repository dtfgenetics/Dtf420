# DTF420

New application codebase for the DTF420 platform.

## Status

Bootstrap validation in progress. The current milestone proves that Next.js, TypeScript, and Phaser can build together cleanly before full Burn Buds gameplay, multiplayer, education, tools, or content migration are added.

The bootstrap branch is verified by GitHub Actions before it can be considered for merge.

## Stack

- Node.js 22
- Next.js 16
- React 19
- TypeScript
- Phaser 4

## Local commands

```bash
npm install
npm run dev
npm run verify
```

`npm run verify` runs ESLint, TypeScript checking, and a production Next.js build.

## Project boundaries

- DTF420 owns games, education, tools, and community features.
- DTFSeeds remains a separate repository and production site.
- Multiplayer WebSocket hosting will be a separate service; it will not be embedded into Hostinger Business Web Hosting.

See `docs/ARCHITECTURE.md` and `docs/DEPLOYMENT.md`.
