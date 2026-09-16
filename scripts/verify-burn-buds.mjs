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

// Preserve deterministic checks for the legacy local engine while the public vanity
// route converges on the canonical multiplayer product. This keeps reusable model
// code honest without allowing the integration repo to present a second Burn Buds.
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
const canonicalRoute = "/games/protect-the-plants/";

assert(page.includes(`const CANONICAL_BURN_BUDS_ROUTE = "${canonicalRoute}"`), "vanity route must point to canonical multiplayer Burn Buds");
assert(page.includes('data-burn-buds-alias="canonical-multiplayer"'), "vanity route must identify itself as the canonical multiplayer alias");
assert(page.includes('httpEquiv="refresh"'), "static export must include a no-server redirect fallback");
assert(page.includes("window.location.replace"), "browser navigation must replace the vanity URL with the canonical route");
assert(page.includes("robots:"), "alias route must carry explicit robot metadata");
assert(page.includes("index: false"), "duplicate vanity route must not compete with the canonical route in search");
assert(!page.includes("BurnBudsLoader"), "vanity route must not boot the legacy solo runtime");
assert(!page.includes("Solo battle"), "vanity route must not advertise a conflicting solo Burn Buds product");

console.log(`Burn Buds verified: ${canonicalRoute} is the only public gameplay runtime; retained local model remains deterministic.`);
