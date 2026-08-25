import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import modules from "@/content/atlas-learning-modules.json";
import atlasSections from "@/content/atlas-sections.json";
import knowledgeChecks from "@/content/atlas-knowledge-checks.json";
import { AtlasSystemGraphic } from "@/components/atlas/AtlasSystemGraphic";
import { AtlasAssetSlot } from "@/components/atlas/AtlasAssetSlot";
import { AtlasLessonProgress } from "@/components/atlas/AtlasLearningProgress";
import { AtlasLessonKnowledgeCheck } from "@/components/atlas/AtlasMastery";
import { getAtlasAsset } from "@/lib/atlas-assets";
import styles from "./page.module.css";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findAtlasModule(systemSlug: string) {
  return modules.find((item) => slugify(item.id) === systemSlug);
}

function observationPrompts(systemId: string) {
  const prompts: Record<string, string[]> = {
    seed_germination: ["Identify the developmental stage before comparing timing.", "Check moisture, oxygen, temperature, and tissue condition together.", "Separate seed viability questions from environmental failure patterns."],
    root_system: ["Inspect new root tips as well as older roots.", "Compare moisture distribution with root color, odor, and media structure.", "Interpret pH and EC using a consistent substrate-appropriate method."],
    stem_vascular: ["Locate the structure before assigning its transport role.", "Connect canopy demand to root water supply and vascular continuity.", "Record physical injury, constriction, or training damage when relevant."],
    nodes_branching: ["Locate nodes, internodes, axillary buds, and the active apex.", "Compare branch response over time rather than immediately after training.", "Judge architecture by light distribution, airflow, and recovery."],
    leaves: ["Compare new and old growth and upper versus lower canopy.", "Describe color, location, margins, veins, posture, and progression before naming a cause.", "Inspect both leaf surfaces and nearby nodes for pests or residue."],
    flowers: ["Use structural development rather than a calendar week alone.", "Inspect representative flower sites across the canopy.", "Check for pollination, senescence, mold risk, and cultivar-specific behavior."],
    trichomes_resin: ["Use consistent magnification and lighting.", "Inspect glandular trichomes on representative flower bracts.", "Treat apparent clarity or ambering as developmental evidence, not a potency assay."],
    sex_pollen_seed: ["Inspect reproductive structures at multiple nodes or flower sites.", "Distinguish bracts, stigmas, pollen sacs, anthers, and developing seed structures.", "Record timing, location, and frequency of mixed or intersex expression."],
    environment_overlay: ["Measure the variable rather than relying only on leaf appearance.", "Connect canopy demand to root supply and plant stage.", "Avoid optimizing one environmental number in isolation."],
    diagnostic_overlay: ["Record symptom location, pattern, progression, and plant stage.", "Check root-zone readings, environment, pests, and recent actions.", "Choose the next measurement that can separate plausible causes."],
  };
  return prompts[systemId] ?? ["Observe the structure carefully.", "Compare more than one plant region.", "Use measurements and context before drawing conclusions."];
}

function orderedLessonRoutes() {
  return modules.flatMap((atlasModule) =>
    atlasModule.lessons.map((item) => `/learn/atlas/${slugify(atlasModule.id)}/${slugify(item.title)}`),
  );
}

export function generateStaticParams() {
  return modules.flatMap((atlasModule) =>
    atlasModule.lessons.map((lesson) => ({
      system: slugify(atlasModule.id),
      lesson: slugify(lesson.title),
    })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ system: string; lesson: string }> }): Promise<Metadata> {
  const { system, lesson } = await params;
  const atlasModule = findAtlasModule(system);
  const selectedLesson = atlasModule?.lessons.find((item) => slugify(item.title) === lesson);
  if (!atlasModule || !selectedLesson) return { title: "Atlas Lesson" };
  return {
    title: `${selectedLesson.title} — ${atlasModule.label}`,
    description: selectedLesson.summary,
  };
}

export default async function AtlasLessonPage({ params }: { params: Promise<{ system: string; lesson: string }> }) {
  const { system, lesson } = await params;
  const atlasModule = findAtlasModule(system);
  if (!atlasModule) notFound();

  const lessonIndex = atlasModule.lessons.findIndex((item) => slugify(item.title) === lesson);
  if (lessonIndex < 0) notFound();
  const selectedLesson = atlasModule.lessons[lessonIndex];
  const asset = getAtlasAsset(atlasModule.id, selectedLesson.title);
  if (!asset) notFound();

  const section = atlasSections.find((item) => item.id === atlasModule.id);
  const previous = atlasModule.lessons[lessonIndex - 1];
  const next = atlasModule.lessons[lessonIndex + 1];
  const prompts = observationPrompts(atlasModule.id);
  const currentRoute = `/learn/atlas/${system}/${lesson}`;
  const knowledgeCheck = knowledgeChecks.find((check) => check.route === currentRoute);
  if (!knowledgeCheck) notFound();
  const allRoutes = orderedLessonRoutes();
  const globalLessonIndex = allRoutes.indexOf(currentRoute);
  const nextRoute = globalLessonIndex >= 0 ? allRoutes[globalLessonIndex + 1] : undefined;

  return (
    <section className="shell page-section">
      <div className={styles.pageShell}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/learn">Learn</Link><span>/</span>
          <Link href="/learn/atlas">Living Plant Atlas</Link><span>/</span>
          <Link href={`/learn/atlas/${system}`}>{atlasModule.label}</Link><span>/</span>
          <strong>{selectedLesson.title}</strong>
        </nav>

        <header className={styles.hero}>
          <div>
            <p>Visual lesson {String(lessonIndex + 1).padStart(2, "0")}</p>
            <h1>{selectedLesson.title}</h1>
            <div className={styles.summary}>{selectedLesson.summary}</div>
            <div className={styles.tags}>
              <span>{atlasModule.label}</span>
              <span>{selectedLesson.visual}</span>
            </div>
          </div>
          <AtlasSystemGraphic systemId={atlasModule.id} />
        </header>

        <section className={styles.visualFocus}>
          <AtlasAssetSlot asset={asset} />
          <aside>
            <p>Observation prompts</p>
            <h2>What to look for</h2>
            <div>{prompts.map((prompt, index) => <span key={prompt}><b>{index + 1}</b>{prompt}</span>)}</div>
          </aside>
        </section>

        <AtlasLessonKnowledgeCheck check={knowledgeCheck} />
        <AtlasLessonProgress route={currentRoute} nextRoute={nextRoute} />

        <section className={styles.context}>
          <div>
            <p>System context</p>
            <h2>Connect this lesson to the whole plant</h2>
            <span>{section?.summary ?? `This lesson belongs to the ${atlasModule.label} system.`}</span>
          </div>
          <Link href={`/learn/atlas/${system}`}>Open the full {atlasModule.label} interactive module</Link>
        </section>

        <section className={styles.navigation} aria-label="Lesson navigation">
          {previous ? <Link href={`/learn/atlas/${system}/${slugify(previous.title)}`}><small>Previous lesson</small><strong>{previous.title}</strong></Link> : <span />}
          {next ? <Link href={`/learn/atlas/${system}/${slugify(next.title)}`}><small>Next lesson</small><strong>{next.title}</strong></Link> : <span />}
        </section>
      </div>
    </section>
  );
}
