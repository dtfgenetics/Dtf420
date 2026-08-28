import Link from "next/link";
import relatedData from "@/content/education-related-links.json";
import styles from "./RelatedEducation.module.css";

type RelatedLink = {
  kind: string;
  title: string;
  href: string;
};

const relatedMap = relatedData as Record<string, RelatedLink[]>;

export function RelatedEducation({ path }: { path: string }) {
  const links = relatedMap[path] ?? [];
  if (!links.length) return null;

  return (
    <section className={styles.section} aria-label="Related education">
      <div className={styles.header}>
        <div>
          <p className="eyebrow">Connected learning</p>
          <h2>Use the next piece of evidence</h2>
        </div>
        <p>Move between reference material, measurement, field records, and whole-plant context instead of treating one page as the complete answer.</p>
      </div>
      <div className={styles.grid}>
        {links.map((link) => (
          <Link className={styles.card} href={link.href} key={`${link.kind}-${link.href}`}>
            <p className={styles.kind}>{link.kind}</p>
            <strong>{link.title}</strong>
            <span>Open resource →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
