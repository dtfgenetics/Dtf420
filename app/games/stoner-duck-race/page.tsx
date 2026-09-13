import type { Metadata } from "next";
import Link from "next/link";
import { StonerDuckRaceLoader } from "@/components/game/StonerDuckRaceLoader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Stoner Duck Race | DTF Games",
  description: "Development build of the 50-racer Stoner Duck Race engine with Duck Derby, River Rally, and Chaos Derby modes.",
};

const modes = [
  ["Duck Derby", "Up to 50 AI-driven or named community ducks race through a deterministic seeded course. Built for events, giveaways, streams, and instant party races."],
  ["River Rally", "Direct-control arcade racing with paddling, boost management, route choice, soft body interaction, and server-authoritative multiplayer as the target architecture."],
  ["Chaos Derby", "The same race engine with high-frequency powerups, catch-up pressure, global events, and intentionally wild course conditions."],
] as const;

export default function StonerDuckRacePage() {
  return (
    <section className={`shell ${styles.page}`}>
      <div className={styles.topline}>
        <Link className={styles.backLink} href="/games">← Back to games</Link>
        <span className={styles.status}>Engine prototype</span>
      </div>

      <header className={styles.hero}>
        <div>
          <p className="eyebrow">DTF Games · 50-player river racer</p>
          <h1>Stoner Duck Race</h1>
          <p className={styles.lede}>
            One deterministic duck-racing engine, three game modes, and a hard architecture target of fifty racers. The current build proves shared race state, seeded simulation, AI racing, ranking, and Phaser rendering before production art and networking are layered in.
          </p>
        </div>

        <aside className={styles.meta} aria-label="Stoner Duck Race prototype details">
          <div><span>Race capacity</span><strong>1–50 ducks</strong></div>
          <div><span>Modes</span><strong>Derby · Rally · Chaos</strong></div>
          <div><span>Simulation</span><strong>20 Hz deterministic</strong></div>
        </aside>
      </header>

      <div className={styles.frame}>
        <div className={styles.frameHeader}>
          <strong>50-duck engine test</strong>
          <span>Keyboard: 1 Derby · 2 Rally · 3 Chaos · R Restart</span>
        </div>
        <StonerDuckRaceLoader />
        <div className={styles.frameFooter}>
          <span>Prototype art is procedural. Production duck sprites, river assets, hazards, powerups, audio, and multiplayer are intentionally separated from the simulation layer.</span>
        </div>
      </div>

      <section className={styles.modeSection} aria-labelledby="duck-race-modes">
        <div className={styles.sectionIntro}>
          <p className="eyebrow">Shared engine · distinct rulesets</p>
          <h2 id="duck-race-modes">Three races. One foundation.</h2>
          <p>Tracks, duck definitions, seeded race state, replays, ranking, and networking can be shared while each mode changes who controls the ducks and how much chaos the rules allow.</p>
        </div>

        <div className={styles.modeGrid}>
          {modes.map(([title, copy], index) => (
            <article key={title}>
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
