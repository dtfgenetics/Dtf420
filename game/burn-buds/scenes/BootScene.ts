import { Scene } from "phaser";
import {
  BOARD_SIZE,
  COLUMN_LABELS,
  FLEET,
  chooseAiTarget,
  coordinateLabel,
  createBoard,
  fireAt,
  fleetStatus,
  placedShipCount,
  placeShip,
  randomizeFleet,
  shotCount,
  type Board,
  type Orientation,
} from "@/game/burn-buds/model";

type Phase = "placement" | "player" | "ai" | "won" | "lost";
type BoardView = "fleet" | "target";

type BurnBudsDebug = {
  snapshot: () => {
    phase: Phase;
    view: BoardView;
    placed: number;
    playerShots: number;
    aiShots: number;
    enemySunk: number;
    playerSunk: number;
    cursor: string;
    seed: number;
    message: string;
  };
  autoPlace: () => void;
  start: () => boolean;
  select: (row: number, column: number) => void;
  fire: () => boolean;
  reset: () => void;
};

declare global {
  interface Window {
    __burnBudsDebug?: BurnBudsDebug;
  }
}

const CELL_SIZE = 32;
const BOARD_X = 60;
const BOARD_Y = 160;
const BOARD_PIXELS = BOARD_SIZE * CELL_SIZE;
const GAME_WIDTH = 600;
const GAME_HEIGHT = 840;

const palette = {
  background: 0x06100a,
  panel: 0x0c1d13,
  boardA: 0x10281a,
  boardB: 0x0c2116,
  grid: 0x31543d,
  accent: 0xb7e25d,
  accentDim: 0x5f874f,
  text: "#eef8e5",
  muted: "#90a398",
  waterMiss: 0x6e91a5,
  hit: 0xe96a58,
  sunk: 0xffc857,
  ship: 0x5c8f62,
  shipEdge: 0xa7db83,
  cursor: 0xdaf59e,
};

function shipName(shipId: string | null) {
  return FLEET.find((ship) => ship.id === shipId)?.name ?? "piece";
}

export class BootScene extends Scene {
  private playerBoard: Board = createBoard();
  private enemyBoard: Board = createBoard();
  private phase: Phase = "placement";
  private view: BoardView = "fleet";
  private orientation: Orientation = "horizontal";
  private currentShipIndex = 0;
  private cursorRow = 7;
  private cursorColumn = 7;
  private seed = 1;
  private aiTurnIndex = 0;
  private message = "Place your Glass Bong to begin.";

  constructor() {
    super("BurnBudsBoot");
  }

  create() {
    this.resetMatch();
    this.events.once("shutdown", () => {
      if (typeof window !== "undefined") delete window.__burnBudsDebug;
    });
  }

  private resetMatch() {
    this.seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    this.playerBoard = createBoard();
    this.enemyBoard = randomizeFleet((this.seed + 2) >>> 0);
    this.phase = "placement";
    this.view = "fleet";
    this.orientation = "horizontal";
    this.currentShipIndex = 0;
    this.cursorRow = 7;
    this.cursorColumn = 7;
    this.aiTurnIndex = 0;
    this.message = "Place your Glass Bong to begin.";
    this.installDebugBridge();
    this.render();
  }

  private installDebugBridge() {
    if (typeof window === "undefined") return;
    window.__burnBudsDebug = {
      snapshot: () => {
        const enemy = fleetStatus(this.enemyBoard);
        const player = fleetStatus(this.playerBoard);
        return {
          phase: this.phase,
          view: this.view,
          placed: placedShipCount(this.playerBoard),
          playerShots: shotCount(this.enemyBoard),
          aiShots: shotCount(this.playerBoard),
          enemySunk: enemy.filter((ship) => ship.sunk).length,
          playerSunk: player.filter((ship) => ship.sunk).length,
          cursor: coordinateLabel(this.cursorRow, this.cursorColumn),
          seed: this.seed,
          message: this.message,
        };
      },
      autoPlace: () => this.autoPlace(),
      start: () => this.startBattle(),
      select: (row, column) => {
        this.cursorRow = Math.max(0, Math.min(BOARD_SIZE - 1, row));
        this.cursorColumn = Math.max(0, Math.min(BOARD_SIZE - 1, column));
        this.view = "target";
        this.render();
      },
      fire: () => this.fireSelected(),
      reset: () => this.resetMatch(),
    };
  }

  private render() {
    this.children.removeAll(true);
    this.drawBackground();
    this.drawHeader();
    this.drawBoard();
    this.drawFleetSummary();
    this.drawControls();
  }

