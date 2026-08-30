---
name: dtf-board-card-games
description: >
  Implement and repair deterministic board, card, trivia, and turn-based game systems in DTF420. Use for Weedopolis, High Land, High IQ, Strain Showdown, Bud or Bluff, decks, boards, movement, turns, scoring, rule resolution, card zones, or saveable match state.
---

# DTF Board and Card Games

Treat rules as a deterministic simulation. Rendering and animation must reflect the rules, not define them.

## State model

Prefer serializable state containing only data such as:

- players and player order
- active player/phase
- board position or grid coordinates
- deck, hand, discard, revealed, and removed zones
- owned properties/cards/resources
- scores, counters, status effects, and flags
- RNG seed or authoritative random result when reproducibility matters
- game-over/winner state

Do not store Phaser sprites, React components, DOM nodes, timers, or functions in canonical match state.

## Action model

Represent player intent as explicit actions such as:

- `ROLL`
- `MOVE`
- `DRAW_CARD`
- `PLAY_CARD`
- `BUY_PROPERTY`
- `END_TURN`
- `ANSWER_QUESTION`
- `PLACE_PIECE`
- `ATTACK`

Validate the action against current state, calculate the result, then render the new state.

## Rule workflow

1. Find and preserve the approved rules/data already in the repository or project documentation.
2. Encode board spaces, cards, questions, properties, or strain data as data rather than giant switch statements when practical.
3. Keep legal-action checks centralized.
4. Resolve one authoritative state transition per action.
5. Make chained effects explicit so they can be tested.
6. Define ties, empty-deck behavior, skipped turns, reconnects, and game-over conditions instead of leaving them implicit.
7. Keep randomness injectable or seedable for tests.

## Board movement

- Derive movement from ordered board-space data.
- Handle wraparound, forward/backward movement, destination effects, and pass-start effects separately.
- Animation follows the resolved path; it must not be the source of the player's final position.
- For fixed visual boards, maintain a data map from logical space id to approved render coordinates.

## Card/deck systems

- Separate immutable card definitions from per-match card instances/state.
- Explicitly model deck, hand, discard, in-play, and removed zones as needed.
- Shuffle using one controlled random source.
- Never duplicate a unique card accidentally when recycling a discard pile.

## Trivia

- Question ids must be stable.
- Keep prompt, choices, correct answer, explanation, category, and difficulty in structured data.
- Validate that exactly one answer is marked correct unless the game explicitly supports multiple answers.
- Avoid making answer correctness depend on presentation order unless choices are shuffled with their answer identity preserved.

## Testing targets

At minimum test:

- first turn
- ordinary turn
- invalid action rejection
- boundary/wrap movement
- chained card effects
- empty deck/recycle behavior
- win condition
- reset/new match
- deterministic replay from a known seed or action sequence when supported

Use `dtf-multiplayer-lobbies` when the same state must synchronize between players and `dtf-game-playtest` for player-facing verification.
