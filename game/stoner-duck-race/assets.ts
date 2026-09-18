import type { HazardType, PowerupId } from "./tracks";
import type { TrackId } from "./types";

export type DuckAnimationId = "idle" | "paddle" | "boost" | "hit" | "win";

export interface AnimationDefinition {
  start: number;
  end: number;
  frameRate: number;
  repeat: number;
}

export interface DuckSpriteAsset {
  characterId: string;
  textureKey: string;
  sheetPath: string | null;
  frameWidth: number;
  frameHeight: number;
  animations: Readonly<Record<DuckAnimationId, AnimationDefinition>>;
}

export interface IconAsset {
  textureKey: string;
  path: string | null;
  fallbackLabel: string;
  fallbackColor: number;
}

export interface TrackArtAsset {
  trackId: TrackId;
  backgroundKey: string;
  backgroundPath: string | null;
  foregroundKey: string;
  foregroundPath: string | null;
  previewKey: string;
  previewPath: string | null;
}

export interface AudioAsset {
  key: string;
  path: string | null;
  loop: boolean;
  volume: number;
}

const DEFAULT_DUCK_ANIMATIONS: Readonly<Record<DuckAnimationId, AnimationDefinition>> = {
  idle: { start: 0, end: 3, frameRate: 6, repeat: -1 },
  paddle: { start: 4, end: 9, frameRate: 10, repeat: -1 },
  boost: { start: 10, end: 15, frameRate: 14, repeat: -1 },
  hit: { start: 16, end: 19, frameRate: 12, repeat: 0 },
  win: { start: 20, end: 27, frameRate: 10, repeat: -1 },
};

const duckAsset = (characterId: string): DuckSpriteAsset => ({
  characterId,
  textureKey: `duck:${characterId}`,
  sheetPath: null,
  frameWidth: 128,
  frameHeight: 128,
  animations: DEFAULT_DUCK_ANIMATIONS,
});

export const DUCK_SPRITE_ASSETS: readonly DuckSpriteAsset[] = [
  duckAsset("mellow-mallard"),
  duckAsset("dab-duck"),
  duckAsset("hippie-quacker"),
  duckAsset("grower-goose"),
  duckAsset("rosin-runner"),
  duckAsset("cloud-nine"),
  duckAsset("science-duck"),
  duckAsset("old-school-quack"),
] as const;

export const POWERUP_ASSETS: Readonly<Record<PowerupId, IconAsset>> = {
  "munchie-rush": { textureKey: "powerup:munchie-rush", path: null, fallbackLabel: "MUNCH", fallbackColor: 0xf2c14e },
  "dab-blast": { textureKey: "powerup:dab-blast", path: null, fallbackLabel: "DAB", fallbackColor: 0xa978e3 },
  "cloud-screen": { textureKey: "powerup:cloud-screen", path: null, fallbackLabel: "CLOUD", fallbackColor: 0x9fb8c8 },
  "bubble-shield": { textureKey: "powerup:bubble-shield", path: null, fallbackLabel: "SHIELD", fallbackColor: 0x63c7da },
  "feather-boost": { textureKey: "powerup:feather-boost", path: null, fallbackLabel: "FEATHER", fallbackColor: 0xf4e6a2 },
  "snack-magnet": { textureKey: "powerup:snack-magnet", path: null, fallbackLabel: "MAGNET", fallbackColor: 0xe58f65 },
  "mega-quack": { textureKey: "powerup:mega-quack", path: null, fallbackLabel: "QUACK", fallbackColor: 0xff9f1c },
  "super-duck": { textureKey: "powerup:super-duck", path: null, fallbackLabel: "SUPER", fallbackColor: 0xffd166 },
};

export const HAZARD_ASSETS: Readonly<Record<HazardType, IconAsset>> = {
  log: { textureKey: "hazard:log", path: null, fallbackLabel: "LOG", fallbackColor: 0x75442b },
  mud: { textureKey: "hazard:mud", path: null, fallbackLabel: "MUD", fallbackColor: 0x62513c },
  whirlpool: { textureKey: "hazard:whirlpool", path: null, fallbackLabel: "WHIRL", fallbackColor: 0x0a303b },
  reeds: { textureKey: "hazard:reeds", path: null, fallbackLabel: "REEDS", fallbackColor: 0x3f6b45 },
  sprinkler: { textureKey: "hazard:sprinkler", path: null, fallbackLabel: "SPRAY", fallbackColor: 0x80c5d6 },
  fan: { textureKey: "hazard:fan", path: null, fallbackLabel: "FAN", fallbackColor: 0xb7c3c7 },
  barrel: { textureKey: "hazard:barrel", path: null, fallbackLabel: "BARREL", fallbackColor: 0x8d5b32 },
  waterfall: { textureKey: "hazard:waterfall", path: null, fallbackLabel: "FALLS", fallbackColor: 0xb8dfe8 },
};

const trackArt = (trackId: TrackId): TrackArtAsset => ({
  trackId,
  backgroundKey: `track:${trackId}:background`,
  backgroundPath: null,
  foregroundKey: `track:${trackId}:foreground`,
  foregroundPath: null,
  previewKey: `track:${trackId}:preview`,
  previewPath: null,
});

export const TRACK_ART_ASSETS: Readonly<Record<TrackId, TrackArtAsset>> = {
  "kush-creek": trackArt("kush-creek"),
  "munchie-marsh": trackArt("munchie-marsh"),
  "cloud-9-canal": trackArt("cloud-9-canal"),
  "dab-rapids": trackArt("dab-rapids"),
  "trichome-trail": trackArt("trichome-trail"),
  "greenhouse-run": trackArt("greenhouse-run"),
  "rosin-river": trackArt("rosin-river"),
  "final-smokeout": trackArt("final-smokeout"),
};

export const AUDIO_ASSETS: readonly AudioAsset[] = [
  { key: "audio:race-theme", path: null, loop: true, volume: 0.5 },
  { key: "audio:river-ambience", path: null, loop: true, volume: 0.35 },
  { key: "audio:countdown", path: null, loop: false, volume: 0.75 },
  { key: "audio:pickup", path: null, loop: false, volume: 0.7 },
  { key: "audio:boost", path: null, loop: false, volume: 0.65 },
  { key: "audio:impact", path: null, loop: false, volume: 0.7 },
  { key: "audio:finish", path: null, loop: false, volume: 0.8 },
] as const;

export function getDuckSpriteAsset(characterId: string): DuckSpriteAsset {
  return DUCK_SPRITE_ASSETS.find((asset) => asset.characterId === characterId) ?? DUCK_SPRITE_ASSETS[0];
}

export function hasAuthoredAsset(path: string | null): path is string {
  return typeof path === "string" && path.length > 0;
}
