import Phaser from "phaser";
import { createRaceConfig } from "../config";
import { RaceSimulation } from "../simulation";
import { getTrackDefinition } from "../tracks";
import type { DuckRaceLaunchOptions, RaceModeId } from "../types";

const WORLD_START_X = 140;
const COURSE_WIDTH = 5_200;
const WORLD_END_X = WORLD_START_X + COURSE_WIDTH;
const WORLD_TOP = 132;
const WORLD_BOTTOM = 612;
const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;
const SIM_STEP_MS = 50;
const TRACK = getTrackDefinition("kush-creek");

interface DuckView {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Ellipse;
  head: Phaser.GameObjects.Ellipse;
  bill: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

interface TouchState {
  left: boolean;
  right: boolean;
  boost: boolean;
  dive: boolean;
  usePowerup: boolean;
}

export class RaceScene extends Phaser.Scene {
  private readonly launchOptions: DuckRaceLaunchOptions;
  private simulation!: RaceSimulation;
  private duckViews = new Map<string, DuckView>();
  private accumulator = 0;
  private selectedMode: RaceModeId;
  private inputSequence = 0;
  private statusText!: Phaser.GameObjects.Text;
  private standingsText!: Phaser.GameObjects.Text;
  private helpText!: Phaser.GameObjects.Text;
  private eventText!: Phaser.GameObjects.Text;
  private playerText!: Phaser.GameObjects.Text;
  private controlLayer!: Phaser.GameObjects.Container;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private boostKey?: Phaser.Input.Keyboard.Key;
  private diveKey?: Phaser.Input.Keyboard.Key;
  private powerupKey?: Phaser.Input.Keyboard.Key;
  private touchState: TouchState = {
    left: false,
    right: false,
    boost: false,
    dive: false,
    usePowerup: false,
  };

  constructor(options: DuckRaceLaunchOptions) {
    super("StonerDuckRace");
    this.launchOptions = options;
    this.selectedMode = options.mode;
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#0d242d");
    this.cameras.main.setBounds(0, 0, WORLD_END_X + 260, VIEW_HEIGHT);
    this.drawTrack();
    this.createSimulation(this.selectedMode);
    this.createHud();
    this.createControls();

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.boostKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.diveKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.powerupKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.input.keyboard?.on("keydown-ONE", () => this.resetRace("derby"));
    this.input.keyboard?.on("keydown-TWO", () => this.resetRace("rally"));
    this.input.keyboard?.on("keydown-THREE", () => this.resetRace("chaos"));
    this.input.keyboard?.on("keydown-R", () => this.resetRace(this.selectedMode));
    this.input.on("pointerup", () => this.resetTouchState());
  }

  update(_time: number, delta: number): void {
    this.accumulator += Math.min(delta, 100);

    if (this.selectedMode !== "derby") {
      this.inputSequence += 1;
      const keyboardSteer = (this.cursors?.left?.isDown ? -1 : 0) + (this.cursors?.right?.isDown ? 1 : 0);
      const touchSteer = (this.touchState.left ? -1 : 0) + (this.touchState.right ? 1 : 0);

      this.simulation.setInput("duck-1", {
        steer: Phaser.Math.Clamp(keyboardSteer + touchSteer, -1, 1),
        boost: Boolean(this.boostKey?.isDown) || this.touchState.boost,
        dive: Boolean(this.diveKey?.isDown) || this.touchState.dive,
        usePowerup: Boolean(this.powerupKey?.isDown) || this.touchState.usePowerup,
        sequence: this.inputSequence,
      });
    }

    while (this.accumulator >= SIM_STEP_MS) {
      this.simulation.step();
      this.accumulator -= SIM_STEP_MS;
    }

    this.renderState();
    this.updateCamera();
  }

  private createHud(): void {
    this.statusText = this.add.text(28, 20, "", {
      fontFamily: "Arial, sans-serif",
      fontSize: "25px",
      color: "#f4f7df",
      fontStyle: "bold",
    }).setScrollFactor(0).setDepth(100);

    this.standingsText = this.add.text(28, 58, "", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#d8f5dd",
      lineSpacing: 3,
      backgroundColor: "#07171dbb",
      padding: { x: 9, y: 7 },
    }).setScrollFactor(0).setDepth(100);

