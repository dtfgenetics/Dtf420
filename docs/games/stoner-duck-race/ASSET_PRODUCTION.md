# Quack & Bake production asset contract

The game can run entirely with procedural fallbacks, but production art should replace those fallbacks through `game/stoner-duck-race/assets.ts`. Gameplay code must reference stable texture/audio keys, never hard-coded production file paths.

## Source-of-truth rule

`assets.ts` is the runtime manifest. A production asset becomes active only when its manifest path is populated. If a path is `null`, Phaser keeps the procedural fallback so incomplete art batches cannot break the game.

## Duck sprite sheets

Create one transparent sprite sheet per duck identity. Do not generate separate animation poses independently and try to repair continuity afterward; approve the character design first, then produce the complete animation family from that reference.

Runtime contract:

```text
frame size: 128 × 128 px
background: transparent
anchor: centered consistently across every frame
frames: 28 total
```

Frame order:

```text
00–03  idle
04–09  paddle
10–15  boost
16–19  hit
20–27  win
```

Required identities:

```text
mellow-mallard
dab-duck
hippie-quacker
grower-goose
rosin-runner
cloud-nine
science-duck
old-school-quack
```

Recommended repository destination:

```text
public/games/stoner-duck-race/ducks/<character-id>/sheet.webp
```

Use lossless source masters during production. The shipped WebP should preserve transparent edges cleanly and avoid baked-in backgrounds, labels, borders, or drop shadows.

## Power-up icons

One transparent icon per gameplay item. Keep silhouette and value readable at roughly 42 px in-game.

Required keys:

```text
powerup:munchie-rush
powerup:dab-blast
powerup:cloud-screen
powerup:bubble-shield
powerup:feather-boost
powerup:snack-magnet
powerup:mega-quack
powerup:super-duck
```

Recommended destination:

```text
public/games/stoner-duck-race/powerups/<powerup-id>.webp
```

Produce masters at 512 × 512 px with transparency, then optimize for runtime.

## Hazard art

Required hazard keys:

```text
hazard:log
hazard:mud
hazard:whirlpool
hazard:reeds
hazard:sprinkler
hazard:fan
hazard:barrel
hazard:waterfall
```

Recommended destination:

```text
public/games/stoner-duck-race/hazards/<hazard-id>.webp
```

Hazards need a clear collision-readable silhouette. Transparent padding should be kept consistent so the visible object remains aligned with the logical hazard center.

## Track art

Each of the eight tracks has three stable keys:

```text
track:<track-id>:background
track:<track-id>:foreground
track:<track-id>:preview
```

Tracks:

```text
kush-creek
munchie-marsh
cloud-9-canal
dab-rapids
trichome-trail
greenhouse-run
rosin-river
final-smokeout
```

The current Phaser renderer horizontally tiles authored background and foreground strips across the deterministic course length. Production strips therefore need seamless left/right edges.

Recommended files:

```text
public/games/stoner-duck-race/tracks/<track-id>/background.webp
public/games/stoner-duck-race/tracks/<track-id>/foreground.webp
public/games/stoner-duck-race/tracks/<track-id>/preview.webp
```

Background and foreground strips should be authored for a 480 px river-height composition. Foreground art must preserve a transparent center play lane where required and must not obscure hazards, pickups, or duck silhouettes.

Track previews should use a 16:9 crop suitable for lobby selection and future social/share cards.

## Audio

Stable keys are already reserved for:

```text
audio:race-theme
audio:river-ambience
audio:countdown
audio:pickup
audio:boost
audio:impact
audio:finish
```

Recommended destination:

```text
public/games/stoner-duck-race/audio/<name>.ogg
```

Ship browser-friendly compressed audio and keep source masters outside the public runtime directory. Race theme and river ambience are looping layers. Other keys are one-shot effects.

## Visual direction

Target a polished cartoon arcade-racer look rather than flat placeholder geometry: expressive ducks, readable silhouettes, strong water motion, layered banks, playful cannabis-comedy environmental details, clear items/hazards, and restrained smoke/cloud effects that never hide the racing line.

Cannabis theming should remain comedic and environmental. The game should not add real-money wagering or pay-to-win racing stats.

## Intake sequence

For each production asset family:

1. approve one representative seed design;
2. generate the full coherent family from that reference;
3. normalize dimensions, transparent bounds, anchors, and naming;
4. place the optimized runtime file in the documented public directory;
5. change only the corresponding `assets.ts` manifest path from `null` to the public path;
6. run the normal duck-race verification, TypeScript, static export, and production build gates;
7. visually inspect in-engine at race speed before considering the asset approved.

Never delete the procedural fallback merely because a production file exists. The fallback is the runtime safety net for missing/corrupt assets and future content expansion.
