# Burn Buds research record

Date: 2026-09-01

## Purpose

Record external references inspected while turning Burn Buds from a static 15 × 15 Phaser preview into a playable tactical fleet battle. Burn Buds keeps original DTF names, rules presentation, UI, data structures, and implementation.

## Sources inspected

### Phaser examples

- Repository family: Phaser source examples
- Reference: https://github.com/pnstickne/phaser-examples
- License finding: example source code is MIT; bundled graphics/audio are explicitly excluded from that permission.
- Used for: general Phaser scene/input/rendering patterns only.
- Asset decision: do not copy bundled example graphics or audio into DTF games.

### Shahir-47/Battleship

- Repository: https://github.com/Shahir-47/Battleship
- License finding: MIT.
- Relevant concept: a browser Battleship opponent that follows up after successful hits rather than selecting every shot uniformly at random.
- Burn Buds implementation: independently implemented deterministic hunt/target behavior in `game/burn-buds/model.ts`; no UI, artwork, naming, or source file was copied.

### ydyu/battleship

- Repository: https://github.com/ydyu/battleship
- License finding: GPL-3.0.
- Relevant concept: pattern/heatmap-oriented targeting experiments.
- Decision: reference-only. No GPL code is copied into DTF420.

## Burn Buds implementation decisions

- 15 × 15 board remains a DTF-specific rule.
- Fleet uses original cannabis-themed pieces: Glass Bong, Dab Rig, Rolling Tray, Grinder, and One-Hitter.
- Placement, firing, sinking, victory, seeded random placement, and opponent targeting are implemented in a project-owned TypeScript rules engine.
- The opponent uses a simple explainable hunt/target policy: unresolved hits prioritize orthogonally adjacent unknown cells; otherwise the opponent hunts a parity grid.
- Phaser is presentation/input only. Rules remain separate from scene state so they can be tested without rendering.
- No third-party art or audio has been imported in this milestone.
