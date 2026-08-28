"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import atlasSections from "@/content/atlas-sections.json";
import learningModules from "@/content/atlas-learning-modules.json";
import diagnosticFramework from "@/content/diagnostic-framework.json";
import { useAtlasProgress } from "@/components/atlas/AtlasLearningProgress";
import { useAtlasMastery } from "@/components/atlas/AtlasMastery";
import styles from "./LivingPlantAtlas.module.css";
import progressStyles from "./LivingPlantAtlasProgress.module.css";

type AtlasMode = "anatomy" | "environment" | "diagnostics";
type AtlasSection = (typeof atlasSections)[number];
type SystemState = "notStarted" | "inProgress" | "complete" | "mastered";

type HotspotPosition = {
  top: string;
  left: string;
};

const hotspotPositions: Record<string, HotspotPosition> = {
  seed_germination: { top: "89%", left: "47%" },
  root_system: { top: "78%", left: "47%" },
  stem_vascular: { top: "58%", left: "50%" },
  nodes_branching: { top: "43%", left: "50%" },
  leaves: { top: "34%", left: "27%" },
  flowers: { top: "13%", left: "50%" },
  trichomes_resin: { top: "20%", left: "66%" },
  sex_pollen_seed: { top: "30%", left: "74%" },
  environment_overlay: { top: "8%", left: "16%" },
  diagnostic_overlay: { top: "53%", left: "80%" },
};

const anatomicalIds = new Set([
  "seed_germination",
  "root_system",
  "stem_vascular",
  "nodes_branching",
  "leaves",
  "flowers",
  "trichomes_resin",
  "sex_pollen_seed",
]);

const lessonCount = learningModules.reduce((total, module) => total + module.lessons.length, 0);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sectionForMode(mode: AtlasMode, section: AtlasSection) {
  if (mode === "anatomy") return anatomicalIds.has(section.id);
  if (mode === "environment") return section.id === "environment_overlay" || anatomicalIds.has(section.id);
  return section.id === "diagnostic_overlay" || anatomicalIds.has(section.id);
}

function sectionRoute(section: AtlasSection) {
  return `/learn/atlas/${section.id.replaceAll("_", "-")}`;
}

function lessonRoutesForSystem(systemId: string) {
  const atlasModule = learningModules.find((item) => item.id === systemId);
  if (!atlasModule) return [];
  return atlasModule.lessons.map(
    (lesson) => `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`,
  );
}

function stateForSystem(total: number, completed: number, mastered: number): SystemState {
  if (total > 0 && mastered === total) return "mastered";
  if (total > 0 && completed === total) return "complete";
  if (completed > 0 || mastered > 0) return "inProgress";
  return "notStarted";
}

function stateLabel(state: SystemState) {
  if (state === "mastered") return "Mastered";
  if (state === "complete") return "Complete";
  if (state === "inProgress") return "In progress";
  return "Not started";
}

