export type HazardType = "log" | "mud" | "whirlpool";
export type PowerupId = "munchie-rush" | "dab-blast";

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
  id: string;
  name: string;
  length: number;
  currentZones: readonly CurrentZone[];
  hazards: readonly HazardDefinition[];
  pickups: readonly PickupDefinition[];
}

export const KUSH_CREEK: TrackDefinition = {
  id: "kush-creek",
  name: "Kush Creek",
  length: 5_200,
  currentZones: [
    { id: "launch-pool", label: "Launch Pool", start: 0, end: 0.16, speedMultiplier: 0.96, lateralForce: 0, turbulence: 0.08 },
    { id: "green-current", label: "Green Current", start: 0.16, end: 0.35, speedMultiplier: 1.1, lateralForce: 0.004, turbulence: 0.12 },
    { id: "munchie-marsh", label: "Munchie Marsh", start: 0.35, end: 0.53, speedMultiplier: 0.9, lateralForce: -0.003, turbulence: 0.18 },
    { id: "growhouse-cut", label: "Growhouse Cut", start: 0.53, end: 0.72, speedMultiplier: 1.04, lateralForce: 0.005, turbulence: 0.1 },
    { id: "cloud-nine-bend", label: "Cloud 9 Bend", start: 0.72, end: 0.87, speedMultiplier: 1.08, lateralForce: -0.006, turbulence: 0.24 },
    { id: "finish-rapids", label: "Finish Rapids", start: 0.87, end: 1, speedMultiplier: 1.14, lateralForce: 0, turbulence: 0.2 },
  ],
  hazards: [
    { id: "mud-left", type: "mud", progress: 0.41, lateral: -0.58, progressRadius: 0.018, lateralRadius: 0.24 },
    { id: "log-center", type: "log", progress: 0.57, lateral: 0.02, progressRadius: 0.012, lateralRadius: 0.2 },
    { id: "log-high", type: "log", progress: 0.63, lateral: -0.62, progressRadius: 0.012, lateralRadius: 0.18 },
    { id: "whirlpool", type: "whirlpool", progress: 0.77, lateral: 0.34, progressRadius: 0.03, lateralRadius: 0.28 },
  ],
  pickups: [
    { id: "munchie-1", powerup: "munchie-rush", progress: 0.23, lateral: -0.46, progressRadius: 0.012, lateralRadius: 0.16 },
    { id: "dab-1", powerup: "dab-blast", progress: 0.49, lateral: 0.5, progressRadius: 0.012, lateralRadius: 0.16 },
    { id: "munchie-2", powerup: "munchie-rush", progress: 0.69, lateral: -0.18, progressRadius: 0.012, lateralRadius: 0.16 },
    { id: "dab-2", powerup: "dab-blast", progress: 0.86, lateral: 0.56, progressRadius: 0.012, lateralRadius: 0.16 },
  ],
};

const TRACKS: Record<string, TrackDefinition> = {
  [KUSH_CREEK.id]: KUSH_CREEK,
};

export function getTrackDefinition(trackId: string): TrackDefinition {
  return TRACKS[trackId] ?? KUSH_CREEK;
}

export function currentZoneAt(track: TrackDefinition, progress: number): CurrentZone {
  return track.currentZones.find((zone) => progress >= zone.start && progress < zone.end)
    ?? track.currentZones[track.currentZones.length - 1];
}
