"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import type { Game } from "phaser";
import { startStonerDuckRace } from "@/game/stoner-duck-race/main";
import type { DuckRaceLaunchOptions, RaceModeId } from "@/game/stoner-duck-race/types";
import styles from "./StonerDuckRaceGame.module.css";

const GAME_PARENT_ID = "stoner-duck-race-game";

const MODE_OPTIONS: ReadonlyArray<{
  id: RaceModeId;
  title: string;
  eyebrow: string;
  description: string;
}> = [
  {
    id: "derby",
    title: "Duck Derby",
    eyebrow: "Spectator race",
    description: "Seed the river and watch up to 50 AI ducks fight through currents, hazards, and pickups.",
  },
  {
    id: "rally",
    title: "River Rally",
    eyebrow: "Skill race",
    description: "Control your duck, read the water, dodge hazards, grab items, and race the field yourself.",
  },
  {
    id: "chaos",
    title: "Chaos Derby",
    eyebrow: "Party mayhem",
    description: "Rally controls plus global chaos events, stronger comeback pressure, and less predictable races.",
  },
];

export function StonerDuckRaceGame() {
  const gameRef = useRef<Game | null>(null);
  const [mode, setMode] = useState<RaceModeId>("rally");
  const [racerCount, setRacerCount] = useState(24);
  const [playerName, setPlayerName] = useState("YOU");
  const [seed, setSeed] = useState("DTF-420");
  const [launchOptions, setLaunchOptions] = useState<DuckRaceLaunchOptions | null>(null);

  useLayoutEffect(() => {
    if (!launchOptions || gameRef.current) return;

    gameRef.current = startStonerDuckRace(GAME_PARENT_ID, launchOptions);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [launchOptions]);

  function launchRace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLaunchOptions({
      mode,
      racerCount: Math.max(1, Math.min(50, Math.floor(racerCount))),
      seed: seed.trim().slice(0, 64) || "DTF-420",
      playerName: playerName.trim().slice(0, 24) || "YOU",
    });
  }

  function returnToLobby() {
    gameRef.current?.destroy(true);
    gameRef.current = null;
    setLaunchOptions(null);
  }

  if (!launchOptions) {
    return (
      <div className={`${styles.shell} ${styles.lobbyShell}`}>
        <form className={styles.lobby} onSubmit={launchRace}>
          <header className={styles.lobbyHeader}>
            <div>
              <span className={styles.kicker}>Kush Creek · Local race setup</span>
              <h2>Choose how the ducks hit the river.</h2>
              <p>Every setup uses the same deterministic 50-racer engine. Change the seed to replay or share the same race conditions.</p>
            </div>
            <div className={styles.capacityBadge}>
              <strong>50</strong>
              <span>max racers</span>
            </div>
          </header>

          <fieldset className={styles.modeFieldset}>
            <legend>Race mode</legend>
            <div className={styles.modeGrid}>
              {MODE_OPTIONS.map((option) => (
                <button
                  aria-pressed={mode === option.id}
                  className={styles.modeButton}
                  data-active={mode === option.id}
                  key={option.id}
                  onClick={() => setMode(option.id)}
                  type="button"
                >
                  <span>{option.eyebrow}</span>
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <div className={styles.fieldGrid}>
            <label className={`${styles.field} ${styles.racerField}`}>
              <span>Racers</span>
              <div className={styles.rangeRow}>
                <input
                  aria-label="Number of racers"
                  max={50}
                  min={1}
                  onChange={(event) => setRacerCount(Number(event.target.value))}
                  type="range"
                  value={racerCount}
                />
                <output>{racerCount}</output>
              </div>
              <small>From a quick solo test to the full 50-duck stampede.</small>
            </label>

            <label className={styles.field}>
              <span>Player name</span>
              <input
                disabled={mode === "derby"}
                maxLength={24}
                onChange={(event) => setPlayerName(event.target.value)}
                placeholder="YOU"
                type="text"
                value={playerName}
              />
              <small>{mode === "derby" ? "Derby is spectator-controlled." : "Shown on your duck and race HUD."}</small>
            </label>

            <label className={styles.field}>
              <span>Race seed</span>
              <input
                maxLength={64}
                onChange={(event) => setSeed(event.target.value)}
                placeholder="DTF-420"
                type="text"
                value={seed}
              />
              <small>Reuse a seed to reproduce the same deterministic race setup.</small>
            </label>
          </div>

          <div className={styles.lobbyFooter}>
            <div className={styles.setupSummary}>
              <span>{MODE_OPTIONS.find((option) => option.id === mode)?.title}</span>
              <strong>{racerCount} ducks · Kush Creek · {seed.trim() || "DTF-420"}</strong>
            </div>
            <button className={styles.launchButton} type="submit">
              Launch race <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={styles.gameBar}>
        <div>
          <strong>{MODE_OPTIONS.find((option) => option.id === launchOptions.mode)?.title}</strong>
          <span>{launchOptions.racerCount} racers · Seed {launchOptions.seed}</span>
        </div>
        <button className={styles.backButton} onClick={returnToLobby} type="button">Race setup</button>
      </div>
      <div
        id={GAME_PARENT_ID}
        className={styles.canvas}
        aria-label={`Stoner Duck Race ${launchOptions.mode} with ${launchOptions.racerCount} racers`}
      />
    </div>
  );
}
