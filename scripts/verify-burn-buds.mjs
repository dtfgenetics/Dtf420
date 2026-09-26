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

// Keep deterministic checks for the retained local engine while the public route
// honestly reports release status. This protects reusable game logic without
// redirecting players to a route that is not mounted in the current application.
assert(BOARD_SIZE === 15, "legacy tactical model must remain 15 × 15 while retained");
assert(FLEET.length === 5, "legacy tactical model must retain five pieces while retained");
assert(
  JSON.stringify(FLEET.map((ship) => ship.size)) === JSON.stringify([5, 4, 4, 3, 2]),
  "legacy fleet sizes must remain 5/4/4/3/2",
);
assert(new Set(FLEET.map((ship) => ship.id)).size === FLEET.length, "legacy fleet IDs must be unique");

const seed = 4202026;
const firstRandom = randomizeFleet(seed);
const secondRandom = randomizeFleet(seed);
assert(JSON.stringify(firstRandom) === JSON.stringify(secondRandom), "seeded auto-placement must stay deterministic");

for (const ship of FLEET) {
  assert(shipCells(firstRandom, ship.id).length === ship.size, `${ship.name} must occupy exactly ${ship.size} cells`);
}
assert(fleetStatus(firstRandom).every((ship) => ship.placed), "auto-placement must place the full legacy fleet");

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
assert(occupied && blank, "legacy test board must contain occupied and empty coordinates");

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
assert(!areAllShipsSunk(sinkingBoard), "sinking one piece must not end the legacy match");

const aiProbeBoard = randomizeFleet(91);
const probeShip = FLEET.find((ship) => ship.size >= 3);
const probeCells = shipCells(aiProbeBoard, probeShip.id);
const middle = probeCells[Math.floor(probeCells.length / 2)];
const aiDamaged = fireAt(aiProbeBoard, middle.row, middle.column).board;
const aiTarget = chooseAiTarget(aiDamaged, 1234, 1);
assert(aiTarget, "legacy AI must return a legal target while unknown cells remain");
assert(aiDamaged[aiTarget.row][aiTarget.column].shot === "none", "legacy AI must never retarget a fired coordinate");

const page = read("app/games/burn-buds/page.tsx");
const missingRoute = "/games/protect-the-plants/";

assert(page.includes('href="/games/"'), "release-status route must provide a working return path to the Game Hub");
assert(page.includes("not currently mounted"), "release-status route must explain why gameplay is unavailable");
assert(page.includes("robots:"), "release-status route must carry explicit robot metadata");
assert(page.includes("index: false"), "release-status route must stay out of search until gameplay is mounted");
assert(!page.includes(missingRoute), "release-status route must not send players to the missing canonical path");
assert(!page.includes('httpEquiv="refresh"'), "release-status route must not use a forced meta redirect");
assert(!page.includes("window.location.replace"), "release-status route must not force browser navigation");
assert(!page.includes("BurnBudsLoader"), "release-status route must not boot the legacy solo runtime");
assert(!page.includes("Solo battle"), "release-status route must not advertise a conflicting solo Burn Buds product");

console.log("Burn Buds verified: release-status route avoids the missing gameplay path; retained local model remains deterministic.");
