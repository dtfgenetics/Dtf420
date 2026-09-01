export const BOARD_SIZE = 15;
export const COLUMN_LABELS = "ABCDEFGHIJKLMNO".split("");

export type Orientation = "horizontal" | "vertical";
export type ShotState = "none" | "miss" | "hit";

export interface FleetShip {
  id: string;
  name: string;
  size: number;
  shortName: string;
}

export interface BoardCell {
  shipId: string | null;
  shot: ShotState;
}

export type Board = BoardCell[][];

export interface PlacementCell {
  row: number;
  column: number;
}

export interface FireResult {
  board: Board;
  result: "repeat" | "miss" | "hit";
  sunkShipId: string | null;
  allSunk: boolean;
}

export interface FleetStatus {
  id: string;
  name: string;
  size: number;
  placed: boolean;
  hits: number;
  sunk: boolean;
}

export const FLEET: FleetShip[] = [
  { id: "glass-bong", name: "Glass Bong", shortName: "BONG", size: 5 },
  { id: "dab-rig", name: "Dab Rig", shortName: "RIG", size: 4 },
  { id: "rolling-tray", name: "Rolling Tray", shortName: "TRAY", size: 4 },
  { id: "grinder", name: "Grinder", shortName: "GRIND", size: 3 },
  { id: "one-hitter", name: "One-Hitter", shortName: "ONE", size: 2 },
];

export function createBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ shipId: null, shot: "none" as ShotState })),
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

export function cellsForPlacement(
  row: number,
  column: number,
  size: number,
  orientation: Orientation,
): PlacementCell[] {
  return Array.from({ length: size }, (_, offset) => ({
    row: row + (orientation === "vertical" ? offset : 0),
    column: column + (orientation === "horizontal" ? offset : 0),
  }));
}

export function canPlaceShip(
  board: Board,
  ship: FleetShip,
  row: number,
  column: number,
  orientation: Orientation,
): boolean {
  const cells = cellsForPlacement(row, column, ship.size, orientation);
  return cells.every(
    (cell) =>
      cell.row >= 0 &&
      cell.row < BOARD_SIZE &&
      cell.column >= 0 &&
      cell.column < BOARD_SIZE &&
      board[cell.row]?.[cell.column]?.shipId === null,
  );
}

export function placeShip(
  board: Board,
  ship: FleetShip,
  row: number,
  column: number,
  orientation: Orientation,
): Board | null {
  if (!canPlaceShip(board, ship, row, column, orientation)) return null;
  const next = cloneBoard(board);
  for (const cell of cellsForPlacement(row, column, ship.size, orientation)) {
    next[cell.row][cell.column].shipId = ship.id;
  }
  return next;
}

export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  if (state === 0) state = 0x6d2b79f5;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomizeFleet(seed: number): Board {
  const rng = createRng(seed);
  let board = createBoard();

  for (const ship of FLEET) {
    let placed = false;
    for (let attempt = 0; attempt < 4000; attempt += 1) {
      const orientation: Orientation = rng() < 0.5 ? "horizontal" : "vertical";
      const row = Math.floor(rng() * BOARD_SIZE);
      const column = Math.floor(rng() * BOARD_SIZE);
      const next = placeShip(board, ship, row, column, orientation);
      if (next) {
        board = next;
        placed = true;
        break;
      }
    }
    if (!placed) throw new Error(`Unable to place ${ship.name}`);
  }

  return board;
}

export function shipCells(board: Board, shipId: string): PlacementCell[] {
  const cells: PlacementCell[] = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      if (board[row][column].shipId === shipId) cells.push({ row, column });
    }
  }
  return cells;
}

export function isShipSunk(board: Board, shipId: string): boolean {
  const cells = shipCells(board, shipId);
  return cells.length > 0 && cells.every((cell) => board[cell.row][cell.column].shot === "hit");
}

export function areAllShipsSunk(board: Board): boolean {
  return FLEET.every((ship) => isShipSunk(board, ship.id));
}

export function fireAt(board: Board, row: number, column: number): FireResult {
  if (row < 0 || row >= BOARD_SIZE || column < 0 || column >= BOARD_SIZE) {
    return { board, result: "repeat", sunkShipId: null, allSunk: areAllShipsSunk(board) };
  }

  const current = board[row][column];
  if (current.shot !== "none") {
    return { board, result: "repeat", sunkShipId: null, allSunk: areAllShipsSunk(board) };
  }

  const next = cloneBoard(board);
  const target = next[row][column];
  target.shot = target.shipId ? "hit" : "miss";
  const sunkShipId = target.shipId && isShipSunk(next, target.shipId) ? target.shipId : null;

  return {
    board: next,
    result: target.shipId ? "hit" : "miss",
    sunkShipId,
    allSunk: areAllShipsSunk(next),
  };
}

export function fleetStatus(board: Board): FleetStatus[] {
  return FLEET.map((ship) => {
    const cells = shipCells(board, ship.id);
    const hits = cells.filter((cell) => board[cell.row][cell.column].shot === "hit").length;
    return {
      ...ship,
      placed: cells.length === ship.size,
      hits,
      sunk: cells.length === ship.size && hits === ship.size,
    };
  });
}

function orthogonalNeighbors(row: number, column: number): PlacementCell[] {
  return [
    { row: row - 1, column },
    { row: row + 1, column },
    { row, column: column - 1 },
    { row, column: column + 1 },
  ].filter(
    (cell) =>
      cell.row >= 0 &&
      cell.row < BOARD_SIZE &&
      cell.column >= 0 &&
      cell.column < BOARD_SIZE,
  );
}

export function chooseAiTarget(board: Board, seed: number, turn: number): PlacementCell | null {
  const rng = createRng((seed + Math.imul(turn + 1, 2654435761)) >>> 0);
  const targetKeys = new Set<string>();

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const cell = board[row][column];
      if (cell.shot !== "hit" || !cell.shipId || isShipSunk(board, cell.shipId)) continue;
      for (const neighbor of orthogonalNeighbors(row, column)) {
        if (board[neighbor.row][neighbor.column].shot === "none") {
          targetKeys.add(`${neighbor.row}:${neighbor.column}`);
        }
      }
    }
  }

  const targetCandidates = [...targetKeys].map((key) => {
    const [row, column] = key.split(":").map(Number);
    return { row, column };
  });
  if (targetCandidates.length > 0) {
    return targetCandidates[Math.floor(rng() * targetCandidates.length)] ?? null;
  }

  const parity: PlacementCell[] = [];
  const fallback: PlacementCell[] = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      if (board[row][column].shot !== "none") continue;
      const candidate = { row, column };
      fallback.push(candidate);
      if ((row + column) % 2 === 0) parity.push(candidate);
    }
  }

  const pool = parity.length > 0 ? parity : fallback;
  return pool[Math.floor(rng() * pool.length)] ?? null;
}

export function placedShipCount(board: Board): number {
  return fleetStatus(board).filter((ship) => ship.placed).length;
}

export function shotCount(board: Board): number {
  return board.flat().filter((cell) => cell.shot !== "none").length;
}

export function coordinateLabel(row: number, column: number): string {
  return `${COLUMN_LABELS[column] ?? "?"}${row + 1}`;
}
