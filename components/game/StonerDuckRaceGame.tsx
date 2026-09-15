"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import type { Game } from "phaser";
import { DUCK_CHARACTERS } from "@/game/stoner-duck-race/characters";
import { startStonerDuckRace } from "@/game/stoner-duck-race/main";
import {
  connectDuckRaceRoom,
  type DuckRaceRoomConnection,
  type DuckRaceRoomSnapshot,
} from "@/game/stoner-duck-race/network";
import {
  EMPTY_DUCK_RACE_PROFILE,
  loadDuckRaceProfile,
  profileLevel,
  recordDuckRaceResult,
  type DuckRaceProfile,
} from "@/game/stoner-duck-race/progression";
import { TRACK_LIST } from "@/game/stoner-duck-race/tracks";
import type { DuckRaceLaunchOptions, DuckRaceResult, RaceModeId, TrackId } from "@/game/stoner-duck-race/types";
import styles from "./StonerDuckRaceGame.module.css";

const GAME_PARENT_ID = "stoner-duck-race-game";
const ONLINE_ENDPOINT = process.env.NEXT_PUBLIC_DUCK_RACE_SERVER_URL ?? "";
const CUP_TRACKS: readonly TrackId[] = ["kush-creek", "munchie-marsh", "cloud-9-canal", "rosin-river"];

type PlaySource = "local" | "online";
type OnlineIntent = "create" | "join";
type LocalFormat = "quick" | "cup";

const MODE_OPTIONS: ReadonlyArray<{ id: RaceModeId; title: string; eyebrow: string; description: string }> = [
  { id: "derby", title: "Duck Derby", eyebrow: "Spectator race", description: "Seed the river and watch the AI field battle through hazards and pickups." },
  { id: "rally", title: "River Rally", eyebrow: "Skill race", description: "Control your duck, read the water, dodge hazards, grab items, and race the field." },
  { id: "chaos", title: "Chaos Derby", eyebrow: "Party mayhem", description: "Rally controls plus global chaos events and stronger comeback pressure." },
];

