import Phaser from "phaser";
import { createRaceConfig } from "../config";
import { RaceSimulation } from "../simulation";
import type { DuckState, RaceModeId } from "../types";

const WORLD_MARGIN_X = 72;
const WORLD_TOP = 128;
const WORLD_BOTTOM = 662;
const SIM_STEP_MS = 50;

interface DuckView {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Ellipse;
  head: Phaser.GameObjects.Ellipse;
  bill: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

export class RaceScene extends Phaser.Scene {
  private simulation!: RaceSimulation;
  private duckViews = new Map<string, DuckView>();
  private accumulator = 0;
  private selectedMode: RaceModeId = "derby";
  private inputSequence = 0;
  private statusText!: Phaser.GameObjects.Text;
  private standingsText!: Phaser.GameObjects.Text;
  private helpText!: Phaser.GameObjects.Text;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private boostKey?: Phaser.Input.Keyboard.Key;
  private diveKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super("StonerDuckRace");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#102a32");
    this.drawTrack();
    this.createSimulation(this.selectedMode);

    this.statusText = this.add.text(28, 22, "", {
      fontFamily: "Arial, sans-serif",
      fontSize: "26px",
      color: "#f4f7df",
      fontStyle: "bold",
    });

    this.standingsText = this.add.text(28, 64, "", {
      fontFamily: "monospace",
      fontSize: "15px",
      color: "#d8f5dd",
      lineSpacing: 3,
    });

    this.helpText = this.add.text(1260, 24, "1 Derby  ·  2 Rally  ·  3 Chaos  ·  R restart", {
      fontFamily: "Arial, sans-serif",
      fontSize: "15px",
      color: "#b8d7c0",
    }).setOrigin(1, 0);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.boostKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.diveKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    this.input.keyboard?.on("keydown-ONE", () => this.resetRace("derby"));
    this.input.keyboard?.on("keydown-TWO", () => this.resetRace("rally"));
    this.input.keyboard?.on("keydown-THREE", () => this.resetRace("chaos"));
    this.input.keyboard?.on("keydown-R", () => this.resetRace(this.selectedMode));
  }

  update(_time: number, delta: number): void {
    this.accumulator += Math.min(delta, 100);

    if (this.selectedMode !== "derby") {
      this.inputSequence += 1;
      this.simulation.setInput("duck-1", {
        steer: (this.cursors?.left?.isDown ? -1 : 0) + (this.cursors?.right?.isDown ? 1 : 0),
        boost: Boolean(this.boostKey?.isDown),
        dive: Boolean(this.diveKey?.isDown),
        usePowerup: false,
        sequence: this.inputSequence,
      });
    }

    while (this.accumulator >= SIM_STEP_MS) {
      this.simulation.step();
      this.accumulator -= SIM_STEP_MS;
    }

    this.renderState();
  }

  private createSimulation(mode: RaceModeId): void {
    const config = createRaceConfig(mode, 50, `DTF-${mode}-420`);
    this.simulation = new RaceSimulation(config);

    if (mode !== "derby") {
      this.simulation.claimDuck("duck-1", "local-player", "YOU");
    }

    this.buildDuckViews();
  }

  private resetRace(mode: RaceModeId): void {
    this.selectedMode = mode;
    this.accumulator = 0;
    this.inputSequence = 0;

    for (const view of this.duckViews.values()) {
      view.container.destroy(true);
    }
    this.duckViews.clear();

    this.createSimulation(mode);
  }

  private buildDuckViews(): void {
    for (const duck of this.simulation.state.ducks) {
      const container = this.add.container(0, 0);
      const isPlayer = duck.playerId === "local-player";
      const body = this.add.ellipse(0, 0, isPlayer ? 24 : 20, isPlayer ? 18 : 15, isPlayer ? 0xf8d347 : 0xe9c440);
      const head = this.add.ellipse(8, -8, isPlayer ? 14 : 12, isPlayer ? 14 : 12, isPlayer ? 0xffe067 : 0xf4d35e);
      const bill = this.add.rectangle(15, -7, isPlayer ? 10 : 8, 4, 0xf28c28);
      const label = this.add.text(0, 13, duck.rank.toString(), {
        fontFamily: "Arial, sans-serif",
        fontSize: isPlayer ? "10px" : "8px",
        color: "#ffffff",
        backgroundColor: isPlayer ? "#234f2c" : "#00000066",
        padding: { x: 2, y: 1 },
      }).setOrigin(0.5, 0);

      container.add([body, head, bill, label]);
      container.setDepth(isPlayer ? 20 : 10);
      this.duckViews.set(duck.id, { container, body, head, bill, label });
    }
  }

  private renderState(): void {
    const { state } = this.simulation;
    const raceWidth = this.scale.width - WORLD_MARGIN_X * 2;
    const riverHeight = WORLD_BOTTOM - WORLD_TOP;

    for (const duck of state.ducks) {
      const view = this.duckViews.get(duck.id);
      if (!view) continue;

      const x = WORLD_MARGIN_X + duck.progress * raceWidth;
      const y = WORLD_TOP + ((duck.lateral + 1) / 2) * riverHeight;
      view.container.setPosition(x, y);
      view.label.setText(duck.playerId === "local-player" ? "YOU" : String(duck.rank));
      view.container.setAlpha(duck.finished ? 0.68 : 1);
    }

    const countdownRemaining = Math.max(0, state.config.countdownTicks - state.tick);
    const countdownSeconds = Math.ceil(countdownRemaining / state.config.tickRate);
    const winner = state.winnerId ? state.ducks.find((duck) => duck.id === state.winnerId) : null;

    const phaseLabel = state.phase === "countdown"
      ? `STARTING IN ${countdownSeconds}`
      : state.phase === "finished"
        ? `WINNER: ${winner?.name ?? "Duck"}`
        : `${this.selectedMode.toUpperCase()} · 50 DUCKS`;

    this.statusText.setText(phaseLabel);

    const leaders = [...state.ducks]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5)
      .map((duck) => `${String(duck.rank).padStart(2, "0")}. ${duck.name.padEnd(10, " ")} ${Math.round(duck.progress * 100)}%`)
      .join("\n");

    const player = state.ducks.find((duck) => duck.playerId === "local-player");
    const playerLine = player ? `\n\nYOU: ${player.rank}/50 · BOOST ${Math.round(player.boostCharge * 100)}%` : "";
    this.standingsText.setText(`${leaders}${playerLine}`);
  }

  private drawTrack(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x174753, 1);
    graphics.fillRoundedRect(42, WORLD_TOP - 34, 1196, WORLD_BOTTOM - WORLD_TOP + 68, 38);

    graphics.lineStyle(3, 0x5d8f75, 0.8);
    for (let lane = 1; lane < 6; lane += 1) {
      const y = WORLD_TOP + ((WORLD_BOTTOM - WORLD_TOP) / 6) * lane;
      graphics.lineBetween(64, y, 1216, y);
    }

    graphics.lineStyle(4, 0xe8efc5, 0.9);
    graphics.lineBetween(WORLD_MARGIN_X + 4, WORLD_TOP - 18, WORLD_MARGIN_X + 4, WORLD_BOTTOM + 18);
    graphics.lineBetween(1208, WORLD_TOP - 18, 1208, WORLD_BOTTOM + 18);

    this.add.text(80, WORLD_TOP - 29, "START", {
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      color: "#e8efc5",
      fontStyle: "bold",
    });

    this.add.text(1161, WORLD_TOP - 29, "FINISH", {
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      color: "#e8efc5",
      fontStyle: "bold",
    });
  }
}
