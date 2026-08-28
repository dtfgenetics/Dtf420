import Link from "next/link";
import connections from "@/content/atlas-system-connections.json";
import sections from "@/content/atlas-sections.json";
import styles from "./AtlasSystemConnections.module.css";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const sectionById = new Map(sections.map((section) => [section.id, section] as const));

export function AtlasSystemConnections({ systemId }: { systemId: string }) {
  const connection = connections.find((item) => item.id === systemId);
  if (!connection) return null;

  return (
    <section className={styles.wrap} aria-label="Connected plant systems">
      <header>
        <div>
          <small>Connected biology</small>
          <h2>This system does not work alone.</h2>
        </div>
        <p>{connection.reason}</p>
      </header>

      <div className={styles.columns}>
        <article>
          <h3>Follow the connection</h3>
          <div className={styles.links}>
            {connection.related.map((relatedId) => {
              const related = sectionById.get(relatedId);
              return (
                <Link key={relatedId} href={`/learn/atlas/${slugify(relatedId)}`}>
                  <span>{related?.label ?? relatedId.replaceAll("_", " ")}</span>
                  <small>{related?.summary ?? "Open connected Atlas system"}</small>
                </Link>
              );
            })}
          </div>
        </article>

        <article>
          <h3>Developmental context</h3>
          <div className={styles.tags}>{connection.stages.map((stage) => <span key={stage}>{stage}</span>)}</div>
          <h3>Measure or record with it</h3>
          <ul>{connection.measurements.map((measurement) => <li key={measurement}>{measurement}</li>)}</ul>
        </article>
      </div>
    </section>
  );
}
