import Phaser from "phaser";
import {
  AUDIO_ASSETS,
  DUCK_SPRITE_ASSETS,
  HAZARD_ASSETS,
  POWERUP_ASSETS,
  TRACK_ART_ASSETS,
  getDuckSpriteAsset,
  hasAuthoredAsset,
} from "../assets";
import { getDuckCharacter } from "../characters";
import { createRaceConfig } from "../config";
import type { DuckRaceRoomConnection, DuckRaceRoomSnapshot, NetworkDuckSnapshot } from "../network";
import { RaceSimulation } from "../simulation";
import { getTrackDefinition, type HazardType, type PowerupId } from "../tracks";
import type { DuckRaceLaunchOptions, DuckRaceResult, DuckState, RaceModeId, RacePhase } from "../types";

const WORLD_START_X = 140;
const WORLD_TOP = 132;
const WORLD_BOTTOM = 612;
const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;
const SIM_STEP_MS = 50;

interface DuckView {
  container: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text;
  shield: Phaser.GameObjects.Arc;
  sprite?: Phaser.GameObjects.Sprite;
}

interface TouchState {
  left: boolean;
  right: boolean;
  boost: boolean;
  dive: boolean;
  usePowerup: boolean;
}

interface RenderDuck {
  id: string;
  name: string;
  characterId: string;
  isPlayer: boolean;
  progress: number;
  lateral: number;
  rank: number;
  boostCharge: number;
  heldPowerup: string | null;
  shieldCharges: number;
  finished: boolean;
}

interface RenderRaceState {
  phase: RacePhase;
  tick: number;
  tickRate: number;
  countdownTicks: number;
  winnerId: string | null;
  ducks: RenderDuck[];
  connectedRacers: number;
  spectatorCount: number;
}

export class RaceScene extends Phaser.Scene {
  private readonly launchOptions: DuckRaceLaunchOptions;
  private readonly networkConnection?: DuckRaceRoomConnection;
  private readonly onRaceFinished?: (result: DuckRaceResult) => void;
  private simulation?: RaceSimulation;
  private networkSnapshot?: DuckRaceRoomSnapshot;
  private unsubscribeNetwork?: () => void;
  private duckViews = new Map<string, DuckView>();
  private ambientSounds: Phaser.Sound.BaseSound[] = [];
  private accumulator = 0;
  private selectedMode: RaceModeId;
  private inputSequence = 0;
  private resultReported = false;
  private statusText!: Phaser.GameObjects.Text;
  private standingsText!: Phaser.GameObjects.Text;
  private helpText!: Phaser.GameObjects.Text;
  private eventText!: Phaser.GameObjects.Text;
  private playerText!: Phaser.GameObjects.Text;
  private controlLayer!: Phaser.GameObjects.Container;
  private modeLayer!: Phaser.GameObjects.Container;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private boostKey?: Phaser.Input.Keyboard.Key;
  private diveKey?: Phaser.Input.Keyboard.Key;
  private powerupKey?: Phaser.Input.Keyboard.Key;
  private touchState: TouchState = { left: false, right: false, boost: false, dive: false, usePowerup: false };

  constructor(
    options: DuckRaceLaunchOptions,
    networkConnection?: DuckRaceRoomConnection,
    onRaceFinished?: (result: DuckRaceResult) => void,
  ) {
    super("StonerDuckRace");
    this.launchOptions = options;
    this.networkConnection = networkConnection;
    this.onRaceFinished = onRaceFinished;
    this.selectedMode = options.mode;
  }

