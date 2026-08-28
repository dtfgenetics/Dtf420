import { getEducationSources } from "@/lib/education-sources";
import styles from "./EvidenceSources.module.css";

export function EvidenceSources({ path }: { path: string }) {
  const sources = getEducationSources(path);
  if (!sources.length) return null;

  return (
    <section className={styles.section} aria-labelledby="evidence-sources-title">
      <header className={styles.header}>
        <p>Evidence & further reading</p>
        <h2 id="evidence-sources-title">Sources connected to this lesson</h2>
        <span>
          These references support specific biological, diagnostic, environmental, or process concepts used in this lesson. They are not a substitute for crop-specific testing or local regulatory guidance.
        </span>
      </header>
      <div className={styles.list}>
        {sources.map((source) => (
          <article className={styles.source} key={source.id}>
            <div className={styles.meta}>
              <span>{source.sourceType}</span>
              <span>•</span>
              <span>{source.publisher}</span>
              {"year" in source && source.year ? <><span>•</span><span>{source.year}</span></> : null}
            </div>
            <a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>
            <p>{source.scope}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
