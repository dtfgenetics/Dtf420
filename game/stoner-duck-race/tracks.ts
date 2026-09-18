import type { TrackId } from "./types.js";

export type HazardType =
  | "log"
  | "mud"
  | "whirlpool"
  | "reeds"
  | "sprinkler"
  | "fan"
  | "barrel"
  | "waterfall";

export type PowerupId =
  | "munchie-rush"
  | "dab-blast"
  | "cloud-screen"
  | "bubble-shield"
  | "feather-boost"
  | "snack-magnet"
  | "mega-quack"
  | "super-duck";

export interface CurrentZone {
  id: string;
  label: string;
  start: number;
  end: number;
  speedMultiplier: number;
  lateralForce: number;
  turbulence: number;
}

export interface HazardDefinition {
  id: string;
  type: HazardType;
  progress: number;
  lateral: number;
  progressRadius: number;
  lateralRadius: number;
}

export interface PickupDefinition {
  id: string;
  powerup: PowerupId;
  progress: number;
  lateral: number;
  progressRadius: number;
  lateralRadius: number;
}

export interface TrackDefinition {
  id: TrackId;
  name: string;
  tagline: string;
  length: number;
  waterColor: number;
  bankColor: number;
  currentZones: readonly CurrentZone[];
  hazards: readonly HazardDefinition[];
  pickups: readonly PickupDefinition[];
}

const pickup = (id: string, powerup: PowerupId, progress: number, lateral: number): PickupDefinition => ({
  id,
  powerup,
  progress,
  lateral,
  progressRadius: 0.014,
  lateralRadius: 0.18,
});

const hazard = (id: string, type: HazardType, progress: number, lateral: number, progressRadius = 0.018, lateralRadius = 0.22): HazardDefinition => ({
  id,
  type,
  progress,
  lateral,
  progressRadius,
  lateralRadius,
});

export const KUSH_CREEK: TrackDefinition = {
  id: "kush-creek",
  name: "Kush Creek",
  tagline: "Balanced currents, marsh hazards, and a fast final bend.",
  length: 5_200,
  waterColor: 0x174753,
  bankColor: 0x153327,
  currentZones: [
    { id: "launch-pool", label: "Launch Pool", start: 0, end: 0.16, speedMultiplier: 0.96, lateralForce: 0, turbulence: 0.08 },
    { id: "green-current", label: "Green Current", start: 0.16, end: 0.35, speedMultiplier: 1.1, lateralForce: 0.004, turbulence: 0.12 },
    { id: "munchie-marsh", label: "Munchie Marsh", start: 0.35, end: 0.53, speedMultiplier: 0.9, lateralForce: -0.003, turbulence: 0.18 },
    { id: "growhouse-cut", label: "Growhouse Cut", start: 0.53, end: 0.72, speedMultiplier: 1.04, lateralForce: 0.005, turbulence: 0.1 },
    { id: "cloud-nine-bend", label: "Cloud 9 Bend", start: 0.72, end: 0.87, speedMultiplier: 1.08, lateralForce: -0.006, turbulence: 0.24 },
    { id: "finish-rapids", label: "Finish Rapids", start: 0.87, end: 1, speedMultiplier: 1.14, lateralForce: 0, turbulence: 0.2 },
  ],
  hazards: [
    hazard("mud-left", "mud", 0.18, -0.58),
    hazard("reeds-1", "reeds", 0.31, 0.44),
    hazard("log-center", "log", 0.45, 0.02, 0.012, 0.2),
    hazard("sprinkler", "sprinkler", 0.59, -0.55),
    hazard("log-high", "log", 0.68, 0.58, 0.012, 0.18),
    hazard("whirlpool", "whirlpool", 0.79, 0.28, 0.03, 0.28),
  ],
  pickups: [
    pickup("kush-munchie", "munchie-rush", 0.12, -0.4),
    pickup("kush-shield", "bubble-shield", 0.27, 0.52),
    pickup("kush-dab", "dab-blast", 0.41, -0.12),
    pickup("kush-feather", "feather-boost", 0.55, 0.5),
    pickup("kush-cloud", "cloud-screen", 0.7, -0.38),
    pickup("kush-super", "super-duck", 0.88, 0.18),
  ],
};