export function LivingPlantAtlas() {
  const [mode, setMode] = useState<AtlasMode>("anatomy");
  const [selectedId, setSelectedId] = useState("leaves");
  const { progress } = useAtlasProgress();
  const { mastery } = useAtlasMastery();

  const selected = useMemo(
    () => atlasSections.find((section) => section.id === selectedId) ?? atlasSections[4],
    [selectedId],
  );

  const visibleSections = atlasSections.filter((section) => sectionForMode(mode, section));
  const selectedRoutes = lessonRoutesForSystem(selected.id);
  const selectedCompleted = selectedRoutes.filter((route) => progress.completed.includes(route)).length;
  const selectedMastered = selectedRoutes.filter((route) => mastery.lessons[route]?.mastered).length;
  const selectedState = stateForSystem(selectedRoutes.length, selectedCompleted, selectedMastered);
  const selectedNextRoute = selectedRoutes.find((route) => !progress.completed.includes(route)) ?? selectedRoutes[0];

  function selectSection(section: AtlasSection) {
    setSelectedId(section.id);
    if (section.id === "environment_overlay") setMode("environment");
    if (section.id === "diagnostic_overlay") setMode("diagnostics");
  }

  return (
    <div className={styles.atlasShell}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Explore</p>
          <h1>THC Living Plant Atlas</h1>
          <p className={styles.heroCopy}>
            Explore the plant as one connected biological system. Select a structure, switch lenses,
            then open the system lessons when you are ready to go deeper.
          </p>
        </div>
        <div className={styles.heroStats} aria-label="Atlas scope">
          <span><strong>{atlasSections.length}</strong> plant systems</span>
          <span><strong>{lessonCount}</strong> structured lessons</span>
          <span><strong>{diagnosticFramework.observation_fields.length}</strong> observation fields</span>
        </div>
      </section>

      <nav className={styles.modeBar} aria-label="Atlas learning lens">
        <button
          className={mode === "anatomy" ? styles.modeActive : ""}
          type="button"
          onClick={() => setMode("anatomy")}
        >
          Anatomy & function
        </button>
        <button
          className={mode === "environment" ? styles.modeActive : ""}
          type="button"
          onClick={() => {
            setMode("environment");
            setSelectedId("environment_overlay");
          }}
        >
          Environment lens
        </button>
        <button
          className={mode === "diagnostics" ? styles.modeActive : ""}
          type="button"
          onClick={() => {
            setMode("diagnostics");
            setSelectedId("diagnostic_overlay");
          }}
        >
          Diagnostic lens
        </button>
      </nav>

      <section className={styles.workspace}>
        <div className={`${styles.plantStage} ${styles[mode]}`}>
          <div className={styles.stageLabel}>
            <span>{mode === "anatomy" ? "Whole-plant anatomy" : mode === "environment" ? "Environmental interactions" : "Symptom location"}</span>
            <small>Hotspots show your saved learning state</small>
          </div>

          <svg className={styles.plantArt} viewBox="0 0 600 760" role="img" aria-label="Interactive cannabis plant diagram">
            <defs>
              <linearGradient id="leafFill" x1="0" x2="1">
                <stop offset="0" stopColor="#174f35" />
                <stop offset="1" stopColor="#2d7651" />
              </linearGradient>
              <linearGradient id="stemFill" x1="0" x2="1">
                <stop offset="0" stopColor="#7d9a62" />
                <stop offset="1" stopColor="#48683e" />
              </linearGradient>
              <radialGradient id="envHalo">
                <stop offset="0" stopColor="rgba(111, 199, 146, 0.34)" />
                <stop offset="1" stopColor="rgba(111, 199, 146, 0)" />
              </radialGradient>
              <radialGradient id="stressHalo">
                <stop offset="0" stopColor="rgba(224, 171, 73, 0.32)" />
                <stop offset="1" stopColor="rgba(224, 171, 73, 0)" />
              </radialGradient>
            </defs>

            {mode === "environment" ? <ellipse className={styles.environmentHalo} cx="300" cy="285" rx="250" ry="250" fill="url(#envHalo)" /> : null}
            {mode === "diagnostics" ? <ellipse className={styles.diagnosticHalo} cx="300" cy="315" rx="245" ry="265" fill="url(#stressHalo)" /> : null}

            <path className={styles.rootLine} d="M300 610 C280 645 250 675 238 728" />
            <path className={styles.rootLine} d="M300 610 C320 650 358 685 374 730" />
            <path className={styles.rootLine} d="M300 630 C285 672 290 711 292 744" />
            <path className={styles.rootLineFine} d="M270 667 C238 680 213 702 199 728" />
            <path className={styles.rootLineFine} d="M334 672 C362 687 394 706 414 732" />
            <path className={styles.rootLineFine} d="M288 696 C260 709 250 726 244 747" />
            <path className={styles.rootLineFine} d="M312 699 C337 714 349 733 354 750" />

            <path className={styles.stem} d="M292 615 C292 500 296 390 300 187 C304 390 308 500 308 615 Z" fill="url(#stemFill)" />
            <path className={styles.branch} d="M300 485 C255 452 216 429 165 414" />
            <path className={styles.branch} d="M300 485 C349 452 390 428 441 408" />
            <path className={styles.branch} d="M301 391 C258 363 226 336 184 311" />
            <path className={styles.branch} d="M301 391 C344 360 381 333 421 307" />
            <path className={styles.branch} d="M301 304 C268 278 246 248 221 220" />
            <path className={styles.branch} d="M301 304 C332 278 358 248 383 218" />

            <g className={styles.leafGroup} fill="url(#leafFill)">
              <path d="M176 411 C130 367 105 332 112 305 C149 306 185 333 207 375 C198 342 201 309 221 286 C245 316 244 355 222 397 C254 361 284 345 310 352 C298 390 251 417 196 424 Z" />
              <path d="M424 405 C469 363 494 329 487 301 C451 303 415 329 393 372 C401 337 397 307 378 282 C353 313 355 351 378 393 C345 359 315 342 290 350 C303 386 348 414 404 419 Z" />
              <path d="M194 308 C158 268 141 235 149 213 C178 215 206 239 223 275 C217 245 222 220 239 200 C258 226 254 258 237 292 C262 263 284 250 307 257 C295 287 258 310 214 316 Z" />
              <path d="M406 303 C441 265 457 232 449 210 C421 212 393 236 376 272 C382 242 376 218 359 198 C341 224 344 255 362 289 C337 261 315 248 293 255 C304 286 341 306 386 312 Z" />
              <path d="M231 218 C205 185 196 158 205 140 C229 145 249 164 260 193 C258 168 266 148 282 134 C295 156 288 182 271 207 C292 188 310 181 327 190 C311 214 279 228 246 226 Z" />
              <path d="M371 216 C397 184 405 156 396 138 C373 143 352 163 341 191 C343 166 336 146 320 132 C307 154 313 180 330 205 C309 186 292 179 275 188 C291 212 323 226 356 224 Z" />
            </g>

            <g className={styles.flowerCluster}>
              <ellipse cx="300" cy="128" rx="44" ry="74" />
              <ellipse cx="279" cy="151" rx="28" ry="46" />
              <ellipse cx="322" cy="151" rx="28" ry="46" />
              <path className={styles.pistils} d="M285 96 C269 72 259 70 248 62 M300 89 C295 58 302 49 310 39 M316 101 C335 78 348 76 359 68 M278 132 C255 118 244 119 231 112 M325 134 C346 117 358 117 371 110" />
            </g>

            <g className={styles.nodesGraphic}>
              <circle cx="300" cy="485" r="8" />
              <circle cx="300" cy="391" r="8" />
              <circle cx="300" cy="304" r="8" />
              <circle cx="300" cy="218" r="7" />
            </g>

            <rect className={styles.media} x="190" y="600" width="220" height="37" rx="18" />
          </svg>

          {visibleSections.map((section) => {
            const position = hotspotPositions[section.id];
            const isActive = selected.id === section.id;
            const routes = lessonRoutesForSystem(section.id);
            const completed = routes.filter((route) => progress.completed.includes(route)).length;
            const mastered = routes.filter((route) => mastery.lessons[route]?.mastered).length;
            const state = stateForSystem(routes.length, completed, mastered);
            return (
              <button
                key={section.id}
                type="button"
                className={`${styles.hotspot} ${progressStyles[state]} ${isActive ? styles.hotspotActive : ""}`}
                style={position}
                aria-pressed={isActive}
                aria-label={`${section.label}. ${stateLabel(state)}. ${completed} of ${routes.length} lessons complete and ${mastered} mastered.`}
                onClick={() => selectSection(section)}
              >
                <span className={styles.hotspotDot} />
                <span>{section.label}</span>
                <small className={progressStyles.hotspotStatus}>{mastered === routes.length && routes.length > 0 ? "Mastered" : `${completed}/${routes.length}`}</small>
              </button>
            );
          })}
        </div>

        <aside className={styles.infoPanel} aria-live="polite">
          <p className={styles.panelEyebrow}>Selected system</p>
          <h2>{selected.label}</h2>
          <p>{selected.summary}</p>

          <div className={progressStyles.progressCard}>
            <div className={progressStyles.progressTopline}>
              <span>Your system state</span>
              <strong>{stateLabel(selectedState)}</strong>
            </div>
            <div className={progressStyles.progressMetrics}>
              <div><b>{selectedCompleted}/{selectedRoutes.length}</b><small>lessons complete</small></div>
              <div><b>{selectedMastered}/{selectedRoutes.length}</b><small>checks mastered</small></div>
            </div>
            {selectedNextRoute ? (
              <Link className={progressStyles.continueLink} href={selectedNextRoute}>
                {selectedCompleted === selectedRoutes.length ? "Review this system" : "Continue this system"}
              </Link>
            ) : null}
          </div>

          <div className={styles.assetCallout}>
            <span>Visual focus</span>
            <strong>{selected.firstAsset}</strong>
          </div>

          <div>
            <h3>What this system covers</h3>
            <div className={styles.topicGrid}>
              {selected.topics.map((topic) => <span key={topic}>{topic}</span>)}
            </div>
          </div>

          {selected.id === "diagnostic_overlay" ? (
            <div className={styles.diagnosticRule}>
              <strong>Observation rule</strong>
              <p>{diagnosticFramework.diagnostic_rule}</p>
            </div>
          ) : null}

          <div className={styles.panelActions}>
            <Link href={sectionRoute(selected)}>Open system lessons</Link>
            {selected.id === "diagnostic_overlay" ? <Link href="/learn/atlas/practice">Open practice tools</Link> : null}
          </div>
        </aside>
      </section>

      <section className={styles.systemStrip} aria-label="Plant system index">
        {atlasSections.map((section) => {
          const routes = lessonRoutesForSystem(section.id);
          const completed = routes.filter((route) => progress.completed.includes(route)).length;
          const mastered = routes.filter((route) => mastery.lessons[route]?.mastered).length;
          const state = stateForSystem(routes.length, completed, mastered);
          return (
            <button key={section.id} type="button" onClick={() => selectSection(section)} aria-label={`${section.label}. ${stateLabel(state)}.`}>
              <span>{section.label}</span>
              <span className={progressStyles.stripMeta}>
                <small>{section.topics.length} topics</small>
                <small className={progressStyles.stripState}>{stateLabel(state)}</small>
              </span>
            </button>
          );
        })}
      </section>
    </div>
  );
}
