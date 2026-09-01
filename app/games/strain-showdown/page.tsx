import type { Metadata } from "next";
import Link from "next/link";
import { StrainShowdownGame } from "./StrainShowdownGame";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Strain Showdown Battle Lab | DTF Games",
  description:
    "Test the recovered 48-card Strain Showdown Tier 1 set in an experimental Vigor-and-Power battle resolver while the complete deck, summoning, Boost, Pressure, Location, and match rules are finalized.",
};

const locked = [
  "48 Tier 1 real-strain cards",
  "8 families · 6 cards each",
  "Vigor = staying power",
  "Power = battle pressure",
] as const;

const stillInReview = [
  "Deck construction and final card counts",
  "Summoning / sacrifice / stage progression",
  "Boost, Pressure, and Location economy",
  "Match victory and tournament rules",
] as const;

export default function StrainShowdownPage() {
  return (
    <main className={`shell ${styles.page}`}>
      <div className={styles.topline}>
        <Link href="/games" className={styles.backLink}>← Back to games</Link>
        <span className={styles.status}>Development preview · rules lab</span>
      </div>

      <header className={styles.hero}>
        <div>
          <p className="eyebrow">DTF Games · Cannabis battle card system</p>
          <h1>Strain Showdown</h1>
          <p className={styles.lede}>
            The original Tier 1 set is now in code. Pick any two of the recovered 48 cards and test the first deterministic battle layer while the rest of the tabletop rules are finalized from the existing project bible.
          </p>
        </div>
        <div className={styles.heroMetric}>
          <strong>48</strong>
          <span>Tier 1 cards recovered</span>
          <small>6 per locked family</small>
        </div>
      </header>

      <section className={styles.ruleStatus} aria-label="Strain Showdown rules status">
        <article>
          <p className={styles.ruleLabel}>Locked foundation</p>
          <ul>{locked.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article>
          <p className={styles.ruleLabel}>Still being tested</p>
          <ul>{stillInReview.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </section>

      <StrainShowdownGame />

      <section className={styles.disclosure}>
        <strong>Why this is a Battle Lab instead of a fake “finished” TCG:</strong>
        <p>
          The family system, Vigor/Power stats, Tier 1 order, and card effects are recovered project decisions. The simultaneous-damage resolver is an explicit experimental layer so we can playtest those cards before locking the larger deck and summon economy. Mango Haze has now cleared its tighter source pass against Mr. Nice Seedbank’s breeder documentation; Mango Kush remains visibly flagged because its commonly reported Mango × Hindu Kush parentage still lacks a clearly documented original breeder/origin.
        </p>
      </section>
    </main>
  );
}