export const MUNCHIE_MARSH: TrackDefinition = {
  id: "munchie-marsh",
  name: "Munchie Marsh",
  tagline: "Sticky mud, snack lanes, and reeds that punish lazy steering.",
  length: 4_850,
  waterColor: 0x35594a,
  bankColor: 0x4a3828,
  currentZones: [
    { id: "snack-start", label: "Snack Start", start: 0, end: 0.2, speedMultiplier: 1, lateralForce: 0.002, turbulence: 0.1 },
    { id: "brown-water", label: "Brown Water", start: 0.2, end: 0.4, speedMultiplier: 0.86, lateralForce: -0.004, turbulence: 0.16 },
    { id: "reeds-run", label: "Reeds Run", start: 0.4, end: 0.62, speedMultiplier: 0.94, lateralForce: 0.006, turbulence: 0.2 },
    { id: "snack-channel", label: "Snack Channel", start: 0.62, end: 0.82, speedMultiplier: 1.11, lateralForce: -0.003, turbulence: 0.12 },
    { id: "marsh-sprint", label: "Marsh Sprint", start: 0.82, end: 1, speedMultiplier: 1.16, lateralForce: 0.004, turbulence: 0.18 },
  ],
  hazards: [
    hazard("marsh-mud-1", "mud", 0.16, 0.45, 0.024, 0.28),
    hazard("marsh-reeds-1", "reeds", 0.29, -0.46),
    hazard("marsh-mud-2", "mud", 0.43, 0.12, 0.026, 0.32),
    hazard("marsh-log", "log", 0.57, -0.62),
    hazard("marsh-reeds-2", "reeds", 0.72, 0.55),
    hazard("marsh-barrel", "barrel", 0.89, -0.08),
  ],
  pickups: [
    pickup("marsh-magnet", "snack-magnet", 0.1, 0.5),
    pickup("marsh-munchie", "munchie-rush", 0.25, -0.2),
    pickup("marsh-shield", "bubble-shield", 0.38, 0.58),
    pickup("marsh-quack", "mega-quack", 0.53, -0.52),
    pickup("marsh-munchie-2", "munchie-rush", 0.68, 0.12),
    pickup("marsh-super", "super-duck", 0.84, -0.4),
  ],
};

export const CLOUD_9_CANAL: TrackDefinition = {
  id: "cloud-9-canal",
  name: "Cloud 9 Canal",
  tagline: "Fast water, wind machines, spray, and low-visibility chaos.",
  length: 5_650,
  waterColor: 0x315d70,
  bankColor: 0x3f4f48,
  currentZones: [
    { id: "mist-gate", label: "Mist Gate", start: 0, end: 0.18, speedMultiplier: 1.02, lateralForce: -0.002, turbulence: 0.16 },
    { id: "fan-alley", label: "Fan Alley", start: 0.18, end: 0.39, speedMultiplier: 1.06, lateralForce: 0.008, turbulence: 0.22 },
    { id: "whiteout", label: "Whiteout", start: 0.39, end: 0.6, speedMultiplier: 0.96, lateralForce: -0.007, turbulence: 0.28 },
    { id: "spray-line", label: "Spray Line", start: 0.6, end: 0.8, speedMultiplier: 1.1, lateralForce: 0.005, turbulence: 0.2 },
    { id: "cloud-drop", label: "Cloud Drop", start: 0.8, end: 1, speedMultiplier: 1.18, lateralForce: -0.004, turbulence: 0.24 },
  ],
  hazards: [
    hazard("cloud-fan-1", "fan", 0.14, 0.1, 0.02, 0.42),
    hazard("cloud-sprinkler-1", "sprinkler", 0.3, -0.5),
    hazard("cloud-log", "log", 0.47, 0.58),
    hazard("cloud-fan-2", "fan", 0.61, -0.1, 0.02, 0.42),
    hazard("cloud-whirlpool", "whirlpool", 0.74, -0.48, 0.03, 0.28),
    hazard("cloud-waterfall", "waterfall", 0.91, 0.22, 0.025, 0.4),
  ],
  pickups: [
    pickup("cloud-cloud", "cloud-screen", 0.09, -0.4),
    pickup("cloud-feather", "feather-boost", 0.23, 0.48),
    pickup("cloud-shield", "bubble-shield", 0.37, -0.1),
    pickup("cloud-dab", "dab-blast", 0.56, 0.55),
    pickup("cloud-quack", "mega-quack", 0.7, -0.55),
    pickup("cloud-super", "super-duck", 0.86, 0.05),
  ],
};

