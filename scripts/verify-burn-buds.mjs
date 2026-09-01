import fs from "node:fs";
import path from "node:path";
import {
  BOARD_SIZE,
  FLEET,
  areAllShipsSunk,
  chooseAiTarget,
  createBoard,
  fireAt,
  fleetStatus,
  placeShip,
  randomizeFleet,
  shipCells,
} from "../game/burn-buds/model.ts";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(`Burn Buds verification failed: ${message}`);
}

assert(BOARD_SIZE === 15, "board must remain 15 × 15");
assert(FLEET.length === 5, "fleet must contain five pieces");
assert(
  JSON.stringify(FLEET.map((ship) => ship.size)) === JSON.stringify([5, 4, 4, 3, 2]),
  "fleet sizes must remain 5/4/4/3/2",
);
assert(new Set(FLEET.map((ship) => ship.id)).size === FLEET.length, "fleet IDs must be unique");

const seed = 4202026;
const firstRandom = randomizeFleet(seed);
const secondRandom = randomizeFleet(seed);
assert(JSON.stringify(firstRandom) === JSON.stringify(secondRandom), "seeded auto-placement must be deterministic");

for (const ship of FLEET) {
  assert(shipCells(firstRandom, ship.id).length === ship.size, `${ship.name} must occupy exactly ${ship.size} cells`);
}
assert(fleetStatus(firstRandom).every((ship) => ship.placed), "auto-placement must place the full fleet");

let manual = createBoard();
const first = FLEET[0];
const placed = placeShip(manual, first, 0, 0, "horizontal");
assert(placed, "legal manual placement should succeed");
manual = placed;
assert(placeShip(manual, FLEET[1], 0, 0, "vertical") === null, "overlapping placement must be rejected");
assert(placeShip(manual, FLEET[1], 14, 14, "horizontal") === null, "out-of-bounds placement must be rejected");

const targetBoard = randomizeFleet(77);
const occupied = shipCells(targetBoard, FLEET[0].id)[0];
let blank = null;
for (let row = 0; row < BOARD_SIZE && blank === null; row += 1) {
  for (let column = 0; column < BOARD_SIZE; column += 1) {
    if (targetBoard[row][column].shipId === null) {
      blank = { row, column };
      break;
    }
  }
}
assert(occupied && blank, "test board must contain occupied and empty coordinates");

const miss = fireAt(targetBoard, blank.row, blank.column);
assert(miss.result === "miss", "empty coordinate must register a miss");
const repeat = fireAt(miss.board, blank.row, blank.column);
assert(repeat.result === "repeat", "repeat fire must be rejected");
const hit = fireAt(targetBoard, occupied.row, occupied.column);
assert(hit.result === "hit", "occupied coordinate must register a hit");

let sinkingBoard = targetBoard;
for (const cell of shipCells(targetBoard, FLEET[0].id)) {
  sinkingBoard = fireAt(sinkingBoard, cell.row, cell.column).board;
}
assert(fleetStatus(sinkingBoard).find((ship) => ship.id === FLEET[0].id)?.sunk, "fully hit piece must be sunk");
assert(!areAllShipsSunk(sinkingBoard), "sinking one piece must not end the match");

const aiProbeBoard = randomizeFleet(91);
const probeShip = FLEET.find((ship) => ship.size >= 3);
const probeCells = shipCells(aiProbeBoard, probeShip.id);
const middle = probeCells[Math.floor(probeCells.length / 2)];
const aiDamaged = fireAt(aiProbeBoard, middle.row, middle.column).board;
const aiTarget = chooseAiTarget(aiDamaged, 1234, 1);
assert(aiTarget, "AI must return a legal target while unknown cells remain");
assert(aiDamaged[aiTarget.row][aiTarget.column].shot === "none", "AI must never target a previously fired coordinate");
const distance = Math.abs(aiTarget.row - middle.row) + Math.abs(aiTarget.column - middle.column);
assert(distance === 1, "AI should hunt orthogonally adjacent to an unresolved hit");

const scene = read("game/burn-buds/scenes/BootScene.ts");
const page = read("app/games/burn-buds/page.tsx");
const gameComponent = read("components/game/BurnBudsGame.tsx");
const loader = read("components/game/BurnBudsLoader.tsx");
const gameCss = read("components/game/BurnBudsGame.module.css");

for (const token of [
  'type Phase = "placement" | "player" | "ai" | "won" | "lost"',
  "__burnBudsDebug",
  "autoPlace()",
  "startBattle()",
  "fireSelected()",
  "takeAiTurn()",
  "PLAY AGAIN",
  "Hunt + target AI",
]) {
  assert(scene.includes(token) || page.includes(token), `missing playable system marker: ${token}`);
}

assert(page.includes("Playable beta"), "route must describe current beta state truthfully");
assert(page.includes("Development preview"), "route must retain development-preview release label");
assert(gameComponent.includes("tactical fleet battle"), "game surface accessibility label must describe playable battle");
assert(!loader.includes("board preview"), "loader must not describe the old static preview");
assert(gameCss.includes("aspect-ratio: 5 / 7"), "game shell must preserve the 600×840 responsive aspect ratio");
assert(gameCss.includes("touch-action: manipulation"), "canvas must expose touch-friendly input behavior");

console.log(`Burn Buds verified: ${BOARD_SIZE}×${BOARD_SIZE}, ${FLEET.length} pieces, deterministic placement/fire/AI and playable scene contract.`);