    this.helpText = this.add.text(1252, 22, "1 Derby  ·  2 Rally  ·  3 Chaos  ·  R restart", {
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      color: "#b8d7c0",
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    this.eventText = this.add.text(640, 24, "", {
      fontFamily: "Arial, sans-serif",
      fontSize: "15px",
      color: "#ffe28a",
      fontStyle: "bold",
      backgroundColor: "#152b22cc",
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    this.playerText = this.add.text(1250, 60, "", {
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      color: "#f8f4d8",
      align: "right",
      backgroundColor: "#07171dbb",
      padding: { x: 9, y: 7 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    this.add.rectangle(640, 704, 560, 8, 0x07171d, 0.88)
      .setStrokeStyle(1, 0x7ba68b, 0.7)
      .setScrollFactor(0)
      .setDepth(100);
    this.progressFill = this.add.rectangle(362, 704, 0, 6, 0xf0ce58, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);
  }

  private createControls(): void {
    this.controlLayer = this.add.container(0, 0).setScrollFactor(0).setDepth(120);

    this.makeTouchButton(74, 666, "◀", () => { this.touchState.left = true; });
    this.makeTouchButton(144, 666, "▶", () => { this.touchState.right = true; });
    this.makeTouchButton(1042, 666, "DIVE", () => { this.touchState.dive = true; }, 62);
    this.makeTouchButton(1122, 666, "BOOST", () => { this.touchState.boost = true; }, 66);
    this.makeTouchButton(1210, 666, "ITEM", () => { this.touchState.usePowerup = true; }, 66);

    const modes: Array<[RaceModeId, string, number]> = [
      ["derby", "DERBY", 950],
      ["rally", "RALLY", 1045],
      ["chaos", "CHAOS", 1140],
    ];

    for (const [mode, label, x] of modes) {
      const button = this.add.text(x, 93, label, {
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        color: "#e9f1d0",
        backgroundColor: mode === this.selectedMode ? "#396e3f" : "#17333a",
        padding: { x: 10, y: 7 },
      }).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(120);
      button.on("pointerdown", () => this.resetRace(mode));
    }

    this.updateControlVisibility();
  }

  private makeTouchButton(x: number, y: number, label: string, onDown: () => void, width = 58): void {
    const background = this.add.rectangle(0, 0, width, 48, 0x17333a, 0.94)
      .setStrokeStyle(2, 0x8bb889, 0.9)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, label, {
      fontFamily: "Arial, sans-serif",
      fontSize: label.length > 2 ? "12px" : "21px",
      color: "#f4f7df",
      fontStyle: "bold",
    }).setOrigin(0.5);
    const container = this.add.container(x, y, [background, text]);
    this.controlLayer.add(container);

    background.on("pointerdown", onDown);
    background.on("pointerup", () => this.resetTouchState());
    background.on("pointerout", () => this.resetTouchState());
  }

  private resetTouchState(): void {
    this.touchState.left = false;
    this.touchState.right = false;
    this.touchState.boost = false;
    this.touchState.dive = false;
    this.touchState.usePowerup = false;
  }

  private createSimulation(mode: RaceModeId): void {
    const config = createRaceConfig(mode, this.launchOptions.racerCount, this.launchOptions.seed);
    this.simulation = new RaceSimulation(config);

    if (mode !== "derby") {
      this.simulation.claimDuck("duck-1", "local-player", this.launchOptions.playerName);
    }

    this.buildDuckViews();
  }

  private resetRace(mode: RaceModeId): void {
    this.selectedMode = mode;
    this.accumulator = 0;
    this.inputSequence = 0;
    this.resetTouchState();
    this.cameras.main.scrollX = 0;

    for (const view of this.duckViews.values()) view.container.destroy(true);
    this.duckViews.clear();

    this.createSimulation(mode);
    this.updateControlVisibility();
  }

  private updateControlVisibility(): void {
    if (!this.controlLayer) return;
    this.controlLayer.setVisible(this.selectedMode !== "derby");
  }

  private buildDuckViews(): void {
    for (const duck of this.simulation.state.ducks) {
      const container = this.add.container(0, 0);
      const isPlayer = duck.playerId === "local-player";
      const body = this.add.ellipse(0, 0, isPlayer ? 28 : 22, isPlayer ? 21 : 16, isPlayer ? 0xf8d347 : 0xe9c440);
      const head = this.add.ellipse(9, -9, isPlayer ? 15 : 12, isPlayer ? 15 : 12, isPlayer ? 0xffe067 : 0xf4d35e);
      const bill = this.add.rectangle(17, -7, isPlayer ? 11 : 8, 4, 0xf28c28);
      const label = this.add.text(0, 14, duck.rank.toString(), {
        fontFamily: "Arial, sans-serif",
        fontSize: isPlayer ? "10px" : "8px",
        color: "#ffffff",
        backgroundColor: isPlayer ? "#234f2c" : "#00000066",
        padding: { x: 2, y: 1 },
      }).setOrigin(0.5, 0);

      container.add([body, head, bill, label]);
      container.setDepth(isPlayer ? 30 : 20);
      this.duckViews.set(duck.id, { container, body, head, bill, label });
    }
  }

  private renderState(): void {
    const { state } = this.simulation;
    const riverHeight = WORLD_BOTTOM - WORLD_TOP;

    for (const duck of state.ducks) {
      const view = this.duckViews.get(duck.id);
      if (!view) continue;

      const x = WORLD_START_X + duck.progress * COURSE_WIDTH;
      const y = WORLD_TOP + ((duck.lateral + 1) / 2) * riverHeight;
      view.container.setPosition(x, y);
      view.label.setText(duck.playerId === "local-player" ? "YOU" : String(duck.rank));
      view.container.setAlpha(duck.finished ? 0.58 : 1);
      view.container.setScale(duck.playerId === "local-player" && duck.heldPowerup ? 1.12 : 1);
    }

    const countdownRemaining = Math.max(0, state.config.countdownTicks - state.tick);
    const countdownSeconds = Math.ceil(countdownRemaining / state.config.tickRate);
    const winner = state.winnerId ? state.ducks.find((duck) => duck.id === state.winnerId) : null;

    const phaseLabel = state.phase === "countdown"
      ? `KUSH CREEK · STARTING IN ${countdownSeconds}`
      : state.phase === "finished"
        ? `WINNER: ${winner?.name ?? "Duck"}`
        : `${this.selectedMode.toUpperCase()} · ${state.ducks.length} DUCKS · KUSH CREEK`;

    this.statusText.setText(phaseLabel);

    const leaders = [...state.ducks]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5)
      .map((duck) => `${String(duck.rank).padStart(2, "0")}. ${duck.name.padEnd(10, " ")} ${Math.round(duck.progress * 100)}%`)
      .join("\n");
    this.standingsText.setText(leaders);

    const player = state.ducks.find((duck) => duck.playerId === "local-player");
    const focusDuck = player ?? state.ducks.find((duck) => duck.rank === 1) ?? state.ducks[0];
    this.progressFill.width = Math.max(0, 556 * focusDuck.progress);

    if (player) {
      const zone = TRACK.currentZones.find((candidate) => player.progress >= candidate.start && player.progress < candidate.end)
        ?? TRACK.currentZones[TRACK.currentZones.length - 1];
      this.playerText.setText([
        `${player.name} · ${player.rank}/${state.ducks.length}`,
        `${zone.label} · ${Math.round(player.progress * 100)}%`,
        `BOOST ${Math.round(player.boostCharge * 100)}%`,
        `ITEM ${player.heldPowerup ? player.heldPowerup.toUpperCase().replace("-", " ") : "—"}`,
        "← → steer · SPACE boost · ↓ dive · E item",
      ]);
    } else {
      this.playerText.setText(`LEADER CAM · ${focusDuck.name}\n${Math.round(focusDuck.progress * 100)}% · ${state.ducks.length} ducks`);
    }

    const latestEvent = state.events[state.events.length - 1];
    if (!latestEvent || state.tick - latestEvent.tick > state.config.tickRate * 3) {
      this.eventText.setText("");
    } else if (latestEvent.type === "powerup-collected") {
      this.eventText.setText(`PICKUP · ${String(latestEvent.payload?.powerup ?? "POWERUP").toUpperCase()}`);
    } else if (latestEvent.type === "powerup-used") {
      this.eventText.setText(`POWERUP FIRED · ${String(latestEvent.payload?.powerup ?? "").toUpperCase()}`);
    } else if (latestEvent.type === "hazard-hit") {
      this.eventText.setText(`SPLASH · ${String(latestEvent.payload?.hazardType ?? "HAZARD").toUpperCase()}`);
    } else if (["munchie-storm", "hotbox-fog", "mega-whirlpool", "dab-wave", "sticky-river"].includes(latestEvent.type)) {
      this.eventText.setText(`CHAOS EVENT · ${latestEvent.type.toUpperCase().replaceAll("-", " ")}`);
    } else {
      this.eventText.setText("");
    }
  }

  private updateCamera(): void {
    const state = this.simulation.state;
    const player = state.ducks.find((duck) => duck.playerId === "local-player");
    const focusDuck = player ?? state.ducks.find((duck) => duck.rank === 1) ?? state.ducks[0];
    const focusX = WORLD_START_X + focusDuck.progress * COURSE_WIDTH;
    const desiredX = Phaser.Math.Clamp(focusX - (player ? 390 : 520), 0, WORLD_END_X - VIEW_WIDTH + 220);

    if (state.phase === "countdown") {
      this.cameras.main.scrollX += (0 - this.cameras.main.scrollX) * 0.12;
      return;
    }

    const lerp = player ? 0.1 : 0.055;
    this.cameras.main.scrollX += (desiredX - this.cameras.main.scrollX) * lerp;
  }

  private drawTrack(): void {
    const graphics = this.add.graphics();
    const riverHeight = WORLD_BOTTOM - WORLD_TOP;

    graphics.fillStyle(0x08191f, 1);
    graphics.fillRect(0, 0, WORLD_END_X + 260, VIEW_HEIGHT);

    graphics.fillStyle(0x153327, 1);
    graphics.fillRect(WORLD_START_X - 80, WORLD_TOP - 72, COURSE_WIDTH + 160, 60);
    graphics.fillRect(WORLD_START_X - 80, WORLD_BOTTOM + 12, COURSE_WIDTH + 160, 60);

    graphics.fillStyle(0x0b1f26, 1);
    graphics.fillRoundedRect(WORLD_START_X - 42, WORLD_TOP - 34, COURSE_WIDTH + 84, riverHeight + 68, 38);

    TRACK.currentZones.forEach((zone, index) => {
      const x = WORLD_START_X + zone.start * COURSE_WIDTH;
      const width = Math.max(2, (zone.end - zone.start) * COURSE_WIDTH);
      graphics.fillStyle(index % 2 === 0 ? 0x174753 : 0x1d5660, 0.94);
      graphics.fillRect(x, WORLD_TOP, width, riverHeight);

      this.add.text(x + 20, WORLD_TOP + 18, zone.label.toUpperCase(), {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#b9ddca",
        fontStyle: "bold",
      }).setAlpha(0.62).setDepth(2);
    });

    graphics.lineStyle(2, 0x5d8f75, 0.34);
    for (let lane = 1; lane < 6; lane += 1) {
      const y = WORLD_TOP + (riverHeight / 6) * lane;
      graphics.lineBetween(WORLD_START_X, y, WORLD_END_X, y);
    }

    for (let marker = 0; marker <= 10; marker += 1) {
      const x = WORLD_START_X + (marker / 10) * COURSE_WIDTH;
      graphics.lineStyle(2, 0xe8efc5, marker === 0 || marker === 10 ? 0.9 : 0.22);
      graphics.lineBetween(x, WORLD_TOP - 12, x, WORLD_BOTTOM + 12);
      this.add.text(x + 6, WORLD_BOTTOM + 20, `${marker * 10}%`, {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#9eb8a4",
      }).setDepth(3);
    }

    for (const hazard of TRACK.hazards) {
      const x = WORLD_START_X + hazard.progress * COURSE_WIDTH;
      const y = WORLD_TOP + ((hazard.lateral + 1) / 2) * riverHeight;

      if (hazard.type === "log") {
        this.add.rectangle(x, y, 74, 18, 0x75442b).setRotation(0.25).setDepth(6);
        this.add.text(x, y - 28, "LOG", { fontFamily: "Arial", fontSize: "11px", color: "#f1dcc5" }).setOrigin(0.5).setDepth(7);
      } else if (hazard.type === "mud") {
        this.add.ellipse(x, y, 160, 94, 0x62513c, 0.78).setDepth(4);
        this.add.text(x, y, "MUD", { fontFamily: "Arial", fontSize: "12px", color: "#eadfc6" }).setOrigin(0.5).setDepth(7);
      } else {
        this.add.circle(x, y, 55, 0x0a303b, 0.84).setStrokeStyle(8, 0x6ca2a0, 0.75).setDepth(5);
        this.add.circle(x, y, 22, 0x071e27, 1).setDepth(6);
        this.add.text(x, y - 72, "WHIRLPOOL", { fontFamily: "Arial", fontSize: "11px", color: "#cae7df" }).setOrigin(0.5).setDepth(7);
      }
    }

    for (const pickup of TRACK.pickups) {
      const x = WORLD_START_X + pickup.progress * COURSE_WIDTH;
      const y = WORLD_TOP + ((pickup.lateral + 1) / 2) * riverHeight;
      const letter = pickup.powerup === "munchie-rush" ? "M" : "D";
      this.add.circle(x, y, 17, pickup.powerup === "munchie-rush" ? 0xf2c14e : 0xa978e3, 0.96)
        .setStrokeStyle(3, 0xffffff, 0.82)
        .setDepth(8);
      this.add.text(x, y, letter, { fontFamily: "Arial", fontSize: "13px", color: "#102027", fontStyle: "bold" })
        .setOrigin(0.5)
        .setDepth(9);
    }

    this.add.text(WORLD_START_X + 12, WORLD_TOP - 58, "STARTING POOL", {
      fontFamily: "Arial, sans-serif",
      fontSize: "15px",
      color: "#e8efc5",
      fontStyle: "bold",
    }).setDepth(7);

    this.add.text(WORLD_END_X - 80, WORLD_TOP - 58, "FINISH", {
      fontFamily: "Arial, sans-serif",
      fontSize: "15px",
      color: "#e8efc5",
      fontStyle: "bold",
    }).setDepth(7);
  }
}