export function StonerDuckRaceGame() {
  const gameRef = useRef<Game | null>(null);
  const [source, setSource] = useState<PlaySource>("local");
  const [localFormat, setLocalFormat] = useState<LocalFormat>("quick");
  const [onlineIntent, setOnlineIntent] = useState<OnlineIntent>("create");
  const [mode, setMode] = useState<RaceModeId>("rally");
  const [trackId, setTrackId] = useState<TrackId>("kush-creek");
  const [racerCount, setRacerCount] = useState(24);
  const [playerName, setPlayerName] = useState("YOU");
  const [characterId, setCharacterId] = useState("mellow-mallard");
  const [seed, setSeed] = useState("DTF-420");
  const [roomId, setRoomId] = useState("");
  const [spectator, setSpectator] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [launchOptions, setLaunchOptions] = useState<DuckRaceLaunchOptions | null>(null);
  const [roomConnection, setRoomConnection] = useState<DuckRaceRoomConnection | null>(null);
  const [roomSnapshot, setRoomSnapshot] = useState<DuckRaceRoomSnapshot | null>(null);
  const [profile, setProfile] = useState<DuckRaceProfile>(EMPTY_DUCK_RACE_PROFILE);
  const [lastResult, setLastResult] = useState<DuckRaceResult | null>(null);
  const [cupIndex, setCupIndex] = useState(0);
  const [cupPoints, setCupPoints] = useState(0);

  useEffect(() => setProfile(loadDuckRaceProfile()), []);

  useLayoutEffect(() => {
    if (!launchOptions || gameRef.current) return;
    gameRef.current = startStonerDuckRace(
      GAME_PARENT_ID,
      launchOptions,
      roomConnection ?? undefined,
      (result) => {
        setLastResult(result);
        if (result.rank !== null) {
          setProfile((current) => recordDuckRaceResult(current, result));
          if (source === "local" && localFormat === "cup") {
            setCupPoints((points) => points + Math.max(1, result.racerCount - result.rank + 1));
          }
        }
      },
    );
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [launchOptions, roomConnection, source, localFormat]);

  useEffect(() => {
    if (!roomConnection) return;
    setRoomSnapshot(roomConnection.getSnapshot());
    return roomConnection.subscribe(setRoomSnapshot);
  }, [roomConnection]);

  useEffect(() => () => {
    if (roomConnection) void roomConnection.leave();
  }, [roomConnection]);

  function buildOptions(selectedTrack: TrackId, raceSeed = seed): DuckRaceLaunchOptions {
    return {
      mode,
      trackId: selectedTrack,
      racerCount: Math.max(1, Math.min(50, Math.floor(racerCount))),
      seed: raceSeed.trim().slice(0, 64) || "DTF-420",
      playerName: playerName.trim().slice(0, 24) || "YOU",
      characterId,
    };
  }

  async function launchRace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLastResult(null);

    const selectedTrack = source === "local" && localFormat === "cup" ? CUP_TRACKS[0] : trackId;
    const options = buildOptions(selectedTrack, source === "local" && localFormat === "cup" ? `${seed}-CUP-1` : seed);

    if (source === "local") {
      if (localFormat === "cup") {
        setCupIndex(0);
        setCupPoints(0);
      }
      setLaunchOptions(options);
      return;
    }

    if (!ONLINE_ENDPOINT) {
      setError("Online racing is not deployed yet. Configure NEXT_PUBLIC_DUCK_RACE_SERVER_URL to enable room play.");
      return;
    }

    setConnecting(true);
    try {
      const connection = await connectDuckRaceRoom({
        endpoint: ONLINE_ENDPOINT,
        intent: onlineIntent,
        roomId,
        mode,
        trackId,
        racerCount: options.racerCount,
        seed: options.seed,
        playerName: options.playerName,
        characterId,
        spectator,
      });
      const snapshot = connection.getSnapshot();
      setRoomConnection(connection);
      setRoomSnapshot(snapshot);
      setRoomId(connection.roomId);
      setLaunchOptions({
        mode: snapshot.mode,
        trackId: snapshot.trackId,
        racerCount: snapshot.racerCapacity,
        seed: snapshot.seed,
        playerName: options.playerName,
        characterId,
      });
    } catch (connectionError) {
      setError(connectionError instanceof Error ? connectionError.message : "Unable to connect to the race room.");
    } finally {
      setConnecting(false);
    }
  }

  async function returnToLobby() {
    gameRef.current?.destroy(true);
    gameRef.current = null;
    if (roomConnection) await roomConnection.leave();
    setRoomConnection(null);
    setRoomSnapshot(null);
    setLaunchOptions(null);
    setLastResult(null);
  }

  function nextCupRace() {
    if (!launchOptions || localFormat !== "cup") return;
    const nextIndex = cupIndex + 1;
    if (nextIndex >= CUP_TRACKS.length) return;
    gameRef.current?.destroy(true);
    gameRef.current = null;
    setCupIndex(nextIndex);
    setLastResult(null);
    setLaunchOptions(buildOptions(CUP_TRACKS[nextIndex], `${seed}-CUP-${nextIndex + 1}`));
  }

  if (!launchOptions) {
    const selectedTrack = TRACK_LIST.find((track) => track.id === trackId)!;
    const selectedCharacter = DUCK_CHARACTERS.find((character) => character.id === characterId) ?? DUCK_CHARACTERS[0];
    return (
      <div className={`${styles.shell} ${styles.lobbyShell}`}>
        <form className={styles.lobby} onSubmit={launchRace}>
          <header className={styles.lobbyHeader}>
            <div>
              <span className={styles.kicker}>Quack &amp; Bake · Stoner Duck Race</span>
              <h2>Choose the river, load the ducks, start the chaos.</h2>
              <p>Four tracks, eight power-ups, eight duck personalities, championship play, deterministic races, up to 50 racers, and optional server-authoritative rooms.</p>
            </div>
            <div className={styles.profileBadge}>
              <span>Level {profileLevel(profile)}</span>
              <strong>{profile.coins} Bud Bucks</strong>
              <small>{profile.wins} wins · {profile.podiums} podiums · {profile.races} races</small>
            </div>
          </header>

          <div className={styles.sourceRow}>
            <div className={styles.sourceSwitch} role="group" aria-label="Play source">
              <button type="button" data-active={source === "local"} onClick={() => setSource("local")}>Local</button>
              <button type="button" data-active={source === "online"} onClick={() => setSource("online")}>Online</button>
            </div>
            {source === "local" && (
              <div className={styles.sourceSwitch} role="group" aria-label="Local race format">
                <button type="button" data-active={localFormat === "quick"} onClick={() => setLocalFormat("quick")}>Quick race</button>
                <button type="button" data-active={localFormat === "cup"} onClick={() => { setLocalFormat("cup"); setMode((current) => current === "derby" ? "rally" : current); }}>4-race Cup</button>
              </div>
            )}
          </div>

          {source === "online" && (
            <section className={styles.onlinePanel}>
              <div className={styles.sourceSwitch} role="group" aria-label="Online room action">
                <button type="button" data-active={onlineIntent === "create"} onClick={() => setOnlineIntent("create")}>Create room</button>
                <button type="button" data-active={onlineIntent === "join"} onClick={() => setOnlineIntent("join")}>Join room</button>
              </div>
              {onlineIntent === "join" && (
                <label className={styles.field}><span>Room ID</span><input value={roomId} onChange={(event) => setRoomId(event.target.value)} maxLength={80} placeholder="Paste room ID" /></label>
              )}
              <label className={styles.checkField}><input type="checkbox" checked={spectator} onChange={(event) => setSpectator(event.target.checked)} /><span>Spectate only — do not claim a duck</span></label>
              {!ONLINE_ENDPOINT && <p className={styles.connectionNote}>Online UI is ready, but the public multiplayer server endpoint has not been configured.</p>}
            </section>
          )}

          <fieldset className={styles.modeFieldset}>
            <legend>Race mode</legend>
            <div className={styles.modeGrid}>
              {MODE_OPTIONS.filter((option) => !(source === "local" && localFormat === "cup" && option.id === "derby")).map((option) => (
                <button aria-pressed={mode === option.id} className={styles.modeButton} data-active={mode === option.id} key={option.id} onClick={() => setMode(option.id)} type="button">
                  <span>{option.eyebrow}</span><strong>{option.title}</strong><small>{option.description}</small>
                </button>
              ))}
            </div>
          </fieldset>

          {!(source === "local" && localFormat === "cup") && (
            <fieldset className={styles.modeFieldset}>
              <legend>Track</legend>
              <div className={styles.trackGrid}>
                {TRACK_LIST.map((track) => (
                  <button aria-pressed={trackId === track.id} className={styles.trackButton} data-active={trackId === track.id} key={track.id} onClick={() => setTrackId(track.id)} type="button">
                    <strong>{track.name}</strong><small>{track.tagline}</small><span>{(track.length / 1000).toFixed(1)}k course</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {source === "local" && localFormat === "cup" && (
            <div className={styles.cupRoute}>
              {CUP_TRACKS.map((cupTrack, index) => <span key={cupTrack}>{index + 1}. {TRACK_LIST.find((track) => track.id === cupTrack)?.name}</span>)}
            </div>
          )}

          <fieldset className={styles.modeFieldset}>
            <legend>Your duck</legend>
            <div className={styles.characterGrid}>
              {DUCK_CHARACTERS.map((character) => (
                <button type="button" key={character.id} data-active={characterId === character.id} className={styles.characterButton} onClick={() => setCharacterId(character.id)}>
                  <i style={{ backgroundColor: `#${character.bodyColor.toString(16).padStart(6, "0")}` }} aria-hidden="true" />
                  <strong>{character.name}</strong><small>{character.tagline}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <div className={styles.fieldGrid}>
            <label className={`${styles.field} ${styles.racerField}`}><span>Racers</span><div className={styles.rangeRow}><input aria-label="Number of racers" max={50} min={1} onChange={(event) => setRacerCount(Number(event.target.value))} type="range" value={racerCount} /><output>{racerCount}</output></div><small>From a solo run to the full 50-duck stampede.</small></label>
            <label className={styles.field}><span>Player name</span><input disabled={mode === "derby" || spectator} maxLength={24} onChange={(event) => setPlayerName(event.target.value)} placeholder="YOU" type="text" value={playerName} /><small>{spectator ? "Spectators do not claim a racer." : mode === "derby" ? "Derby is spectator-controlled." : `Racing as ${selectedCharacter.name}.`}</small></label>
            <label className={styles.field}><span>Race seed</span><input disabled={source === "online" && onlineIntent === "join"} maxLength={64} onChange={(event) => setSeed(event.target.value)} placeholder="DTF-420" type="text" value={seed} /><small>Reuse a seed to reproduce the same deterministic conditions.</small></label>
          </div>

          {error && <p className={styles.errorText} role="alert">{error}</p>}

          <div className={styles.lobbyFooter}>
            <div className={styles.setupSummary}>
              <span>{localFormat === "cup" && source === "local" ? "Quack & Bake Cup" : `${MODE_OPTIONS.find((option) => option.id === mode)?.title} · ${selectedTrack.name}`}</span>
              <strong>{racerCount} ducks · {source === "online" ? `${onlineIntent} online` : localFormat} · {selectedCharacter.name}</strong>
            </div>
            <button className={styles.launchButton} disabled={connecting} type="submit">{connecting ? "Connecting…" : source === "online" ? (onlineIntent === "create" ? "Create room →" : "Join room →") : localFormat === "cup" ? "Start Cup →" : "Launch race →"}</button>
          </div>
        </form>
      </div>
    );
  }

  const selectedTrackName = TRACK_LIST.find((track) => track.id === launchOptions.trackId)?.name ?? launchOptions.trackId;
  const cupComplete = source === "local" && localFormat === "cup" && cupIndex === CUP_TRACKS.length - 1 && Boolean(lastResult);

  return (
    <div className={styles.shell}>
      <div className={styles.gameBar}>
        <div><strong>{MODE_OPTIONS.find((option) => option.id === launchOptions.mode)?.title} · {selectedTrackName}</strong><span>{launchOptions.racerCount} racers · Seed {launchOptions.seed}{roomConnection ? ` · Room ${roomConnection.roomId}` : ""}</span></div>
        <div className={styles.gameActions}>
          {source === "local" && localFormat === "cup" && <span className={styles.roomStatus}>Cup {cupIndex + 1}/4 · {cupPoints} pts</span>}
          {roomConnection && roomSnapshot && <span className={styles.roomStatus}>{roomSnapshot.connectedRacers}/{roomSnapshot.racerCapacity} racers · {roomSnapshot.spectatorCount} watching</span>}
          {roomConnection?.isHost() && roomSnapshot?.phase === "lobby" && <button className={styles.startButton} onClick={() => roomConnection.startRace()} type="button">Start online race</button>}
          <button className={styles.backButton} onClick={() => void returnToLobby()} type="button">Race setup</button>
        </div>
      </div>
      <div id={GAME_PARENT_ID} className={styles.canvas} aria-label={`Stoner Duck Race ${launchOptions.mode} on ${selectedTrackName} with ${launchOptions.racerCount} racers`} />
      {lastResult && (
        <section className={styles.resultsPanel} aria-live="polite">
          <div><span>Race complete</span><strong>{lastResult.rank === null ? `${lastResult.winnerName} wins` : `You finished #${lastResult.rank}`}</strong><small>{selectedTrackName} · winner {lastResult.winnerName}</small></div>
          {source === "local" && localFormat === "cup" && !cupComplete && <button className={styles.launchButton} onClick={nextCupRace} type="button">Next Cup race →</button>}
          {cupComplete && <div className={styles.cupFinish}><span>Cup complete</span><strong>{cupPoints} points</strong></div>}
          <button className={styles.backButton} onClick={() => void returnToLobby()} type="button">Back to setup</button>
        </section>
      )}
    </div>
  );
}
