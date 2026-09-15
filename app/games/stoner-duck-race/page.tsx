import type { Metadata } from "next";
import Link from "next/link";
import { StonerDuckRaceLoader } from "@/components/game/StonerDuckRaceLoader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Quack & Bake: Stoner Duck Race | DTF Games",
  description: "Race up to 50 ducks across eight cannabis-comedy river courses in Duck Derby, River Rally, Chaos Derby, Time Trial, local Cup, and online room play.",
};

const modes = [
  ["Duck Derby", "Seed a deterministic race and watch up to 50 AI ducks battle currents, hazards, shields, pickups, and each other. Great for streams, community events, and quick party races."],
  ["River Rally", "Take direct control with steering, dive control, rechargeable boost, item timing, hazard reading, character choice, persistent results, and a four-race championship Cup."],
  ["Chaos Derby", "Keep Rally controls but add deterministic global events, stronger comeback pressure, wider disruption tools, and the most unpredictable large-field races."],
  ["Time Trial", "Run any course alone under seeded conditions and chase a persistent personal best without AI traffic changing the clock."],
] as const;

export default function StonerDuckRacePage() {
  return (
    <section className={`shell ${styles.page}`}>
      <div className={styles.topline}>
        <Link className={styles.backLink} href="/games">← Back to games</Link>
        <span className={styles.status}>Playable build</span>
      </div>

      <header className={styles.hero}>
        <div>
          <p className="eyebrow">DTF Games · Quack &amp; Bake</p>
          <h1>Stoner Duck Race</h1>
          <p className={styles.lede}>
            A deterministic arcade river racer built for one duck or a fifty-duck stampede. Pick from eight duck personalities, race eight different rivers, collect eight power-ups, dodge dynamic hazards, chase Time Trial PBs, run a four-race Cup, or create an authoritative online room with shareable invite links when the multiplayer endpoint is deployed.
          </p>
        </div>

        <aside className={styles.meta} aria-label="Stoner Duck Race game details">
          <div><span>Race capacity</span><strong>1–50 ducks</strong></div>
          <div><span>Tracks</span><strong>8 river courses</strong></div>
          <div><span>Power-ups</span><strong>8 gameplay items</strong></div>
          <div><span>Play</span><strong>Derby · Rally · Chaos · Cup · Trial</strong></div>
        </aside>
      </header>

      <div className={styles.frame}>
        <div className={styles.frameHeader}>
          <strong>Quack &amp; Bake race control</strong>
          <span>Keyboard: ← → steer · Space boost · ↓ dive · E item</span>
        </div>
        <StonerDuckRaceLoader />
        <div className={styles.frameFooter}>
          <span>Local play and progression work without a server. Online Create/Join and invite-link controls connect only when the public Colyseus endpoint is configured, so the game never displays fake connectivity.</span>
        </div>
      </div>

      <section className={styles.modeSection} aria-labelledby="duck-race-modes">
        <div className={styles.sectionIntro}>
          <p className="eyebrow">One race engine · multiple ways to play</p>
          <h2 id="duck-race-modes">Race it, watch it, or turn the river loose.</h2>
          <p>Kush Creek, Munchie Marsh, Cloud 9 Canal, Dab Rapids, Trichome Trail, Greenhouse Run, Rosin River, and Final Smokeout share the same seeded simulation while changing currents, lane forces, hazards, item placement, pacing, and route pressure.</p>
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
