import type { Metadata } from "next";
import Link from "next/link";
import { BurnBudsLoader } from "@/components/game/BurnBudsLoader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Burn Buds Preview",
  description: "Preview the responsive 15 × 15 Burn Buds board while the full game systems are in development.",
};

const nextSystems = [
  ["Board interaction", "Turn the static grid into a responsive play surface with deliberate pointer and touch states."],
  ["Game flow", "Add setup, turn state, feedback, and clear win or round progression around the board."],
  ["Visual identity", "Replace prototype board treatment with final game art, effects, and reward feedback as gameplay locks in."],
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
          <p className="eyebrow">DTF Games · Board preview</p>
          <h1>Burn Buds</h1>
          <p className={styles.lede}>
            The 15 × 15 board foundation is running in Phaser and scaling across browser sizes. This page shows the current board shell while the actual interaction, turn flow, and gameplay systems are built out.
          </p>
        </div>

        <aside className={styles.previewMeta} aria-label="Burn Buds preview details">
          <div className={styles.metaItem}>
            <span>Current state</span>
            <strong>Board preview</strong>
          </div>
          <div className={styles.metaItem}>
            <span>Board</span>
            <strong>15 × 15</strong>
          </div>
          <div className={styles.metaItem}>
            <span>Runtime</span>
            <strong>Phaser</strong>
          </div>
        </aside>
      </header>

      <div className={styles.previewFrame}>
        <div className={styles.frameHeader}>
          <div><span className={styles.windowDot} /><strong>Live board preview</strong></div>
          <span>Responsive canvas</span>
        </div>
        <div className={styles.canvasWrap}>
          <BurnBudsLoader />
        </div>
        <div className={styles.frameFooter}>
          <span><strong>Preview only:</strong> the board renders now; full gameplay is still in development.</span>
          <span>15 × 15 · browser build</span>
        </div>
      </div>

      <section className={styles.nextSection} aria-labelledby="burn-buds-next">
        <div className={styles.nextIntro}>
          <p className="eyebrow">What comes next</p>
          <h2 id="burn-buds-next">Turn the board into the game.</h2>
          <p>The next UI work belongs around actual player actions, not more decorative chrome.</p>
        </div>
        <div className={styles.nextGrid}>
          {nextSystems.map(([title, copy], index) => (
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
