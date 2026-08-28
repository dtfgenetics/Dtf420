import Link from "next/link";
import overlays from "@/content/atlas-overlays.json";
import styles from "./AtlasOverlayLearningBridge.module.css";

function environmentRoute(id: string) {
  if (id === "light") return "/learn/atlas/environment-overlay/light-distribution";
  if (["leaf_temperature", "temperature", "rh"].includes(id)) return "/learn/atlas/environment-overlay/temperature-and-humidity";
  if (id === "vpd") return "/learn/atlas/environment-overlay/vpd-and-transpiration";
  if (id === "airflow") return "/learn/atlas/environment-overlay/airflow-and-boundary-layer";
  if (["water", "root_oxygen", "ph", "ec"].includes(id)) return "/learn/atlas/environment-overlay/root-zone-interaction";
  return "/learn/atlas/environment-overlay";
}

export function AtlasOverlayLearningBridge() {
  return (
    <section className={styles.wrap} aria-labelledby="overlay-learning-bridge-title">
      <header>
        <div>
          <small>Overlay → lesson bridge</small>
          <h2 id="overlay-learning-bridge-title">Turn a measurement or symptom location into the next useful lesson.</h2>
        </div>
        <p>The overlay is a navigation layer, not a diagnosis. Follow the variable or location into plant physiology, then combine it with stage, history, and additional measurements.</p>
      </header>

      <div className={styles.columns}>
        <article>
          <div className={styles.columnHeading}>
            <span>Environment</span>
            <Link href="/learn/atlas/environment-overlay">Open full environment system</Link>
          </div>
          <div className={styles.linkGrid}>
            {overlays.environment.factors.map((factor) => (
              <Link key={factor.id} href={environmentRoute(factor.id)}>
                <strong>{factor.label}</strong>
                <span>{factor.zone}</span>
                <small>{factor.connectsTo.slice(0, 2).join(" · ")}</small>
              </Link>
            ))}
          </div>
        </article>

        <article>
          <div className={styles.columnHeading}>
            <span>Diagnostic location</span>
            <Link href="/learn/atlas/diagnostic-overlay">Open diagnostic system</Link>
          </div>
          <div className={styles.linkGrid}>
            {overlays.diagnostics.zones.map((zone) => (
              <Link key={zone.id} href="/learn/atlas/diagnostic-overlay/symptom-location">
                <strong>{zone.label}</strong>
                <span>{zone.position}</span>
                <small>{zone.questions[0]}</small>
              </Link>
            ))}
          </div>
          <div className={styles.actions}>
            <Link href="/learn/symptoms">Open symptom differential library</Link>
            <Link href="/learn/atlas/cases">Practice diagnostic cases</Link>
            <Link href="/learn/atlas/notebook">Record a real observation</Link>
          </div>
        </article>
      </div>
    </section>
  );
}
