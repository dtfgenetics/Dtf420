import type { Metadata } from "next";
import Link from "next/link";
import { BurnBudsLoader } from "@/components/game/BurnBudsLoader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Burn Buds | DTF Games",
  description: "Play the Burn Buds 15 × 15 tactical fleet-battle beta with manual or automatic placement, hit-and-sink combat, and a hunt-target opponent.",
};

const playSystems = [
  ["Build your fleet", "Place five cannabis-themed pieces manually, rotate their direction, or use seeded auto-placement to get into a match quickly."],
  ["Call the target", "Switch to the opponent grid, select a coordinate, and commit each shot with a large FIRE control built to remain usable on phones."],
  ["Read the battle", "Hits, misses, sunk pieces, fleet survival, incoming shots, and turn ownership stay visible while the opponent hunts damaged pieces."],
] as const;

export default function BurnBudsPage() {
  return (
    <section className={`shell ${styles.page}`}>
      <div className={styles.topline}>
        <Link className={styles.backLink} href="/games">← Back to games</Link>
        <span className={styles.status}>Development preview</span>
      </div>

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">DTF Games · Tactical fleet battle</p>
          <h1>Burn Buds</h1>
          <p className={styles.lede}>
            Hide a five-piece fleet across a 15 × 15 grow-grid, trade shots with a hunt-and-target opponent, track hits and sunk pieces, and burn the opposing fleet before yours goes down.
          </p>
        </div>

        <aside className={styles.previewMeta} aria-label="Burn Buds beta details">
          <div className={styles.metaItem}>
            <span>Current state</span>
            <strong>Playable beta</strong>
          </div>
          <div className={styles.metaItem}>
            <span>Board</span>
            <strong>15 × 15</strong>
          </div>
          <div className={styles.metaItem}>
            <span>Opponent</span>
            <strong>Hunt + target AI</strong>
          </div>
        </aside>
      </header>

      <div className={styles.previewFrame}>
        <div className={styles.frameHeader}>
          <div><span className={styles.windowDot} /><strong>Burn Buds battle console</strong></div>
          <span>Pointer + touch controls</span>
        </div>
        <div className={styles.canvasWrap}>
          <BurnBudsLoader />
        </div>
        <div className={styles.frameFooter}>
          <span><strong>Beta:</strong> core placement, turn, hit/miss, sink, AI, victory, and reset systems are playable; audiovisual polish and multiplayer remain in development.</span>
          <span>15 × 15 · Phaser</span>
        </div>
      </div>

      <section className={styles.nextSection} aria-labelledby="burn-buds-how-to-play">
        <div className={styles.nextIntro}>
          <p className="eyebrow">How it plays</p>
          <h2 id="burn-buds-how-to-play">Set the fleet. Call the square. Burn the board.</h2>
          <p>Manual placement is there when you want strategy; auto-place gets a match started immediately. During battle, the fleet and target views keep information separated so hidden enemy positions stay hidden.</p>
        </div>
        <div className={styles.nextGrid}>
          {playSystems.map(([title, copy], index) => (
            <article className={styles.nextItem} key={title}>
              <strong>0{index + 1}</strong>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
