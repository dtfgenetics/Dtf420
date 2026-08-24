# DTF420 Architecture

## Purpose

DTF420 is the application-oriented side of the DTF ecosystem. It owns games, cultivation education, interactive tools, and community features. DTFSeeds remains a separate genetics-focused project and repository.

## Initial stack

- Next.js App Router
- TypeScript
- React
- Phaser for browser games
- Node.js 22
- Hostinger Business Web Hosting for the web application

## Game boundary

Phaser is loaded only from a client component. The Next.js page remains free to use normal server rendering while the game canvas is isolated behind a client-only dynamic import.

The first game, Burn Buds, is intentionally small during bootstrap. Its first job is to prove rendering, responsive scaling, lifecycle teardown, and production build compatibility.

## Multiplayer boundary

Do not place an authoritative WebSocket game server inside Hostinger Business Web Hosting. The future multiplayer service is a separate deployment that can accept incoming WebSocket connections. The browser game client will connect to that service through a dedicated endpoint such as `game.dtf420.com`.

## Repository rule

This repository must not contain the DTFSeeds application or share deployment secrets with it.
