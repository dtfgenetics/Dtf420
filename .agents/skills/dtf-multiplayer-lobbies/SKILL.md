---
name: dtf-multiplayer-lobbies
description: >
  Design and repair multiplayer lobby and synchronized turn systems for DTF420 browser games. Use for room codes, invite links, player names, join/create flows, reconnects, authoritative turns, shared board state, rematches, or multiplayer desynchronization.
---

# DTF Multiplayer Lobbies

Use this for games that need two or more remote players to share one authoritative match.

## First principle

Do not bolt networking directly onto sprites or React UI state. Synchronize serializable game state and validated player actions.

## Required flow

A complete multiplayer game should support, as applicable:

1. Create lobby.
2. Produce a stable room id/code and shareable invite link.
3. Join lobby by link or code.
4. Choose/confirm player display name.
5. Show lobby membership and readiness.
6. Start only when the match requirements are satisfied.
7. Enforce whose turn/action is authoritative.
8. Broadcast state changes to all players.
9. Handle disconnect/reconnect without silently creating a new player identity.
10. End the match consistently for every client.
11. Offer rematch or return-to-lobby behavior explicitly.

## Architecture

- Canonical match state must be serializable.
- Client UI may optimistically preview harmless interactions, but the authoritative state decides the result.
- Validate actions against player identity, match id, current phase, and active player/permissions.
- Use monotonically increasing revisions, sequence numbers, timestamps, or equivalent conflict protection so stale updates do not overwrite newer state.
- Keep transport/network code separate from game-rule reducers/state transitions.

## Turn-based games

For Weedopolis, High Land, card games, and similar systems:

- Prefer sending compact actions and authoritative resulting state rather than continuous frame synchronization.
- Lock duplicate actions while one turn action is pending.
- Persist enough state that a reconnect can reconstruct the current match.
- Never let two clients independently roll/shuffle/randomize the same event and hope they agree. Random outcomes must come from one authoritative source or a deterministic shared seed/protocol.

## Lobby safety

- Room codes must not expose sensitive credentials.
- Do not put secrets in client bundles or invite URLs.
- Sanitize display names before rendering.
- Define maximum player counts and reject excess joins cleanly.
- Decide what happens when the host leaves instead of leaving the lobby orphaned accidentally.

## Failure patterns

- Players see different boards -> state is being mutated independently on clients or messages are applied out of order.
- Double turns -> missing server/authority validation or action idempotency.
- Invite opens but cannot join -> room id parsing/routing mismatch or lobby expired unexpectedly.
- Refresh loses player -> identity/reconnect token is not being restored.
- Rematch inherits old pieces/cards -> new match initialization is reusing mutable state.

## Completion gate

Verify with at least two independent browser sessions: create, join, start, perform several turns, refresh/reconnect one client, finish or reset the match, and confirm both clients agree after every authoritative transition.