  preload(): void {
    for (const asset of DUCK_SPRITE_ASSETS) {
      if (!hasAuthoredAsset(asset.sheetPath)) continue;
      this.load.spritesheet(asset.textureKey, asset.sheetPath, {
        frameWidth: asset.frameWidth,
        frameHeight: asset.frameHeight,
      });
    }

    for (const asset of Object.values(POWERUP_ASSETS)) {
      if (hasAuthoredAsset(asset.path)) this.load.image(asset.textureKey, asset.path);
    }
    for (const asset of Object.values(HAZARD_ASSETS)) {
      if (hasAuthoredAsset(asset.path)) this.load.image(asset.textureKey, asset.path);
    }

    const trackArt = TRACK_ART_ASSETS[this.launchOptions.trackId];
    if (hasAuthoredAsset(trackArt.backgroundPath)) this.load.image(trackArt.backgroundKey, trackArt.backgroundPath);
    if (hasAuthoredAsset(trackArt.foregroundPath)) this.load.image(trackArt.foregroundKey, trackArt.foregroundPath);
    if (hasAuthoredAsset(trackArt.previewPath)) this.load.image(trackArt.previewKey, trackArt.previewPath);

    for (const audio of AUDIO_ASSETS) {
      if (hasAuthoredAsset(audio.path)) this.load.audio(audio.key, audio.path);
    }
  }