  private drawBackground() {
    const graphics = this.add.graphics();
    graphics.fillStyle(palette.background, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    graphics.fillStyle(0x0a1710, 1);
    graphics.fillRoundedRect(18, 18, GAME_WIDTH - 36, 104, 20);
    graphics.lineStyle(1, 0x294936, 0.9);
    graphics.strokeRoundedRect(18, 18, GAME_WIDTH - 36, 104, 20);
  }

  private drawHeader() {
    this.add.text(38, 34, "BURN BUDS", {
      fontFamily: "Inter, Arial, Helvetica, sans-serif",
      fontSize: "28px",
      fontStyle: "bold",
      color: palette.text,
    });

    const phaseLabel =
      this.phase === "placement"
        ? "SETUP"
        : this.phase === "player"
          ? "YOUR TURN"
          : this.phase === "ai"
            ? "OPPONENT"
            : this.phase === "won"
              ? "VICTORY"
              : "DEFEAT";

    const pill = this.add.rectangle(500, 52, 130, 38, this.phase === "won" ? 0x315c2e : 0x122a1c, 1);
    pill.setStrokeStyle(1, this.phase === "lost" ? 0x8f3e38 : palette.accentDim, 0.9);
    this.add.text(500, 52, phaseLabel, {
      fontFamily: "Inter, Arial, Helvetica, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: this.phase === "lost" ? "#ffc0b8" : "#d9f7a5",
    }).setOrigin(0.5);

    this.add.text(38, 78, this.message, {
      fontFamily: "Inter, Arial, Helvetica, sans-serif",
      fontSize: "13px",
      color: palette.muted,
      wordWrap: { width: 510 },
    });

    if (this.phase === "placement") {
      const ship = FLEET[this.currentShipIndex];
      const setupText = ship
        ? `${ship.name} · ${ship.size} cells · ${this.orientation.toUpperCase()}`
        : "Fleet ready · start battle when ready";
      this.add.text(38, 102, setupText, {
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#c8e8a3",
      });
    } else {
      this.add.text(38, 102, `${this.view === "target" ? "TARGET GRID" : "YOUR FLEET"} · selected ${coordinateLabel(this.cursorRow, this.cursorColumn)}`, {
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#c8e8a3",
      });
    }
  }

  private drawBoard() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x08170f, 1);
    graphics.fillRoundedRect(BOARD_X - 34, BOARD_Y - 30, BOARD_PIXELS + 52, BOARD_PIXELS + 48, 18);
    graphics.lineStyle(1, 0x1f3829, 1);
    graphics.strokeRoundedRect(BOARD_X - 34, BOARD_Y - 30, BOARD_PIXELS + 52, BOARD_PIXELS + 48, 18);

    COLUMN_LABELS.forEach((label, index) => {
      this.add.text(BOARD_X + index * CELL_SIZE + CELL_SIZE / 2, BOARD_Y - 18, label, {
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        fontSize: "10px",
        fontStyle: "bold",
        color: "#82958b",
      }).setOrigin(0.5);
    });

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      this.add.text(BOARD_X - 17, BOARD_Y + row * CELL_SIZE + CELL_SIZE / 2, String(row + 1), {
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        fontSize: "10px",
        fontStyle: "bold",
        color: "#82958b",
      }).setOrigin(0.5);