export const DAB_RAPIDS: TrackDefinition = {
  id: "dab-rapids",
  name: "Dab Rapids",
  tagline: "Short, violent rapids with boost lines and hard lateral kicks.",
  length: 5_350,
  waterColor: 0x236879,
  bankColor: 0x394c3d,
  currentZones: [
    { id: "dab-launch", label: "Dab Launch", start: 0, end: 0.14, speedMultiplier: 1.08, lateralForce: 0.003, turbulence: 0.14 },
    { id: "torch-turn", label: "Torch Turn", start: 0.14, end: 0.32, speedMultiplier: 1.16, lateralForce: -0.009, turbulence: 0.25 },
    { id: "glass-chute", label: "Glass Chute", start: 0.32, end: 0.52, speedMultiplier: 1.04, lateralForce: 0.01, turbulence: 0.29 },
    { id: "terp-drop", label: "Terp Drop", start: 0.52, end: 0.72, speedMultiplier: 1.2, lateralForce: -0.007, turbulence: 0.3 },
    { id: "hot-run", label: "Hot Run", start: 0.72, end: 0.88, speedMultiplier: 1.13, lateralForce: 0.008, turbulence: 0.27 },
    { id: "dab-finish", label: "Dab Finish", start: 0.88, end: 1, speedMultiplier: 1.22, lateralForce: 0, turbulence: 0.22 },
  ],
  hazards: [
    hazard("dab-log", "log", 0.17, -0.42),
    hazard("dab-whirlpool-1", "whirlpool", 0.31, 0.48, 0.027, 0.27),
    hazard("dab-fan", "fan", 0.46, -0.08, 0.02, 0.42),
    hazard("dab-waterfall", "waterfall", 0.6, 0.25, 0.026, 0.42),
    hazard("dab-barrel", "barrel", 0.76, -0.55),
    hazard("dab-whirlpool-2", "whirlpool", 0.91, 0.12, 0.025, 0.25),
  ],
  pickups: [
    pickup("dab-boost", "feather-boost", 0.1, 0.42),
    pickup("dab-blast-1", "dab-blast", 0.25, -0.45),
    pickup("dab-shield", "bubble-shield", 0.4, 0.18),
    pickup("dab-blast-2", "dab-blast", 0.55, -0.52),
    pickup("dab-super", "super-duck", 0.7, 0.5),
    pickup("dab-quack", "mega-quack", 0.85, -0.12),
  ],
};

export const TRICHOME_TRAIL: TrackDefinition = {
  id: "trichome-trail",
  name: "Trichome Trail",
  tagline: "Technical crystal-clear lanes reward precision and item discipline.",
  length: 5_500,
  waterColor: 0x477b82,
  bankColor: 0x536b50,
  currentZones: [
    { id: "crystal-start", label: "Crystal Start", start: 0, end: 0.17, speedMultiplier: 0.98, lateralForce: 0, turbulence: 0.08 },
    { id: "frost-lane", label: "Frost Lane", start: 0.17, end: 0.34, speedMultiplier: 1.07, lateralForce: 0.004, turbulence: 0.11 },
    { id: "resin-switch", label: "Resin Switch", start: 0.34, end: 0.52, speedMultiplier: 0.94, lateralForce: -0.007, turbulence: 0.15 },
    { id: "heads-up", label: "Heads Up", start: 0.52, end: 0.7, speedMultiplier: 1.1, lateralForce: 0.006, turbulence: 0.16 },
    { id: "sparkle-bend", label: "Sparkle Bend", start: 0.7, end: 0.86, speedMultiplier: 1.03, lateralForce: -0.005, turbulence: 0.13 },
    { id: "frost-finish", label: "Frost Finish", start: 0.86, end: 1, speedMultiplier: 1.17, lateralForce: 0.003, turbulence: 0.15 },
  ],
  hazards: [
    hazard("trichome-reeds", "reeds", 0.2, -0.52),
    hazard("trichome-log", "log", 0.34, 0.48),
    hazard("trichome-mud", "mud", 0.49, -0.08, 0.023, 0.28),
    hazard("trichome-spray", "sprinkler", 0.63, 0.55),
    hazard("trichome-barrel", "barrel", 0.77, -0.5),
    hazard("trichome-whirlpool", "whirlpool", 0.91, 0.3, 0.026, 0.26),
  ],
  pickups: [
    pickup("trichome-shield", "bubble-shield", 0.11, -0.32),
    pickup("trichome-magnet", "snack-magnet", 0.27, 0.5),
    pickup("trichome-cloud", "cloud-screen", 0.42, -0.45),
    pickup("trichome-feather", "feather-boost", 0.57, 0.48),
    pickup("trichome-munch", "munchie-rush", 0.73, -0.12),
    pickup("trichome-super", "super-duck", 0.87, 0.36),
  ],
};

