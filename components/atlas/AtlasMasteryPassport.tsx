"use client";

import Link from "next/link";
import badges from "@/content/atlas-mastery-badges.json";
import { atlasKnowledgeChecks } from "@/lib/atlas-knowledge-checks";
import { useAtlasMastery } from "@/components/atlas/AtlasMastery";
import styles from "./AtlasMasteryPassport.module.css";

const PASS_SCORE = 80;

export function AtlasMasteryPassport() {
  const { mastery } = useAtlasMastery();
  const masteredChecks = Object.values(mastery.lessons).filter((record) => record.mastered).length;
  const unlockedPathBadges = badges.filter((badge) => (mastery.paths[badge.id]?.bestScore ?? 0) >= PASS_SCORE).length;
  const atlasBadgeUnlocked = masteredChecks === atlasKnowledgeChecks.length;
  const totalUnlocked = unlockedPathBadges + (atlasBadgeUnlocked ? 1 : 0);
  const totalBadges = badges.length + 1;

  return (
    <div className={styles.passport}>
      <section className={styles.summary} aria-label="Atlas mastery passport summary">
        <div>
          <p>Atlas Mastery Passport</p>
          <h1>Build proof of what you understand.</h1>
          <span>
            Path badges unlock at a best mastery-quiz score of {PASS_SCORE}% or higher. The whole-Atlas badge unlocks after all {atlasKnowledgeChecks.length} lesson checks are mastered.
          </span>
        </div>
        <div className={styles.totals}>
          <strong>{totalUnlocked}/{totalBadges}</strong>
          <span>badges unlocked</span>
          <small>{masteredChecks}/{atlasKnowledgeChecks.length} lesson checks mastered</small>
        </div>
      </section>

      <section className={styles.notice} aria-label="Atlas mastery passport scope">
        <strong>Educational achievement record</strong>
        <span>This passport is saved on this device. It documents progress inside the THC Living Plant Atlas and is not a professional license, accreditation, or regulated credential.</span>
      </section>

      <section className={styles.badgeGrid} aria-label="Atlas path mastery badges">
        {badges.map((badge) => {
          const record = mastery.paths[badge.id];
          const unlocked = (record?.bestScore ?? 0) >= PASS_SCORE;
          return (
            <article key={badge.id} className={unlocked ? styles.unlockedCard : styles.lockedCard}>
              <div className={styles.badgeMark} aria-hidden="true">
                <span>{badge.mark}</span>
                <small>THC</small>
              </div>
              <div className={styles.badgeCopy}>
                <small>{badge.shortLabel}</small>
                <h2>{badge.title}</h2>
                <p>{badge.description}</p>
              </div>
              <div className={styles.badgeStatus}>
                <div>
                  <strong>{unlocked ? "Unlocked ✓" : "Locked"}</strong>
                  <span>{record ? `Best score ${record.bestScore}%` : `Score ${PASS_SCORE}%+ to unlock`}</span>
                </div>
                <Link href={`/learn/atlas/paths/${badge.id}`}>
                  {unlocked ? "Review mastery quiz" : "Take mastery quiz"}
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <section className={atlasBadgeUnlocked ? styles.finalBadgeUnlocked : styles.finalBadgeLocked} aria-label="Whole Atlas mastery badge">
        <div className={styles.finalMark} aria-hidden="true">
          <span>50</span>
          <small>ATLAS</small>
        </div>
        <div>
          <small>Whole-Atlas achievement</small>
          <h2>Living Plant Atlas Mastery</h2>
          <p>Master all 50 lesson knowledge checks across seed biology, roots, transport, architecture, leaves, flowers, trichomes, reproduction, environment, and diagnostics.</p>
        </div>
        <div className={styles.finalStatus}>
          <strong>{atlasBadgeUnlocked ? "Unlocked ✓" : `${masteredChecks}/${atlasKnowledgeChecks.length}`}</strong>
          <span>{atlasBadgeUnlocked ? "All lesson checks mastered" : `${atlasKnowledgeChecks.length - masteredChecks} checks remaining`}</span>
          <Link href="/learn/atlas">{atlasBadgeUnlocked ? "Review the Atlas" : "Continue mastering lessons"}</Link>
        </div>
      </section>
    </div>
  );
}