      for (let column = 0; column < BOARD_SIZE; column += 1) {
        this.drawCell(row, column);
      }
    }

    graphics.lineStyle(3, palette.accent, 0.85);
    graphics.strokeRect(BOARD_X, BOARD_Y, BOARD_PIXELS, BOARD_PIXELS);
  }

  private drawCell(row: number, column: number) {
    const board = this.view === "fleet" ? this.playerBoard : this.enemyBoard;
    const cell = board[row][column];
    const x = BOARD_X + column * CELL_SIZE;
    const y = BOARD_Y + row * CELL_SIZE;
    const alternate = (row + column) % 2 === 0;
    const rectangle = this.add.rectangle(
      x + CELL_SIZE / 2,
      y + CELL_SIZE / 2,
      CELL_SIZE - 1,
      CELL_SIZE - 1,
      alternate ? palette.boardA : palette.boardB,
      1,
    );
    rectangle.setStrokeStyle(1, palette.grid, 0.6);

    const ownShip = this.view === "fleet" && cell.shipId;
    const enemySunk = this.view === "target" && cell.shipId && fleetStatus(this.enemyBoard).find((ship) => ship.id === cell.shipId)?.sunk;
    if (ownShip || enemySunk) {
      rectangle.setFillStyle(enemySunk ? 0x59491f : palette.ship, 1);
      rectangle.setStrokeStyle(1, enemySunk ? palette.sunk : palette.shipEdge, 0.95);
    }

    if (cell.shot === "miss") {
      this.add.circle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 5, palette.waterMiss, 0.95);
    }
    if (cell.shot === "hit") {
      this.add.circle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 8, enemySunk ? palette.sunk : palette.hit, 1);
      this.add.line(0, 0, x + 9, y + 9, x + CELL_SIZE - 9, y + CELL_SIZE - 9, 0xffffff, 0.7).setOrigin(0, 0);
      this.add.line(0, 0, x + CELL_SIZE - 9, y + 9, x + 9, y + CELL_SIZE - 9, 0xffffff, 0.7).setOrigin(0, 0);
    }

    if (this.view === "target" && row === this.cursorRow && column === this.cursorColumn && this.phase !== "placement") {
      rectangle.setStrokeStyle(3, palette.cursor, 1);
    }

    rectangle.setInteractive({ useHandCursor: true });
    rectangle.on("pointerdown", () => this.handleCell(row, column));
  }

  private handleCell(row: number, column: number) {
    if (this.phase === "placement") {
      const ship = FLEET[this.currentShipIndex];
      if (!ship) return;
      const next = placeShip(this.playerBoard, ship, row, column, this.orientation);
      if (!next) {
        this.message = `${ship.name} does not fit there. Pick a clear ${ship.size}-cell run.`;
        this.render();
        return;
      }
      this.playerBoard = next;
      this.currentShipIndex += 1;
      const nextShip = FLEET[this.currentShipIndex];
      this.message = nextShip
        ? `${ship.name} locked. Place ${nextShip.name}.`
        : "Fleet locked. Start the battle or clear and reposition.";
      this.render();
      return;
    }

    if (this.phase === "player" && this.view === "target") {
      this.cursorRow = row;
      this.cursorColumn = column;
      this.message = `Target ${coordinateLabel(row, column)} selected. Press FIRE.`;
      this.render();
    }
  }

  private autoPlace() {
    if (this.phase !== "placement") return;
    this.playerBoard = randomizeFleet((this.seed + 11) >>> 0);
    this.currentShipIndex = FLEET.length;
    this.message = "Fleet auto-placed. Start battle or clear to place it yourself.";
    this.render();
  }

  private clearPlacement() {
    if (this.phase !== "placement") return;
    this.playerBoard = createBoard();
    this.currentShipIndex = 0;
    this.orientation = "horizontal";
    this.message = "Fleet cleared. Place your Glass Bong to begin.";
    this.render();
  }

  private rotatePlacement() {
    if (this.phase !== "placement") return;
    this.orientation = this.orientation === "horizontal" ? "vertical" : "horizontal";
    this.message = `Placement rotated ${this.orientation}.`;
    this.render();
  }

  private startBattle() {
    if (this.phase !== "placement" || placedShipCount(this.playerBoard) !== FLEET.length) return false;
    this.phase = "player";
    this.view = "target";
    this.message = "Your turn. Select a target and fire.";
    this.render();
    return true;
  }

  private fireSelected() {
    if (this.phase !== "player" || this.view !== "target") return false;
    const result = fireAt(this.enemyBoard, this.cursorRow, this.cursorColumn);
    if (result.result === "repeat") {
      this.message = `${coordinateLabel(this.cursorRow, this.cursorColumn)} was already fired on.`;
      this.render();
      return false;
    }

    this.enemyBoard = result.board;
    if (result.allSunk) {
      this.phase = "won";
      this.message = "All opponent pieces burned. You win.";
      this.render();
      return true;
    }

    this.phase = "ai";
    this.message = result.sunkShipId
      ? `${shipName(result.sunkShipId)} sunk. Opponent is firing…`
      : `${coordinateLabel(this.cursorRow, this.cursorColumn)}: ${result.result.toUpperCase()}. Opponent is firing…`;
    this.render();
    this.time.delayedCall(420, () => this.takeAiTurn());
    return true;
  }

  private takeAiTurn() {
    if (this.phase !== "ai") return;
    const target = chooseAiTarget(this.playerBoard, (this.seed + 31) >>> 0, this.aiTurnIndex);
    if (!target) {
      this.phase = "player";
      this.message = "Opponent has no legal shots. Your turn.";
      this.render();
      return;
    }

    const result = fireAt(this.playerBoard, target.row, target.column);
    this.playerBoard = result.board;
    this.aiTurnIndex += 1;

    if (result.allSunk) {
      this.phase = "lost";
      this.view = "fleet";
      this.message = "Your whole fleet is burned. Reset and run it back.";
      this.render();
      return;
    }

    this.phase = "player";
    this.view = "target";
    this.message = result.sunkShipId
      ? `Opponent sank your ${shipName(result.sunkShipId)} at ${coordinateLabel(target.row, target.column)}. Your turn.`
      : `Opponent fired ${coordinateLabel(target.row, target.column)}: ${result.result.toUpperCase()}. Your turn.`;
    this.render();
  }

  private moveCursor(deltaRow: number, deltaColumn: number) {
    if (this.phase !== "player" || this.view !== "target") return;
    this.cursorRow = Math.max(0, Math.min(BOARD_SIZE - 1, this.cursorRow + deltaRow));
    this.cursorColumn = Math.max(0, Math.min(BOARD_SIZE - 1, this.cursorColumn + deltaColumn));
    this.message = `Target ${coordinateLabel(this.cursorRow, this.cursorColumn)} selected.`;
    this.render();
  }

  private toggleView() {
    if (this.phase === "placement") return;
    this.view = this.view === "target" ? "fleet" : "target";
    this.message = this.view === "target" ? "Target grid open." : "Reviewing your fleet damage.";
    this.render();
  }

  private drawFleetSummary() {
    const player = fleetStatus(this.playerBoard);
    const enemy = fleetStatus(this.enemyBoard);
    const playerSunk = player.filter((ship) => ship.sunk).length;
    const enemySunk = enemy.filter((ship) => ship.sunk).length;

    this.add.text(30, 660, `YOUR FLEET  ${Math.max(0, FLEET.length - playerSunk)}/${FLEET.length} afloat`, {
      fontFamily: "Inter, Arial, Helvetica, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#c9e7c4",
    });
    this.add.text(570, 660, `OPPONENT  ${Math.max(0, FLEET.length - enemySunk)}/${FLEET.length} afloat`, {
      fontFamily: "Inter, Arial, Helvetica, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#c9e7c4",
    }).setOrigin(1, 0);

    const fleetLine = player
      .map((ship) => `${ship.shortName}:${ship.sunk ? "×" : ship.placed ? "●" : "○"}`)
      .join("   ");
    this.add.text(30, 684, fleetLine, {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: "10px",
      color: palette.muted,
    });

    if (this.phase !== "placement") {
      this.add.text(570, 684, `Shots ${shotCount(this.enemyBoard)} · Incoming ${shotCount(this.playerBoard)}`, {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "10px",
        color: palette.muted,
      }).setOrigin(1, 0);
    }
  }

  private drawControls() {
    if (this.phase === "placement") {
      const ready = placedShipCount(this.playerBoard) === FLEET.length;
      this.button(87, 760, 118, 70, "ROTATE", () => this.rotatePlacement());
      this.button(229, 760, 142, 70, "AUTO PLACE", () => this.autoPlace());
      this.button(371, 760, 118, 70, "CLEAR", () => this.clearPlacement());
      this.button(513, 760, 142, 70, "START", () => this.startBattle(), !ready, ready);
      return;
    }

    if (this.phase === "won" || this.phase === "lost") {
      this.button(300, 760, 220, 72, "PLAY AGAIN", () => this.resetMatch(), false, true);
      return;
    }

    const targetMode = this.view === "target" && this.phase === "player";
    this.button(62, 760, 92, 70, this.view === "target" ? "FLEET" : "TARGET", () => this.toggleView());
    this.button(161, 760, 82, 70, "←", () => this.moveCursor(0, -1), !targetMode);
    this.button(251, 760, 82, 70, "↑", () => this.moveCursor(-1, 0), !targetMode);
    this.button(341, 760, 82, 70, "↓", () => this.moveCursor(1, 0), !targetMode);
    this.button(431, 760, 82, 70, "→", () => this.moveCursor(0, 1), !targetMode);
    this.button(538, 760, 104, 70, "FIRE", () => this.fireSelected(), !targetMode, targetMode);
  }

  private button(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    action: () => void,
    disabled = false,
    primary = false,
  ) {
    const fill = disabled ? 0x111a14 : primary ? 0x315c2e : 0x12271a;
    const stroke = disabled ? 0x27332a : primary ? palette.accent : 0x436649;
    const rectangle = this.add.rectangle(x, y, width, height, fill, 1);
    rectangle.setStrokeStyle(primary ? 2 : 1, stroke, disabled ? 0.45 : 0.95);
    this.add.text(x, y, label, {
      fontFamily: "Inter, Arial, Helvetica, sans-serif",
      fontSize: label.length <= 2 ? "24px" : "12px",
      fontStyle: "bold",
      color: disabled ? "#5c6860" : primary ? "#e8ffb3" : "#d6e4d8",
    }).setOrigin(0.5);

    if (!disabled) {
      rectangle.setInteractive({ useHandCursor: true });
      rectangle.on("pointerdown", action);
    }
  }
}
