import type { Metadata } from "next";
import Link from "next/link";
import { StrainShowdownGame } from "./StrainShowdownGame";
import containment from "./containment.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Strain Showdown | DTF Games",
  description:
    "Play the 48-card Strain Showdown Tier 1 battle preview: choose two strains, compare Vigor and Power, trigger family effects, and follow the battle result.",
};

const availableNow = [
  "48 Tier 1 real-strain cards",
  "8 families · 6 cards each",
  "Vigor = staying power",
  "Power = battle pressure",
] as const;

const comingNext = [
  "Full deck construction",
  "Summoning and stage progression",
  "Boost, Pressure, and Location cards",
  "Complete match and tournament rules",
] as const;

export default function StrainShowdownPage() {
  return (
    <main className={`shell ${styles.page} ${containment.guard}`}>
      <div className={styles.topline}>
        <Link href="/games" className={styles.backLink}>← Back to games</Link>
        <span className={styles.status}>Playable preview · Tier 1 battles</span>
      </div>

      <header className={styles.hero}>
        <div>
          <p className="eyebrow">DTF Games · Cannabis battle card game</p>
          <h1>Strain Showdown</h1>
          <p className={styles.lede}>
            Choose any two Tier 1 strains, compare Vigor and Power, activate family effects, and resolve the matchup. The current preview focuses on fast one-on-one battles while the larger deck-building game continues to expand.
          </p>
        </div>
        <div className={styles.heroMetric}>
          <strong>48</strong>
          <span>Tier 1 cards</span>
          <small>6 cards in each family</small>
        </div>
      </header>

      <section className={styles.ruleStatus} aria-label="Strain Showdown feature status">
        <article>
          <p className={styles.ruleLabel}>Playable now</p>
          <ul>{availableNow.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article>
          <p className={styles.ruleLabel}>Expanding next</p>
          <ul>{comingNext.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </section>

      <StrainShowdownGame />

      <section className={styles.disclosure} aria-label="Card data note">
        <strong>Card data note</strong>
        <p>
          The family system, Vigor and Power stats, Tier 1 order, and card effects use the recovered project rules. Lineage entries that still need stronger origin documentation remain visibly marked on their cards rather than being presented as settled facts.
        </p>
      </section>
    </main>
  );
}
