import type { Metadata } from "next";
import Link from "next/link";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "./page.module.css";

export const metadata: Metadata = buildEducationMetadata({
  title: "THC Simple User Guide",
  description:
    "A beginner-friendly visual path through setup, seeds, seedlings, vegetative growth, flower, harvest, drying, curing, pests, and core cultivation habits.",
  path: "/learn/simple",
});

type SimpleStep = {
  slug: string;
  number: string;
  title: string;
  intro: string;
  points: string[];
  avoid?: string;
  noteLabel?: string;
  note?: string;
  rule: string;
};

const steps: SimpleStep[] = [
  {
    slug: "setup",
    number: "01",
    title: "Setup",
    intro: "Get ready before you start seeds.",
    points: ["Light or sun", "Pot with drainage", "Simple grow mix", "Water", "Airflow", "Drying and curing space"],
    avoid: "Starting seeds with no plan.",
    rule: "Set up first. Start seeds second.",
  },
  {
    slug: "seeds",
    number: "02",
    title: "Seeds",
    intro: "A seed wakes up with moisture and warmth.",
    points: ["Moisture", "Warmth", "Gentle handling", "Time"],
    avoid: "Drowning it or checking too much.",
    noteLabel: "Move on when",
    note: "The first white root appears.",
    rule: "Moist. Warm. Gentle. Patient.",
  },
  {
    slug: "seedling",
    number: "03",
    title: "Seedling",
    intro: "A seedling is a baby plant.",
    points: ["Gentle light", "Light watering", "Clean air", "Time to grow roots"],
    avoid: "Too much water, food, or strong light.",
    noteLabel: "Move on when",
    note: "It has several healthy leaves.",
    rule: "Baby plants need gentle care.",
  },
  {
    slug: "veg",
    number: "04",
    title: "Veg",
    intro: "Veg is when the plant grows bigger.",
    points: ["Roots", "Stems", "Leaves", "Branches"],
    noteLabel: "Do",
    note: "Water when the pot starts to dry.",
    avoid: "Overwatering and overfeeding.",
    rule: "Veg builds the plant’s body.",
  },
  {
    slug: "flower",
    number: "05",
    title: "Flower",
    intro: "Flower is when buds begin to form.",
    points: ["Steady light schedule", "Good airflow", "Careful watering", "Patience"],
    avoid: "Wet, stale air around buds.",
    noteLabel: "Watch for",
    note: "Buds getting bigger and smell getting stronger.",
    rule: "Patience protects quality.",
  },
  {
    slug: "harvest",
    number: "06",
    title: "Harvest",
    intro: "Harvest means cutting the plant when buds are ready.",
    points: ["Full buds", "Strong smell", "Darker curled hairs", "Mature trichomes"],
    noteLabel: "Do",
    note: "Use clean tools.",
    avoid: "Cutting early because you are excited.",
    rule: "Harvest when the plant is ready.",
  },
  {
    slug: "dry",
    number: "07",
    title: "Dry",
    intro: "Drying slowly removes moisture after harvest.",
    points: ["Darkness", "Gentle airflow", "Moderate temperature", "Time"],
    avoid: "Heat, bright light, and direct fan blast.",
    noteLabel: "Move on when",
    note: "Buds feel dry outside and small stems bend or snap.",
    rule: "Fast drying can ruin good flower.",
  },
  {
    slug: "cure",
    number: "08",
    title: "Cure",
    intro: "Curing is the final step after drying.",
    points: ["Clean jars or containers", "Cool storage", "Darkness", "Mold checks"],
    noteLabel: "Do",
    note: "Open containers early if moisture builds up.",
    avoid: "Jarring wet buds.",
    rule: "Dry first. Cure second.",
  },
  {
    slug: "pests",
    number: "09",
    title: "Pests",
    intro: "Pests are problems that can damage plants.",
    points: ["Tiny bugs", "Eggs", "Webbing", "Leaf spots", "Chewed leaves"],
    noteLabel: "Do",
    note: "Look under leaves often.",
    avoid: "Spraying random products on buds.",
    rule: "Catch pests early.",
  },
  {
    slug: "tips",
    number: "10",
    title: "Tips",
    intro: "Beginner rules that matter most.",
    points: ["Start small", "Check before watering", "Feed lightly", "Keep air moving", "Keep it clean", "Change one thing at a time", "Take pictures", "Be patient"],
    rule: "Healthy basics beat complicated tricks.",
  },
] as const;

export default function SimpleGuidePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="shell">
          <p className="eyebrow">Teaching Healthy Cultivation</p>
          <h1>THC Simple User Guide</h1>
          <p className="lede">
            A visual starter path for lawful home growers: know your stage, what the plant needs, what to do, what to avoid, and what comes next.
          </p>
          <div className={styles.heroActions}>
            <a className="button button--primary" href="#guide">Start with setup</a>
            <Link className="button" href="/learn">Open full learning hub</Link>
          </div>
        </div>
      </section>

      <section className={styles.pathBand} aria-label="Guide stages">
        <div className="shell">
          <ol className={styles.path}>
            {steps.map((step) => (
              <li key={step.slug}>
                <a href={`#${step.slug}`}>
                  <span>{step.number}</span>
                  {step.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="shell section" id="guide">
        <div className={styles.intro}>
          <div>
            <p className="eyebrow">Simple by design</p>
            <h2>Learn the whole path without getting buried in jargon.</h2>
          </div>
          <p>
            Each card keeps the same rhythm: a plain-language meaning, the essentials, one avoid box, and one simple rule. When you need deeper science, move into the Academy, Atlas, glossary, or diagnostic tools.
          </p>
        </div>

        <div className={styles.grid}>
          {steps.map((step) => (
            <article className={styles.card} id={step.slug} key={step.slug}>
              <header className={styles.cardHeader}>
                <span>{step.number}</span>
                <p>THC Simple User Guide</p>
              </header>
              <h2>{step.title}</h2>
              <p className={styles.introText}>{step.intro}</p>

              <div className={styles.visual} aria-hidden="true">
                <span>{step.title.slice(0, 1)}</span>
              </div>

              <div className={styles.panel}>
                <h3>{step.title === "Harvest" ? "Look for" : step.title === "Tips" ? "Remember" : step.title === "Veg" ? "The plant builds" : "Needs"}</h3>
                <ul>
                  {step.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>

              {step.note && step.noteLabel ? (
                <div className={styles.note}>
                  <strong>{step.noteLabel}</strong>
                  <p>{step.note}</p>
                </div>
              ) : null}

              {step.avoid ? (
                <div className={styles.avoid}>
                  <strong>Avoid</strong>
                  <p>{step.avoid}</p>
                </div>
              ) : null}

              <div className={styles.rule}>
                <span>Simple rule</span>
                <strong>{step.rule}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.next}>
        <div className="shell">
          <p className="eyebrow">Go deeper when you are ready</p>
          <h2>Simple first. Science next.</h2>
          <div className={styles.nextGrid}>
            <Link href="/learn/academy">
              <strong>THC Academy</strong>
              <span>Structured courses →</span>
            </Link>
            <Link href="/learn/atlas">
              <strong>Living Plant Atlas</strong>
              <span>Visual plant science →</span>
            </Link>
            <Link href="/learn/glossary">
              <strong>Terms</strong>
              <span>Plain-language definitions →</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
