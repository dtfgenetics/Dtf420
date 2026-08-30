# DTF420 Agent Guidance

For any browser-game task in this repository, load and follow `$dtf-game-router` from `.agents/skills/dtf-game-router/SKILL.md` before editing game code.

Use the router to compose the project skills under `.agents/skills/` for Phaser runtime work, asset recovery, mobile UI, board/card rules, multiplayer lobbies, playtesting, and deployment verification.

Project-wide rules for game work:

- Inspect and repair existing implementations before creating replacements.
- Preserve the pinned framework/engine versions unless a migration is explicitly requested.
- Keep canonical gameplay state serializable and separate from Phaser/React rendering state.
- Reuse approved repository assets before generating placeholders or replacement art.
- Treat mobile usability, broken asset paths, console errors, and dead routes as release defects.
- Run relevant verification, lint, typecheck, and production build checks when practical.
- Do not claim a game is live until the public production route is verified after deployment.