export const GREENHOUSE_RUN: TrackDefinition = {
  id: "greenhouse-run",
  name: "Greenhouse Run",
  tagline: "Fans, irrigation spray, narrow lanes, and shifting greenhouse current.",
  length: 5_900,
  waterColor: 0x2e6f61,
  bankColor: 0x31513a,
  currentZones: [
    { id: "doorway", label: "Doorway", start: 0, end: 0.15, speedMultiplier: 0.97, lateralForce: 0.002, turbulence: 0.1 },
    { id: "veg-row", label: "Veg Row", start: 0.15, end: 0.32, speedMultiplier: 1.04, lateralForce: -0.004, turbulence: 0.13 },
    { id: "fan-house", label: "Fan House", start: 0.32, end: 0.52, speedMultiplier: 0.99, lateralForce: 0.01, turbulence: 0.23 },
    { id: "irrigation", label: "Irrigation", start: 0.52, end: 0.7, speedMultiplier: 0.93, lateralForce: -0.007, turbulence: 0.2 },
    { id: "flower-row", label: "Flower Row", start: 0.7, end: 0.87, speedMultiplier: 1.09, lateralForce: 0.005, turbulence: 0.14 },
    { id: "harvest-door", label: "Harvest Door", start: 0.87, end: 1, speedMultiplier: 1.16, lateralForce: 0, turbulence: 0.16 },
  ],
  hazards: [
    hazard("green-fan-1", "fan", 0.18, 0.05, 0.02, 0.45),
    hazard("green-spray-1", "sprinkler", 0.31, -0.55),
    hazard("green-reeds", "reeds", 0.45, 0.5),
    hazard("green-fan-2", "fan", 0.6, -0.1, 0.02, 0.45),
    hazard("green-spray-2", "sprinkler", 0.75, 0.52),
    hazard("green-barrel", "barrel", 0.9, -0.18),
  ],
  pickups: [
    pickup("green-munch", "munchie-rush", 0.09, 0.45),
    pickup("green-shield", "bubble-shield", 0.24, -0.4),
    pickup("green-magnet", "snack-magnet", 0.39, 0.2),
    pickup("green-dab", "dab-blast", 0.55, 0.52),
    pickup("green-feather", "feather-boost", 0.71, -0.5),
    pickup("green-super", "super-duck", 0.86, 0.12),
  ],
};

export const ROSIN_RIVER: TrackDefinition = {
  id: "rosin-river",
  name: "Rosin River",
  tagline: "A long technical run with barrels, falls, and heavy current shifts.",
  length: 6_100,
  waterColor: 0x3d615c,
  bankColor: 0x5c4936,
  currentZones: [
    { id: "press-pool", label: "Press Pool", start: 0, end: 0.15, speedMultiplier: 0.98, lateralForce: 0, turbulence: 0.08 },
    { id: "gold-run", label: "Gold Run", start: 0.15, end: 0.34, speedMultiplier: 1.12, lateralForce: 0.004, turbulence: 0.14 },
    { id: "sticky-cut", label: "Sticky Cut", start: 0.34, end: 0.55, speedMultiplier: 0.91, lateralForce: -0.006, turbulence: 0.18 },
    { id: "barrel-yard", label: "Barrel Yard", start: 0.55, end: 0.73, speedMultiplier: 1.03, lateralForce: 0.006, turbulence: 0.22 },
    { id: "press-falls", label: "Press Falls", start: 0.73, end: 0.88, speedMultiplier: 1.15, lateralForce: -0.008, turbulence: 0.26 },
    { id: "gold-finish", label: "Gold Finish", start: 0.88, end: 1, speedMultiplier: 1.2, lateralForce: 0, turbulence: 0.18 },
  ],
  hazards: [
    hazard("rosin-barrel-1", "barrel", 0.18, -0.45),
    hazard("rosin-log", "log", 0.3, 0.48),
    hazard("rosin-mud", "mud", 0.45, -0.08, 0.026, 0.3),
    hazard("rosin-barrel-2", "barrel", 0.62, 0.58),
    hazard("rosin-waterfall", "waterfall", 0.77, -0.05, 0.03, 0.5),
    hazard("rosin-whirlpool", "whirlpool", 0.9, -0.45, 0.03, 0.28),
  ],
  pickups: [
    pickup("rosin-feather", "feather-boost", 0.11, 0.45),
    pickup("rosin-magnet", "snack-magnet", 0.27, -0.48),
    pickup("rosin-shield", "bubble-shield", 0.42, 0.52),
    pickup("rosin-dab", "dab-blast", 0.58, -0.12),
    pickup("rosin-quack", "mega-quack", 0.73, 0.55),
    pickup("rosin-super", "super-duck", 0.87, -0.18),
  ],
};

