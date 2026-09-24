import type { Metadata } from "next";
import Link from "next/link";
import queueData from "@/data/terpenes/review-promotion-queue.json";
import { terpeneSeedCompounds } from "@/lib/terpenes/data";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "./page.module.css";

type PromotionCandidate = {
  slug: string;
  score: number;
  status: string;
  exactTpsMajorProduct: boolean;
  exactCultivarAnalyte: boolean;
  reviewedEvidenceCount: number;
  claimTypes: string[];
  sourceIds: string[];
  cultivar: {
    measurementKind: string;
    cultivarCount: number;
    measuredSamples: number;
    multiLabCultivars: number;
    positiveMedianShare: number;
  } | null;
  nextActions: string[];
};

const queue = queueData as {
  reviewedCompoundCount: number;
  candidateCount: number;
  promotionReadyCount: number;
  policy: Record<string, boolean>;
  candidates: PromotionCandidate[];
};

function label(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export const metadata: Metadata = buildEducationMetadata({
  title: "Terpene Review Promotion Queue",
  description:
    "See how source candidates become reviewed THC Terpene Atlas chapters through exact identity, genetics, cultivar chemistry, and evidence review.",
  path: "/learn/terpenes/promotion",
});

export default function TerpenePromotionPage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div>
          <Link href="/learn/terpenes">← THC Terpene Atlas</Link>
          <p className="eyebrow">Evidence governance · review promotion</p>
          <h1>Terpene Review Promotion Queue</h1>
          <p>
            The universal registry is broad by design. This queue shows which compounds have enough exact,
            scoped Cannabis evidence to become reviewed educational chapters—and which still have blockers.
          </p>
        </div>
        <div className={styles.stats}>
          <article><span>Reviewed chapters</span><strong>{queue.reviewedCompoundCount}</strong></article>
          <article><span>Queued candidates</span><strong>{queue.candidateCount}</strong></article>
          <article><span>Promotion-ready now</span><strong>{queue.promotionReadyCount}</strong></article>
        </div>
      </header>

      <section className={styles.policy}>
        <div>
          <p className="eyebrow">Promotion policy</p>
          <h2>Exact evidence outranks name similarity.</h2>
        </div>
        <div className={styles.policyGrid}>
          <article><strong>Name similarity</strong><span>Never establishes identity</span></article>
          <article><strong>Aggregate isomers</strong><span>Never count as exact-compound chemistry</span></article>
          <article><strong>Tentative TPS products</strong><span>Never count as promotion-ready</span></article>
          <article><strong>Reviewed chapter</strong><span>Requires exact identity + evidence-scoped claims</span></article>
        </div>
      </section>

      <section className={styles.promoted}>
        <div>
          <p className="eyebrow">Promotion wave 01</p>
          <h2>New reviewed chapters</h2>
        </div>
        <div className={styles.promotedGrid}>
          {terpeneSeedCompounds
            .filter((compound) => ["alpha-terpinene", "gamma-terpinene"].includes(compound.slug))
            .map((compound) => (
              <Link href={"/learn/terpenes/" + compound.slug} key={compound.slug}>
                <span>Reviewed</span>
                <strong>{compound.name}</strong>
                <small>{compound.formula} · exact TPS evidence · exact cultivar analyte</small>
              </Link>
            ))}
        </div>
      </section>

      <section className={styles.queue}>
        <div className={styles.sectionHeading}>
          <div>
            <p className="eyebrow">Remaining queue</p>
            <h2>Blocked candidates</h2>
          </div>
          <p>
            A high score prioritizes review work. It does not itself promote a compound or prove Cannabis occurrence.
          </p>
        </div>

        <div className={styles.cards}>
          {queue.candidates.map((candidate) => (
            <article key={candidate.slug}>
              <header>
                <div>
                  <span>{label(candidate.status)}</span>
                  <h3>{label(candidate.slug)}</h3>
                </div>
                <b>{candidate.score}</b>
              </header>

              <div className={styles.signals}>
                <div data-yes={candidate.exactTpsMajorProduct ? "" : undefined}>
                  <span>Exact TPS major product</span>
                  <strong>{candidate.exactTpsMajorProduct ? "Yes" : "No"}</strong>
                </div>
                <div data-yes={candidate.exactCultivarAnalyte ? "" : undefined}>
                  <span>Exact cultivar analyte</span>
                  <strong>{candidate.exactCultivarAnalyte ? "Yes" : "No"}</strong>
                </div>
                <div>
                  <span>Reviewed evidence records</span>
                  <strong>{candidate.reviewedEvidenceCount}</strong>
                </div>
              </div>

              {candidate.cultivar ? (
                <div className={styles.cultivar}>
                  <span>{candidate.cultivar.cultivarCount.toLocaleString()} cultivar groups</span>
                  <span>{candidate.cultivar.measuredSamples.toLocaleString()} measured samples</span>
                  <span>{candidate.cultivar.multiLabCultivars.toLocaleString()} multi-lab groups</span>
                </div>
              ) : (
                <p className={styles.warning}>
                  No exact cultivar analyte is available. Aggregate-isomer chemistry cannot satisfy this requirement.
                </p>
              )}

              <div className={styles.actions}>
                <span>Next evidence actions</span>
                <ol>
                  {candidate.nextActions.map((action) => <li key={action}>{action}</li>)}
                </ol>
              </div>

              {candidate.sourceIds.length ? (
                <footer>{candidate.sourceIds.join(" · ")}</footer>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <nav className={styles.links}>
        <Link href="/learn/terpenes/registry">Universal registry →</Link>
        <Link href="/learn/terpenes/chapters">Chapter readiness →</Link>
        <Link href="/learn/terpenes/research">Research ledger →</Link>
      </nav>
    </main>
  );
}
