import type { Metadata } from "next";
import Link from "next/link";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "./page.module.css";

const baseMetadata = buildEducationMetadata({
  title: "THC Academy compatibility route",
  description: "Legacy THC Academy links are retained for compatibility. Canonical certification courses live under Courses and the Learning Hub; the 420-record Plant Science Encyclopedia remains a separate reference system.",
  path: "/learn/academy",
});

export const metadata: Metadata = {
  ...baseMetadata,
  robots: { index: false, follow: true },
  alternates: { canonical: "https://dtfseeds.com/courses/" },
};

export default function AcademyCompatibilityPage() {
  return (
    <section className="shell page-section" data-dtf-academy-compatibility="true">
      <header className={styles.hero}>
        <p className="eyebrow">Teaching Healthy Cultivation · Legacy compatibility</p>
        <h1>THC Academy has moved.</h1>
        <p className="lede">
          This URL is retained so older bookmarks and shared links still reach the current education system. The earlier 12-guide Academy and THC-C001–THC-C420 catalog are preserved as migration history, not as an active course catalog.
        </p>
        <div className={styles.heroActions}>
          <Link className="button" href="/courses/">Open professional courses</Link>
          <Link className="button secondary" href="/learn/learning-hub/">Open the Learning Hub</Link>
          <Link className="button secondary" href="/learn/encyclopedia/">Open the 420-entry Encyclopedia</Link>
        </div>
      </header>

      <div className={styles.stats} aria-label="Current THC education structure">
        <div className={styles.stat}><strong>15</strong><span>canonical Technician certification courses</span></div>
        <div className={styles.stat}><strong>420</strong><span>separate Plant Science Encyclopedia records</span></div>
        <div className={styles.stat}><strong>1</strong><span>canonical professional course system</span></div>
      </div>

      <section className={styles.catalogNotice} aria-labelledby="academy-compatibility-boundary">
        <h2 id="academy-compatibility-boundary">Legacy records are preserved, not promoted.</h2>
        <p>
          Historical Academy guide records and THC-C identifiers remain in source control for migration, crosswalk, and provenance work. They do not award credentials, do not replace the 15-course certification curriculum, and are not a second public course system.
        </p>
      </section>
    </section>
  );
}
