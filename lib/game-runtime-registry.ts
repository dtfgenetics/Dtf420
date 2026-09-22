export type GameReleaseStatus = "playable" | "preview";

export type GameHostKind = "next-react" | "iframe";
export type GameEngineKind = "react-dom" | "phaser" | "canvas2d" | "three" | "html-dom";
export type GameOrientation = "any" | "landscape" | "portrait";
export type GameInputKind = "keyboard" | "touch" | "pointer" | "gamepad";

export interface GameRuntimeCapabilities {
  readonly save: boolean;
  readonly replay: boolean;
  readonly multiplayer: boolean;
  readonly fullscreen: boolean;
  readonly audio: boolean;
  readonly inputs: readonly GameInputKind[];
}

export interface GameRuntimePersistence {
  readonly saveVersion: number;
  readonly storage: "localStorage" | "indexedDB" | "server";
}

export interface GameRuntimeNetwork {
  readonly transport: "colyseus" | "custom";
  readonly protocolVersion: number;
  readonly authoritative: boolean;
}

export interface GameRuntimeDefinition {
  readonly id: string;
  readonly slug: string;
  readonly route: `/games/${string}`;
  readonly status: GameReleaseStatus;
  readonly host: GameHostKind;
  readonly engine: GameEngineKind;
  readonly orientation: GameOrientation;
  readonly capabilities: GameRuntimeCapabilities;
  readonly persistence?: GameRuntimePersistence;
  readonly network?: GameRuntimeNetwork;

  /**
   * Public runtime entrypoint for iframe-hosted games.
   * Example: "/seed-ascent.html".
   */
  readonly entrypoint?: `/${string}`;
  readonly entrypointProvision?: "repository" | "build";

  /**
   * Internal canonical route when this route is only a compatibility alias.
   * The registry verifier reports a warning when the target is not present.
   */
  readonly canonicalTarget?: `/games/${string}`;
}

export const gameRuntimeRegistry = [
  {
    id: "weedopolis",
    slug: "weedopolis",
    route: "/games/weedopolis",
    status: "playable",
    host: "iframe",
    engine: "html-dom",
    orientation: "any",
    entrypoint: "/weedopolis/index.html",
    capabilities: {
      save: true,
      replay: false,
      multiplayer: false,
      fullscreen: false,
      audio: false,
      inputs: ["keyboard", "touch", "pointer"],
    },
    persistence: { saveVersion: 1, storage: "localStorage" },
  },
  {
    id: "bud-or-bluff",
    slug: "bud-or-bluff",
    route: "/games/bud-or-bluff",
    status: "playable",
    host: "next-react",
    engine: "react-dom",
    orientation: "any",
    capabilities: {
      save: false,
      replay: false,
      multiplayer: false,
      fullscreen: false,
      audio: false,
      inputs: ["keyboard", "touch", "pointer"],
    },
  },
  {
    id: "stoner-duck-race",
    slug: "stoner-duck-race",
    route: "/games/stoner-duck-race",
    status: "preview",
    host: "next-react",
    engine: "phaser",
    orientation: "landscape",
    capabilities: {
      save: true,
      replay: true,
      multiplayer: true,
      fullscreen: false,
      audio: true,
      inputs: ["keyboard", "touch", "pointer"],
    },
    persistence: { saveVersion: 1, storage: "localStorage" },
    network: {
      transport: "colyseus",
      protocolVersion: 1,
      authoritative: true,
    },
  },
  {
    id: "who-took-it",
    slug: "who-took-it",
    route: "/games/who-took-it",
    status: "playable",
    host: "next-react",
    engine: "react-dom",
    orientation: "any",
    capabilities: {
      save: true,
      replay: false,
      multiplayer: false,
      fullscreen: false,
      audio: false,
      inputs: ["keyboard", "touch", "pointer"],
    },
    persistence: { saveVersion: 1, storage: "localStorage" },
  },
  {
    id: "seed-ascent",
    slug: "seed-ascent",
    route: "/games/seed-ascent",
    status: "playable",
    host: "iframe",
    engine: "canvas2d",
    orientation: "landscape",
    entrypoint: "/seed-ascent.html",
    capabilities: {
      save: true,
      replay: false,
      multiplayer: false,
      fullscreen: true,
      audio: true,
      inputs: ["keyboard", "touch", "pointer"],
    },
    persistence: { saveVersion: 1, storage: "localStorage" },
  },
  {
    id: "thc-rpg",
    slug: "thc-rpg",
    route: "/games/thc-rpg",
    status: "playable",
    host: "iframe",
    engine: "html-dom",
    orientation: "any",
    entrypoint: "/thc-rpg/index.html",
    entrypointProvision: "build",
    capabilities: {
      save: true,
      replay: false,
      multiplayer: false,
      fullscreen: true,
      audio: false,
      inputs: ["keyboard", "touch", "pointer"],
    },
    persistence: { saveVersion: 1, storage: "localStorage" },
  },
  {
    id: "high-iq",
    slug: "high-iq",
    route: "/games/high-iq",
    status: "preview",
    host: "next-react",
    engine: "react-dom",
    orientation: "any",
    capabilities: {
      save: true,
      replay: false,
      multiplayer: false,
      fullscreen: false,
      audio: false,
      inputs: ["keyboard", "touch", "pointer"],
    },
    persistence: { saveVersion: 2, storage: "localStorage" },
  },
  {
    id: "grower-conversations",
    slug: "grower-conversations",
    route: "/games/grower-conversations",
    status: "preview",
    host: "next-react",
    engine: "react-dom",
    orientation: "any",
    capabilities: {
      save: false,
      replay: false,
      multiplayer: false,
      fullscreen: false,
      audio: false,
      inputs: ["keyboard", "touch", "pointer"],
    },
  },
  {
    id: "strain-showdown",
    slug: "strain-showdown",
    route: "/games/strain-showdown",
    status: "preview",
    host: "next-react",
    engine: "react-dom",
    orientation: "any",
    capabilities: {
      save: false,
      replay: false,
      multiplayer: false,
      fullscreen: false,
      audio: false,
      inputs: ["keyboard", "touch", "pointer"],
    },
  },
  {
    id: "phenoquest",
    slug: "phenoquest",
    route: "/games/phenoquest",
    status: "preview",
    host: "iframe",
    engine: "three",
    orientation: "landscape",
    entrypoint: "/phenoquest/index.html",
    capabilities: {
      save: true,
      replay: false,
      multiplayer: false,
      fullscreen: true,
      audio: false,
      inputs: ["keyboard", "touch", "pointer"],
    },
    persistence: { saveVersion: 1, storage: "localStorage" },
  },
  {
    id: "burn-buds",
    slug: "burn-buds",
    route: "/games/burn-buds",
    status: "preview",
    host: "next-react",
    engine: "react-dom",
    orientation: "landscape",
    canonicalTarget: "/games/protect-the-plants",
    capabilities: {
      save: false,
      replay: false,
      multiplayer: true,
      fullscreen: false,
      audio: false,
      inputs: ["keyboard", "touch", "pointer"],
    },
  },
] as const satisfies readonly GameRuntimeDefinition[];

export type GameRuntimeId = (typeof gameRuntimeRegistry)[number]["id"];

export const gameRuntimeBySlug = new Map(
  gameRuntimeRegistry.map((game) => [game.slug, game] as const),
);

export function getGameRuntime(slug: string) {
  return gameRuntimeBySlug.get(slug);
}
