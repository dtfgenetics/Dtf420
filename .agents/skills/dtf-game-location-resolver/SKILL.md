---
name: dtf-game-location-resolver
description: Use when an older Dtf420 game workflow asks for production ownership or game-location resolution. Compatibility wrapper for dtf-game-development and the canonical game-registry-v2.
metadata:
  author: dtfgenetics
  version: "2.0.0"
---

# DTF420 Game Location Resolver

This compatibility skill no longer owns an independent location policy.

**REQUIRED SKILL:** Use `dtf-game-development`.

Resolve every game against:

`dtfgenetics/Thc/data/game-registry-v2.json`

Then inspect Dtf420's `lib/game-runtime-registry.ts`, `lib/game-catalog.ts`, and the resolved local path only after the canonical portfolio identity/owner/status is known.

Do not use the legacy `game-location-registry.json` as the new authority.
