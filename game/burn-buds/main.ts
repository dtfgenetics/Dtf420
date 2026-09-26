import { AUTO, Game, Scale } from "phaser";
import { BootScene } from "@/game/burn-buds/scenes/BootScene";

export const BURN_BUDS_WIDTH = 600;
export const BURN_BUDS_HEIGHT = 840;

function installKeyboardTargeting(game: Game) {
  if (typeof window === "undefined") return;

  const handleKeyDown = (event: KeyboardEvent) => {
    const debug = window.__burnBudsDebug;
    if (!debug) return;

    const snapshot = debug.snapshot();
    if (snapshot.phase !== "player" || snapshot.view !== "target") return;

    const match = /^([A-Z])(\d+)$/.exec(snapshot.cursor);
    if (!match) return;

    const column = match[1].charCodeAt(0) - 65;
    const row = Number(match[2]) - 1;
    let nextRow = row;
    let nextColumn = column;

    if (event.key === "ArrowLeft") nextColumn -= 1;
    else if (event.key === "ArrowRight") nextColumn += 1;
    else if (event.key === "ArrowUp") nextRow -= 1;
    else if (event.key === "ArrowDown") nextRow += 1;
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      debug.fire();
      return;
    } else {
      return;
    }

    event.preventDefault();
    debug.select(nextRow, nextColumn);
  };

  window.addEventListener("keydown", handleKeyDown);
  game.events.once("destroy", () => window.removeEventListener("keydown", handleKeyDown));
}

export function startBurnBuds(parent: string) {
  const game = new Game({
    type: AUTO,
    parent,
    width: BURN_BUDS_WIDTH,
    height: BURN_BUDS_HEIGHT,
    backgroundColor: "#06100a",
    scene: [BootScene],
    input: {
      activePointers: 3,
    },
    scale: {
      mode: Scale.FIT,
      autoCenter: Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: true,
    },
  });

  installKeyboardTargeting(game);
  return game;
}