  create(): void {
    const track = this.track;
    this.registerAuthoredDuckAnimations();
    this.startAuthoredAudio();
    this.cameras.main.setBackgroundColor("#0d242d");
    this.cameras.main.setBounds(0, 0, this.worldEndX + 260, VIEW_HEIGHT);
    this.drawTrack();

    if (this.networkConnection) {
      this.networkSnapshot = this.networkConnection.getSnapshot();
      this.unsubscribeNetwork = this.networkConnection.subscribe((snapshot) => {
        this.networkSnapshot = snapshot;
        this.selectedMode = snapshot.mode;
        this.ensureDuckViews();
      });
    } else {
      this.createSimulation(this.selectedMode);
    }

    this.createHud();
    this.createControls();
    this.ensureDuckViews();
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.boostKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.diveKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.powerupKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    if (!this.networkConnection) {
      this.input.keyboard?.on("keydown-ONE", () => this.resetRace("derby"));
      this.input.keyboard?.on("keydown-TWO", () => this.resetRace("rally"));
      this.input.keyboard?.on("keydown-THREE", () => this.resetRace("chaos"));
      this.input.keyboard?.on("keydown-R", () => this.resetRace(this.selectedMode));
    }

    this.input.on("pointerup", () => this.resetTouchState());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribeNetwork?.();
      for (const sound of this.ambientSounds) {
        sound.stop();
        sound.destroy();
      }
      this.ambientSounds = [];
    });
    this.eventText.setText(`${track.name.toUpperCase()} · ${track.tagline}`);
  }

  update(_time: number, delta: number): void {
    this.accumulator += Math.min(delta, 100);
    while (this.accumulator >= SIM_STEP_MS) {
      this.accumulator -= SIM_STEP_MS;
      const input = this.readPlayerInput();
      if (this.networkConnection) {
        if (this.selectedMode !== "derby" && this.networkConnection.getOwnedDuck()) this.networkConnection.sendInput(input);
      } else if (this.simulation) {
        if (this.selectedMode !== "derby") this.simulation.setInput("duck-1", input);
        this.simulation.step();
      }
    }
    this.renderState();
    this.updateCamera();
  }

  private get track() { return getTrackDefinition(this.networkSnapshot?.trackId ?? this.launchOptions.trackId); }
  private get courseWidth(): number { return this.track.length; }
  private get worldEndX(): number { return WORLD_START_X + this.courseWidth; }

  private registerAuthoredDuckAnimations(): void {
    for (const asset of DUCK_SPRITE_ASSETS) {
      if (!this.textures.exists(asset.textureKey)) continue;
      for (const [animationId, animation] of Object.entries(asset.animations)) {
        const key = `${asset.textureKey}:${animationId}`;
        if (this.anims.exists(key)) continue;
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(asset.textureKey, { start: animation.start, end: animation.end }),
          frameRate: animation.frameRate,
          repeat: animation.repeat,
        });
      }
    }
  }

  private startAuthoredAudio(): void {
    for (const asset of AUDIO_ASSETS) {
      if (!asset.loop || !this.cache.audio.exists(asset.key)) continue;
      const sound = this.sound.add(asset.key, { loop: true, volume: asset.volume });
      sound.play();
      this.ambientSounds.push(sound);
    }
  }

  private readPlayerInput() {
    this.inputSequence += 1;
    const keyboardSteer = (this.cursors?.left?.isDown ? -1 : 0) + (this.cursors?.right?.isDown ? 1 : 0);
    const touchSteer = (this.touchState.left ? -1 : 0) + (this.touchState.right ? 1 : 0);
    return {
      steer: Phaser.Math.Clamp(keyboardSteer + touchSteer, -1, 1),
      boost: Boolean(this.boostKey?.isDown) || this.touchState.boost,
      dive: Boolean(this.diveKey?.isDown) || this.touchState.dive,
      usePowerup: Boolean(this.powerupKey?.isDown) || this.touchState.usePowerup,
      sequence: this.inputSequence,
    };
  }

  private createHud(): void {
    this.statusText = this.add.text(28, 20, "", { fontFamily: "Arial, sans-serif", fontSize: "25px", color: "#f4f7df", fontStyle: "bold" }).setScrollFactor(0).setDepth(100);
    this.standingsText = this.add.text(28, 58, "", { fontFamily: "monospace", fontSize: "14px", color: "#d8f5dd", lineSpacing: 3, backgroundColor: "#07171dbb", padding: { x: 9, y: 7 } }).setScrollFactor(0).setDepth(100);
    this.helpText = this.add.text(1252, 22, this.networkConnection ? "ONLINE · server-authoritative" : "1 Derby · 2 Rally · 3 Chaos · R restart", { fontFamily: "Arial, sans-serif", fontSize: "14px", color: "#b8d7c0" }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    this.eventText = this.add.text(640, 24, "", { fontFamily: "Arial, sans-serif", fontSize: "15px", color: "#ffe28a", fontStyle: "bold", backgroundColor: "#152b22cc", padding: { x: 10, y: 6 } }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
    this.playerText = this.add.text(1250, 60, "", { fontFamily: "Arial, sans-serif", fontSize: "14px", color: "#f8f4d8", align: "right", backgroundColor: "#07171dbb", padding: { x: 9, y: 7 } }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    this.add.rectangle(640, 704, 560, 8, 0x07171d, 0.88).setStrokeStyle(1, 0x7ba68b, 0.7).setScrollFactor(0).setDepth(100);
    this.progressFill = this.add.rectangle(362, 704, 0, 6, 0xf0ce58, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
  }

  private createControls(): void {
    this.controlLayer = this.add.container(0, 0).setScrollFactor(0).setDepth(120);
    this.modeLayer = this.add.container(0, 0).setScrollFactor(0).setDepth(120);
    this.makeTouchButton(74, 666, "◀", () => { this.touchState.left = true; });
    this.makeTouchButton(144, 666, "▶", () => { this.touchState.right = true; });
    this.makeTouchButton(1042, 666, "DIVE", () => { this.touchState.dive = true; }, 62);
    this.makeTouchButton(1122, 666, "BOOST", () => { this.touchState.boost = true; }, 66);
    this.makeTouchButton(1210, 666, "ITEM", () => { this.touchState.usePowerup = true; }, 66);

    if (!this.networkConnection) {
      const modes: Array<[RaceModeId, string, number]> = [["derby", "DERBY", 950], ["rally", "RALLY", 1045], ["chaos", "CHAOS", 1140]];
      for (const [mode, label, x] of modes) {
        const button = this.add.text(x, 93, label, { fontFamily: "Arial, sans-serif", fontSize: "13px", color: "#e9f1d0", backgroundColor: mode === this.selectedMode ? "#396e3f" : "#17333a", padding: { x: 10, y: 7 } }).setInteractive({ useHandCursor: true });
        button.on("pointerdown", () => this.resetRace(mode));
        this.modeLayer.add(button);
      }
    }
    this.updateControlVisibility();
  }

  private makeTouchButton(x: number, y: number, label: string, onDown: () => void, width = 58): void {
    const background = this.add.rectangle(0, 0, width, 48, 0x17333a, 0.94).setStrokeStyle(2, 0x8bb889, 0.9).setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, label, { fontFamily: "Arial, sans-serif", fontSize: label.length > 2 ? "12px" : "21px", color: "#f4f7df", fontStyle: "bold" }).setOrigin(0.5);
    const container = this.add.container(x, y, [background, text]);
    this.controlLayer.add(container);
    background.on("pointerdown", onDown);
    background.on("pointerup", () => this.resetTouchState());
    background.on("pointerout", () => this.resetTouchState());
  }

  private resetTouchState(): void { this.touchState = { left: false, right: false, boost: false, dive: false, usePowerup: false }; }

  private createSimulation(mode: RaceModeId): void {
    const config = createRaceConfig(mode, this.launchOptions.racerCount, this.launchOptions.seed, this.launchOptions.trackId);
    this.simulation = new RaceSimulation(config);
    if (mode !== "derby") {
      this.simulation.claimDuck("duck-1", "local-player", this.launchOptions.playerName);
      const player = this.simulation.state.ducks.find((duck) => duck.id === "duck-1");
      if (player) player.characterId = this.launchOptions.characterId;
    }
    this.ensureDuckViews();
  }

  private resetRace(mode: RaceModeId): void {
    if (this.networkConnection) return;
    this.selectedMode = mode;
    this.accumulator = 0;
    this.inputSequence = 0;
    this.resultReported = false;
    this.resetTouchState();
    this.cameras.main.scrollX = 0;
    for (const view of this.duckViews.values()) view.container.destroy(true);
    this.duckViews.clear();
    this.createSimulation(mode);
    this.updateControlVisibility();
  }

  private updateControlVisibility(): void { this.controlLayer?.setVisible(this.selectedMode !== "derby"); }

  private getRenderState(): RenderRaceState {
    if (this.networkConnection && this.networkSnapshot) {
      const snapshot = this.networkSnapshot;
      const ducks = snapshot.ducks.map((duck: NetworkDuckSnapshot): RenderDuck => ({
        id: duck.id, name: duck.name, characterId: duck.characterId,
        isPlayer: duck.ownerSessionId === this.networkConnection!.sessionId,
        progress: duck.progress, lateral: duck.lateral, rank: duck.rank,
        boostCharge: duck.boostCharge, heldPowerup: duck.heldPowerup,
        shieldCharges: duck.shieldCharges, finished: duck.finished,
      }));
      return {
        phase: (snapshot.phase === "countdown" || snapshot.phase === "racing" || snapshot.phase === "finished") ? snapshot.phase : "lobby",
        tick: snapshot.tick, tickRate: snapshot.tickRate, countdownTicks: snapshot.countdownTicks,
        winnerId: snapshot.winnerId, ducks, connectedRacers: snapshot.connectedRacers, spectatorCount: snapshot.spectatorCount,
      };
    }

    const state = this.simulation!.state;
    return {
      phase: state.phase, tick: state.tick, tickRate: state.config.tickRate, countdownTicks: state.config.countdownTicks, winnerId: state.winnerId,
      ducks: state.ducks.map((duck: DuckState): RenderDuck => ({
        id: duck.id, name: duck.name, characterId: duck.characterId, isPlayer: duck.playerId === "local-player",
        progress: duck.progress, lateral: duck.lateral, rank: duck.rank, boostCharge: duck.boostCharge,
        heldPowerup: duck.heldPowerup, shieldCharges: duck.shieldCharges, finished: duck.finished,
      })),
      connectedRacers: state.ducks.filter((duck) => duck.playerId).length, spectatorCount: 0,
    };
  }

  private ensureDuckViews(): void {
    const state = this.networkConnection && this.networkSnapshot ? this.getRenderState() : this.simulation ? this.getRenderState() : null;
    if (!state) return;
    for (const duck of state.ducks) {
      if (this.duckViews.has(duck.id)) continue;
      const character = getDuckCharacter(duck.characterId);
      const authored = getDuckSpriteAsset(duck.characterId);
      const container = this.add.container(0, 0);
      const size = duck.isPlayer ? 1.18 : 1;
      const shield = this.add.circle(0, -1, 25 * size, 0x63c7da, 0.08).setStrokeStyle(2, 0x9de7f0, 0.9).setVisible(false);
      let sprite: Phaser.GameObjects.Sprite | undefined;
      const visualObjects: Phaser.GameObjects.GameObject[] = [shield];

      if (this.textures.exists(authored.textureKey)) {
        sprite = this.add.sprite(0, -2, authored.textureKey, 0).setDisplaySize(48 * size, 48 * size);
        const paddleKey = `${authored.textureKey}:paddle`;
        if (this.anims.exists(paddleKey)) sprite.play(paddleKey);
        visualObjects.push(sprite);
      } else {
        const body = this.add.ellipse(0, 0, 24 * size, 18 * size, character.bodyColor);
        const wing = this.add.ellipse(-6 * size, 1 * size, 11 * size, 7 * size, character.accentColor, 0.75).setRotation(-0.25);
        const head = this.add.ellipse(9 * size, -9 * size, 14 * size, 14 * size, character.headColor);
        const bill = this.add.rectangle(18 * size, -7 * size, 10 * size, 4 * size, character.billColor);
        const eye = this.add.circle(11 * size, -11 * size, 1.6 * size, 0x142126);
        visualObjects.push(body, wing, head, bill, eye);
      }

      const label = this.add.text(0, 20 * size, String(duck.rank), { fontFamily: "Arial, sans-serif", fontSize: duck.isPlayer ? "10px" : "8px", color: "#ffffff", backgroundColor: duck.isPlayer ? "#234f2c" : "#00000066", padding: { x: 2, y: 1 } }).setOrigin(0.5, 0);
      visualObjects.push(label);
      container.add(visualObjects);
      container.setDepth(duck.isPlayer ? 30 : 20);
      this.duckViews.set(duck.id, { container, label, shield, sprite });
    }
  }

  private renderState(): void {
    const state = this.getRenderState();
    this.ensureDuckViews();
    const riverHeight = WORLD_BOTTOM - WORLD_TOP;
    for (const duck of state.ducks) {
      const view = this.duckViews.get(duck.id);
      if (!view) continue;
      const x = WORLD_START_X + duck.progress * this.courseWidth;
      const y = WORLD_TOP + ((duck.lateral + 1) / 2) * riverHeight;
      view.container.setPosition(x, y);
      view.label.setText(duck.isPlayer ? "YOU" : String(duck.rank));
      view.container.setAlpha(duck.finished ? 0.58 : 1);
      view.container.setScale(duck.isPlayer && duck.heldPowerup ? 1.08 : 1);
      view.shield.setVisible(duck.shieldCharges > 0);

      if (view.sprite) {
        const authored = getDuckSpriteAsset(duck.characterId);
        const animationId = duck.finished ? "win" : duck.heldPowerup ? "boost" : "paddle";
        const animationKey = `${authored.textureKey}:${animationId}`;
        if (this.anims.exists(animationKey)) view.sprite.play(animationKey, true);
      }
    }

    const countdownRemaining = Math.max(0, state.countdownTicks - state.tick);
    const countdownSeconds = Math.ceil(countdownRemaining / state.tickRate);
    const winner = state.winnerId ? state.ducks.find((duck) => duck.id === state.winnerId) : null;
    const onlineSuffix = this.networkConnection ? ` · ${state.connectedRacers} LIVE + ${state.spectatorCount} WATCHING` : "";
    const phaseLabel = state.phase === "lobby"
      ? `${this.track.name.toUpperCase()} · ONLINE LOBBY${onlineSuffix}`
      : state.phase === "countdown"
        ? `${this.track.name.toUpperCase()} · STARTING IN ${countdownSeconds}`
        : state.phase === "finished"
          ? `WINNER: ${winner?.name ?? "Duck"}`
          : `${this.selectedMode.toUpperCase()} · ${state.ducks.length} DUCKS · ${this.track.name.toUpperCase()}${onlineSuffix}`;
    this.statusText.setText(phaseLabel);

    const leaders = [...state.ducks].sort((a, b) => a.rank - b.rank).slice(0, 5)
      .map((duck) => `${String(duck.rank).padStart(2, "0")}. ${duck.name.slice(0, 12).padEnd(12, " ")} ${Math.round(duck.progress * 100)}%`).join("\n");
    this.standingsText.setText(leaders);

    const player = state.ducks.find((duck) => duck.isPlayer);
    const focusDuck = player ?? state.ducks.find((duck) => duck.rank === 1) ?? state.ducks[0];
    if (!focusDuck) return;
    this.progressFill.width = Math.max(0, 556 * focusDuck.progress);

    if (player) {
      const zone = this.track.currentZones.find((candidate) => player.progress >= candidate.start && player.progress < candidate.end) ?? this.track.currentZones[this.track.currentZones.length - 1];
      this.playerText.setText([
        `${player.name} · ${player.rank}/${state.ducks.length}`,
        `${zone.label} · ${Math.round(player.progress * 100)}%`,
        `BOOST ${Math.round(player.boostCharge * 100)}%`,
        `ITEM ${player.heldPowerup ? player.heldPowerup.toUpperCase().replaceAll("-", " ") : "—"}`,
        `SHIELD ${player.shieldCharges}`,
        "← → steer · SPACE boost · ↓ dive · E item",
      ]);
    } else {
      this.playerText.setText(`LEADER CAM · ${focusDuck.name}\n${Math.round(focusDuck.progress * 100)}% · ${state.ducks.length} ducks`);
    }

    if (!this.networkConnection && this.simulation) {
      const latestEvent = this.simulation.state.events[this.simulation.state.events.length - 1];
      this.eventText.setText(!latestEvent || this.simulation.state.tick - latestEvent.tick > this.simulation.state.config.tickRate * 3 ? "" : latestEvent.type.toUpperCase().replaceAll("-", " "));
    } else if (state.phase === "lobby") {
      this.eventText.setText(this.networkConnection?.isHost() ? "HOST · START THE RACE FROM THE LOBBY" : "WAITING FOR HOST");
    } else {
      this.eventText.setText("");
    }

    this.maybeReportResult(state);
  }

  private maybeReportResult(state: RenderRaceState): void {
    if (state.phase !== "finished" || this.resultReported) return;
    this.resultReported = true;
    const winner = state.winnerId ? state.ducks.find((duck) => duck.id === state.winnerId) : state.ducks.find((duck) => duck.rank === 1);
    const player = state.ducks.find((duck) => duck.isPlayer);
    this.onRaceFinished?.({
      mode: this.selectedMode,
      trackId: this.track.id,
      racerCount: state.ducks.length,
      rank: player?.rank ?? null,
      winnerName: winner?.name ?? "Duck",
      playerName: player?.name ?? null,
      tick: state.tick,
    });
  }

  private updateCamera(): void {
    const state = this.getRenderState();
    const player = state.ducks.find((duck) => duck.isPlayer);
    const focusDuck = player ?? state.ducks.find((duck) => duck.rank === 1) ?? state.ducks[0];
    if (!focusDuck) return;
    const focusX = WORLD_START_X + focusDuck.progress * this.courseWidth;
    const desiredX = Phaser.Math.Clamp(focusX - (player ? 390 : 520), 0, Math.max(0, this.worldEndX - VIEW_WIDTH + 220));
    if (state.phase === "countdown" || state.phase === "lobby") {
      this.cameras.main.scrollX += (0 - this.cameras.main.scrollX) * 0.12;
      return;
    }
    this.cameras.main.scrollX += (desiredX - this.cameras.main.scrollX) * (player ? 0.1 : 0.055);
  }

  private drawTrack(): void {
    const track = this.track;
    const graphics = this.add.graphics();
    const riverHeight = WORLD_BOTTOM - WORLD_TOP;
    graphics.fillStyle(0x08191f, 1);
    graphics.fillRect(0, 0, this.worldEndX + 260, VIEW_HEIGHT);
    graphics.fillStyle(track.bankColor, 1);
    graphics.fillRect(WORLD_START_X - 80, WORLD_TOP - 72, this.courseWidth + 160, 60);
    graphics.fillRect(WORLD_START_X - 80, WORLD_BOTTOM + 12, this.courseWidth + 160, 60);
    graphics.fillStyle(0x0b1f26, 1);
    graphics.fillRoundedRect(WORLD_START_X - 42, WORLD_TOP - 34, this.courseWidth + 84, riverHeight + 68, 38);

    track.currentZones.forEach((zone, index) => {
      const x = WORLD_START_X + zone.start * this.courseWidth;
      const width = Math.max(2, (zone.end - zone.start) * this.courseWidth);
      graphics.fillStyle(index % 2 === 0 ? track.waterColor : Phaser.Display.Color.IntegerToColor(track.waterColor).brighten(8).color, 0.95);
      graphics.fillRect(x, WORLD_TOP, width, riverHeight);
      this.add.text(x + 20, WORLD_TOP + 18, zone.label.toUpperCase(), { fontFamily: "Arial, sans-serif", fontSize: "18px", color: "#d7eee2", fontStyle: "bold" }).setAlpha(0.62).setDepth(2);
    });

    const trackArt = TRACK_ART_ASSETS[track.id];
    if (this.textures.exists(trackArt.backgroundKey)) {
      this.add.tileSprite(WORLD_START_X, WORLD_TOP, this.courseWidth, riverHeight, trackArt.backgroundKey)
        .setOrigin(0, 0)
        .setDepth(1);
    }

    graphics.lineStyle(2, 0x9ccbb0, 0.22);
    for (let lane = 1; lane < 6; lane += 1) graphics.lineBetween(WORLD_START_X, WORLD_TOP + (riverHeight / 6) * lane, this.worldEndX, WORLD_TOP + (riverHeight / 6) * lane);
    for (let marker = 0; marker <= 10; marker += 1) {
      const x = WORLD_START_X + (marker / 10) * this.courseWidth;
      graphics.lineStyle(2, 0xe8efc5, marker === 0 || marker === 10 ? 0.9 : 0.18);
      graphics.lineBetween(x, WORLD_TOP - 12, x, WORLD_BOTTOM + 12);
      this.add.text(x + 6, WORLD_BOTTOM + 20, `${marker * 10}%`, { fontFamily: "monospace", fontSize: "11px", color: "#9eb8a4" }).setDepth(3);
    }

    for (const obstacle of track.hazards) this.drawHazard(obstacle.type, obstacle.progress, obstacle.lateral);
    for (const pickup of track.pickups) {
      const x = WORLD_START_X + pickup.progress * this.courseWidth;
      const y = WORLD_TOP + ((pickup.lateral + 1) / 2) * riverHeight;
      const asset = POWERUP_ASSETS[pickup.powerup];
      if (this.textures.exists(asset.textureKey)) {
        this.add.image(x, y, asset.textureKey).setDisplaySize(42, 42).setDepth(8);
      } else {
        this.add.circle(x, y, 18, asset.fallbackColor, 0.96).setStrokeStyle(3, 0xffffff, 0.82).setDepth(8);
        this.add.text(x, y, asset.fallbackLabel.slice(0, 2), { fontFamily: "Arial", fontSize: "10px", color: "#102027", fontStyle: "bold" }).setOrigin(0.5).setDepth(9);
      }
      this.add.text(x, y - 30, asset.fallbackLabel, { fontFamily: "Arial", fontSize: "9px", color: "#edf6e8" }).setOrigin(0.5).setDepth(9);
    }

    if (this.textures.exists(trackArt.foregroundKey)) {
      this.add.tileSprite(WORLD_START_X, WORLD_TOP, this.courseWidth, riverHeight, trackArt.foregroundKey)
        .setOrigin(0, 0)
        .setDepth(12);
    }

    this.add.text(WORLD_START_X + 12, WORLD_TOP - 58, `${track.name.toUpperCase()} · START`, { fontFamily: "Arial, sans-serif", fontSize: "15px", color: "#e8efc5", fontStyle: "bold" }).setDepth(7);
    this.add.text(this.worldEndX - 80, WORLD_TOP - 58, "FINISH", { fontFamily: "Arial, sans-serif", fontSize: "15px", color: "#e8efc5", fontStyle: "bold" }).setDepth(7);
  }

  private drawHazard(type: HazardType, progress: number, lateral: number): void {
    const riverHeight = WORLD_BOTTOM - WORLD_TOP;
    const x = WORLD_START_X + progress * this.courseWidth;
    const y = WORLD_TOP + ((lateral + 1) / 2) * riverHeight;
    const asset = HAZARD_ASSETS[type];

    if (this.textures.exists(asset.textureKey)) {
      this.add.image(x, y, asset.textureKey).setDisplaySize(type === "waterfall" ? 70 : 72, type === "waterfall" ? 190 : 72).setDepth(6);
    } else if (type === "log" || type === "barrel") {
      this.add.rectangle(x, y, type === "log" ? 74 : 42, 18, asset.fallbackColor).setRotation(type === "log" ? 0.25 : -0.18).setDepth(6);
    } else if (type === "mud" || type === "reeds") {
      this.add.ellipse(x, y, type === "mud" ? 160 : 110, type === "mud" ? 94 : 70, asset.fallbackColor, 0.8).setDepth(4);
      if (type === "reeds") for (let reed = -2; reed <= 2; reed += 1) this.add.rectangle(x + reed * 13, y - 5, 4, 54, 0x6f8b4a).setRotation(reed * 0.04).setDepth(6);
    } else if (type === "whirlpool") {
      this.add.circle(x, y, 55, asset.fallbackColor, 0.84).setStrokeStyle(8, 0x6ca2a0, 0.75).setDepth(5);
      this.add.circle(x, y, 22, 0x071e27, 1).setDepth(6);
    } else if (type === "waterfall") {
      this.add.rectangle(x, y, 52, 190, asset.fallbackColor, 0.24).setStrokeStyle(3, 0xd9f5f7, 0.55).setDepth(5);
    } else {
      this.add.circle(x, y, 32, asset.fallbackColor, 0.38).setStrokeStyle(3, asset.fallbackColor, 0.82).setDepth(5);
      this.add.text(x, y, asset.fallbackLabel, { fontFamily: "Arial", fontSize: "10px", color: "#eef8f6", fontStyle: "bold" }).setOrigin(0.5).setDepth(7);
    }
    this.add.text(x, y - 38, asset.fallbackLabel, { fontFamily: "Arial", fontSize: "9px", color: "#f1dcc5" }).setOrigin(0.5).setDepth(7);
  }
}
