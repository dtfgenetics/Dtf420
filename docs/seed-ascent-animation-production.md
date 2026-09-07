# Seed Ascent animation production plan

This document is the production contract for new Seed Man and world-level animation assets.

## Character invariants

Seed Man must remain the approved short, chubby oval seed character with a three-leaf sprout, simple readable face, rubber-hose limbs, white gloves, white shoes, thick outline, and transparent background. Do not add costumes, props, realistic anatomy, yellow grading, or painterly shading.

All character frames use a shared 222 x 222 production cell and a bottom-center anchor. Generate whole strips from one approved seed frame rather than producing frames independently.

## Base animation sheet

Target: `public/seed-ascent/assets/seed-man-base-animations.webp`

Recommended strip families:

- Idle: 6 frames, subtle breathing/sprout bounce, loop.
- Run: 8 frames, clear rubber-hose stride and arm swing, loop.
- Jump: 4 frames, anticipation through upward extension, non-looping.
- Fall: 4 frames, readable downward silhouette, loop.
- Land: 4 frames, squash and recover, non-looping.
- Hurt: 4 frames, recoil and recovery, non-looping.

Keep feet aligned to the same bottom-center anchor so changing states never makes the character pop vertically.

## Phenotype sheets

Targets:

- `seed-man-fire-animations.webp`
- `seed-man-electric-animations.webp`
- `seed-man-ice-animations.webp`

Each phenotype needs:

- Transform: 6 frames.
- Attack: 6-8 frames.
- Revert: 5 frames.

Phenotype changes should preserve Seed Man's base silhouette. Power identity comes from controlled effects and palette accents, not costume replacement.

### Fire

Attack read: plant-forward throwing motion, small anticipation, fireball leaves the glove at the release frame, orange/red rim light only. No permanent flames covering the face.

### Electric

Attack read: upward call/point, lightning charge gathers at the glove/sprout, release frame should clearly coincide with the world lightning strike.

### Ice

Attack read: forward casting pose, pale blue cold vapor and crystalline accents, release frame should match the freeze projectile/effect timing.

## Enemy animation priority

After Seed Man, animate the phenotype-source enemies first because they teach the combat system:

1. Ember Beetle
2. Cinder Warden
3. Storm Moth
4. Volt Warden
5. Frost Grub
6. Glacier Warden

Each minor enemy should have idle/move, attack or threat tell, hurt, and defeat. Minor bosses should add a charge/tell and a more readable defeat animation.

## World-level sprite families

The render-only world animation layer already defines the atmospheric identity for all 12 stages. New authored foreground/background sprites should reinforce those identities rather than duplicate them.

- 1-1 Germination Grove: seed shells, cotyledons, dew, pollen, young leaves.
- 1-2 Veg Valley: fan leaves, stems, trellis silhouettes, canopy motion.
- 2-1 Nutrient Tunnels: root hairs, mineral deposits, nutrient droplets, tunnel machinery.
- 2-2 Flower Fields: pistils, flower clusters, petals, drifting pollen.
- 3-1 Trichome Heights: resin heads, crystal outcroppings, icy highlights.
- 3-2 Harvest Keep: drying racks, harvest bins, warm work lights, trim debris.
- 4-1 Dryback Desert: cracked media, curled leaves, heat shimmer props.
- 4-2 Rootzone Ruins: old roots, microbial spores, broken irrigation, ancient grow-room structures.
- 5-1 Resin Rapids: resin droplets, flowing concentrate-like surfaces, mist.
- 5-2 Cold Cure Caverns: cold vapor, crystallized resin, reflective cave growths.
- 6-1 Storm Canopy: wind-driven leaves, charged clouds, electric flashes.
- 6-2 Final Trichome stage: dense trichome fields, final sparkle layers, celebratory phenotype motifs.

## Runtime integration gate

The approved six-frame Seed Man sheet remains the fallback until an authored replacement sheet exists and passes QA. New character sheets are integrated only when the runtime can resolve the named state from `animation-manifest.js` and the asset has passed validation. Missing optional sheets must fall back cleanly instead of breaking boot or drawing empty frames.

Animation playback stays presentation-only: movement, damage, attacks, power duration, collision, checkpoints, and boss state are committed by the simulation independently of animation completion.

## QA gate

Every generated or converted sprite family must:

1. preserve real alpha transparency;
2. use equal-size atlas cells;
3. keep a shared bottom-center anchor;
4. avoid frame-to-frame scale drift;
5. remain readable at actual in-game size;
6. pass `dtf-game-asset-qa`;
7. be referenced by the runtime before shipping;
8. render without 404s or console errors at desktop and phone widths;
9. pass the Seed Ascent animation contract verifier;
10. be reviewed in motion, not only as a static sheet.

## Integration order

1. Base Seed Man movement sheet.
2. Fire/Electric/Ice attack and transform sheets.
3. Phenotype-source enemy movement/attack sheets.
4. Minor-boss animation sheets.
5. Foreground world sprite families.
6. Background/parallax authored layers.
7. Secondary pests and final boss animation.
8. Performance pass and atlas consolidation.