export const FINAL_SMOKEOUT: TrackDefinition = {
  id: "final-smokeout",
  name: "Final Smokeout",
  tagline: "The championship gauntlet mixes every hazard into the fastest course.",
  length: 6_400,
  waterColor: 0x294f59,
  bankColor: 0x3e342c,
  currentZones: [
    { id: "smoke-start", label: "Smoke Start", start: 0, end: 0.13, speedMultiplier: 1.03, lateralForce: 0, turbulence: 0.12 },
    { id: "gauntlet-one", label: "Gauntlet I", start: 0.13, end: 0.3, speedMultiplier: 1.1, lateralForce: 0.007, turbulence: 0.22 },
    { id: "hotbox-cut", label: "Hotbox Cut", start: 0.3, end: 0.48, speedMultiplier: 0.94, lateralForce: -0.008, turbulence: 0.28 },
    { id: "gauntlet-two", label: "Gauntlet II", start: 0.48, end: 0.66, speedMultiplier: 1.13, lateralForce: 0.009, turbulence: 0.3 },
    { id: "last-cloud", label: "Last Cloud", start: 0.66, end: 0.83, speedMultiplier: 1.04, lateralForce: -0.01, turbulence: 0.32 },
    { id: "smokeout-sprint", label: "Smokeout Sprint", start: 0.83, end: 1, speedMultiplier: 1.24, lateralForce: 0.004, turbulence: 0.26 },
  ],
  hazards: [
    hazard("final-log", "log", 0.12, -0.46),
    hazard("final-reeds", "reeds", 0.24, 0.5),
    hazard("final-fan", "fan", 0.37, -0.08, 0.02, 0.45),
    hazard("final-whirlpool", "whirlpool", 0.5, 0.46, 0.03, 0.3),
    hazard("final-spray", "sprinkler", 0.63, -0.52),
    hazard("final-barrel", "barrel", 0.74, 0.58),
    hazard("final-waterfall", "waterfall", 0.86, -0.05, 0.028, 0.46),
    hazard("final-mud", "mud", 0.94, 0.42, 0.022, 0.26),
  ],
  pickups: [
    pickup("final-shield", "bubble-shield", 0.08, 0.4),
    pickup("final-dab", "dab-blast", 0.2, -0.45),
    pickup("final-cloud", "cloud-screen", 0.33, 0.5),
    pickup("final-magnet", "snack-magnet", 0.46, -0.52),
    pickup("final-quack", "mega-quack", 0.59, 0.12),
    pickup("final-feather", "feather-boost", 0.71, 0.48),
    pickup("final-munch", "munchie-rush", 0.82, -0.42),
    pickup("final-super", "super-duck", 0.92, 0.08),
  ],
};

export const TRACKS: Readonly<Record<TrackId, TrackDefinition>> = {
  "kush-creek": KUSH_CREEK,
  "munchie-marsh": MUNCHIE_MARSH,
  "cloud-9-canal": CLOUD_9_CANAL,
  "dab-rapids": DAB_RAPIDS,
  "trichome-trail": TRICHOME_TRAIL,
  "greenhouse-run": GREENHOUSE_RUN,
  "rosin-river": ROSIN_RIVER,
  "final-smokeout": FINAL_SMOKEOUT,
};

export const TRACK_LIST = Object.values(TRACKS);

export function getTrackDefinition(trackId: string): TrackDefinition {
  return TRACKS[trackId as TrackId] ?? KUSH_CREEK;
}

export function currentZoneAt(track: TrackDefinition, progress: number): CurrentZone {
  return track.currentZones.find((zone) => progress >= zone.start && progress < zone.end)
    ?? track.currentZones[track.currentZones.length - 1];
}
