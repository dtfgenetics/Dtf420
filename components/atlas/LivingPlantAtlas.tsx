"use client";

import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import atlasEntities from "@/content/atlas-entities.json";
import atlasSections from "@/content/atlas-sections.json";
import learningModules from "@/content/atlas-learning-modules.json";
import diagnosticFramework from "@/content/diagnostic-framework.json";
import { AtlasInteractiveViewport, type AtlasLayer } from "@/components/atlas/AtlasInteractiveViewport";
import { useAtlasProgress } from "@/components/atlas/AtlasLearningProgress";
import { useAtlasMastery } from "@/components/atlas/AtlasMastery";
import styles from "./LivingPlantAtlas.module.css";
import referenceStyles from "./LivingPlantAtlasReference.module.css";
import conceptStyles from "./LivingPlantAtlasConcept.module.css";
import progressStyles from "./LivingPlantAtlasProgress.module.css";

type AtlasSection = (typeof atlasSections)[number];
type PanelTab = "info" | "micro" | "data" | "notes";
type SystemState = "notStarted" | "inProgress" | "complete" | "mastered";

const lessonCount = learningModules.reduce((total, module) => total + module.lessons.length, 0);

function slugify(value: string) {
  return value.toLowerCase().replaceAll("&", "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function sectionRoute(section: AtlasSection) {
  return `/learn/atlas/${section.id.replaceAll("_", "-")}`;
}

function lessonRoutesForSystem(systemId: string) {
  const atlasModule = learningModules.find((item) => item.id === systemId);
  if (!atlasModule) return [];
  return atlasModule.lessons.map((lesson) => `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`);
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
  const [layer, setLayer] = useState<AtlasLayer>("overview");
  const [selectedId, setSelectedId] = useState("trichomes_resin");
  const [panelTab, setPanelTab] = useState<PanelTab>("info");
  const [lightOn, setLightOn] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [query, setQuery] = useState("");
  const inspectorRef = useRef<HTMLElement>(null);
  const inspectorHeadingRef = useRef<HTMLHeadingElement>(null);
  const { progress } = useAtlasProgress();
  const { mastery } = useAtlasMastery();

  const selectedSection = useMemo(
    () => atlasSections.find((section) => section.id === selectedId) ?? atlasSections[0],
    [selectedId],
  );
  const selectedEntity = useMemo(
    () => atlasEntities.find((entity) => entity.id === selectedId) ?? atlasEntities[0],
    [selectedId],
  );

  const selectedRoutes = lessonRoutesForSystem(selectedId);
  const selectedCompleted = selectedRoutes.filter((route) => progress.completed.includes(route)).length;
  const selectedMastered = selectedRoutes.filter((route) => mastery.lessons[route]?.mastered).length;
  const selectedState = stateForSystem(selectedRoutes.length, selectedCompleted, selectedMastered);
  const selectedNextRoute = selectedRoutes.find((route) => !progress.completed.includes(route)) ?? selectedRoutes[0];

  function statusForEntity(id: string) {
    const routes = lessonRoutesForSystem(id);
    if (!routes.length) return "Explore";
    const completed = routes.filter((route) => progress.completed.includes(route)).length;
    const mastered = routes.filter((route) => mastery.lessons[route]?.mastered).length;
    const state = stateForSystem(routes.length, completed, mastered);
    return state === "mastered" ? "Mastered" : `${completed}/${routes.length} · ${stateLabel(state)}`;
  }

  function revealSelectedInfo() {
    window.requestAnimationFrame(() => {
      inspectorHeadingRef.current?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 980px)").matches) {
        inspectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function selectEntity(id: string) {
    setSelectedId(id);
    setPanelTab("info");
    setInspectorOpen(true);
    if (id === "environment_overlay") setLayer("environment");
    if (id === "diagnostic_overlay") setLayer("diagnostics");
    revealSelectedInfo();
  }

  function changeLayer(nextLayer: AtlasLayer) {
    setLayer(nextLayer);
    if (nextLayer === "environment") setSelectedId("environment_overlay");
    else if (nextLayer === "diagnostics") setSelectedId("diagnostic_overlay");
    else if (selectedId === "environment_overlay" || selectedId === "diagnostic_overlay") setSelectedId("leaves");
  }

  function changePanelTab(tab: PanelTab) {
    setPanelTab(tab);
    setInspectorOpen(true);
    if (tab === "micro" && selectedEntity.layers.includes("micro")) setLayer("micro");
  }

  function searchAtlas(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;
    const match = atlasEntities.find((entity) =>
      entity.label.toLowerCase().includes(normalized)
      || entity.systemLabel.toLowerCase().includes(normalized)
      || entity.microTitle.toLowerCase().includes(normalized),
    );
    if (match) selectEntity(match.id);
  }

  return (
    <div className={`${styles.atlasShell} ${lightOn ? styles.lightOn : styles.lightOff}`}>
      <section
        className={`${styles.appFrame} ${conceptStyles.appFrame} ${inspectorOpen ? referenceStyles.inspectorOpen : referenceStyles.inspectorClosed}`}
        aria-label="THC Living Plant Atlas interactive explorer"
        data-atlas-shell="premium-v2"
        data-inspector-open={inspectorOpen ? "true" : "false"}
      >
        <aside className={`${styles.leftRail} ${conceptStyles.leftRail}`}>
          <div className={styles.brandMark} aria-label="DTF Genetics Plant Atlas">
            <span aria-hidden="true">☘</span>
            <div><strong>DTF</strong><small>Genetics · Plant Atlas</small></div>
          </div>

          <div className={conceptStyles.railPromise} aria-hidden="true">
            <b>Real plants</b><b>Real science</b><b>A safer tomorrow</b>
          </div>

          <nav className={styles.primaryNav} aria-label="Atlas views">
            <button type="button" className={layer === "overview" ? styles.navActive : ""} onClick={() => changeLayer("overview")}><i>⌾</i><span>Overview</span></button>
            <button type="button" onClick={() => selectEntity("seed_germination")}><i>♧</i><span>Growth Stages</span></button>
            <button type="button" className={layer === "anatomy" ? styles.navActive : ""} onClick={() => changeLayer("anatomy")}><i>⌘</i><span>Anatomy</span></button>
            <button type="button" className={layer === "physiology" ? styles.navActive : ""} onClick={() => changeLayer("physiology")}><i>◉</i><span>Physiology</span></button>
            <button type="button" onClick={() => selectEntity("sex_pollen_seed")}><i>⌁</i><span>Genetics</span></button>
            <button type="button" className={layer === "environment" ? styles.navActive : ""} onClick={() => changeLayer("environment")}><i>☼</i><span>Environment</span></button>
            <button type="button" className={layer === "diagnostics" ? styles.navActive : ""} onClick={() => changeLayer("diagnostics")}><i>◌</i><span>Pests & Disease</span></button>
            <button type="button" onClick={() => selectEntity("nodes_branching")}><i>⌁</i><span>Cultivation</span></button>
            <button type="button" onClick={() => changePanelTab("data")}><i>▤</i><span>Glossary</span></button>
            <button type="button" onClick={() => changePanelTab("data")}><i>◇</i><span>3D Model Info</span></button>
          </nav>

          <div className={styles.railFooter}>
            <button type="button" aria-pressed={lightOn} onClick={() => setLightOn((value) => !value)}><span>☼ Lighting</span><i>{lightOn ? "On" : "Off"}</i></button>
            <Link href="/learn/atlas/dashboard"><span>◫ Study dashboard</span><i>Open</i></Link>
            <em className={conceptStyles.dreamLine}>Dream the Future</em>
          </div>
        </aside>

        <main className={`${styles.centerStage} ${conceptStyles.centerStage}`}>
          <header className={`${styles.titleBlock} ${conceptStyles.titleBlock}`}>
            <div>
              <p>Interactive cannabis anatomy</p>
              <span>Explore · Learn · Understand · Grow Better</span>
            </div>
            <form className={conceptStyles.atlasSearch} onSubmit={searchAtlas} role="search">
              <label className={conceptStyles.srOnly} htmlFor="atlas-search">Search the Atlas</label>
              <input id="atlas-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the Atlas…" autoComplete="off" />
              <button type="submit" aria-label="Search the Atlas">⌕</button>
            </form>
          </header>

          <div className={`${styles.stageReadout} ${conceptStyles.stageReadout}`} aria-hidden="true"><span>{layer} layer</span><strong>{selectedEntity.label}</strong></div>

          <AtlasInteractiveViewport
            selectedId={selectedId}
            layer={layer}
            onLayerChange={changeLayer}
            onSelect={selectEntity}
            statusForEntity={statusForEntity}
            lightOn={lightOn}
          />
        </main>

        <aside
          ref={inspectorRef}
          id="atlas-inspector"
          className={`${styles.inspector} ${conceptStyles.inspector} ${referenceStyles.inspectorShell}`}
          aria-live="polite"
          aria-label={`Learn about ${selectedEntity.label}`}
          data-atlas-inspector="responsive-sheet"
          data-inspector-open={inspectorOpen ? "true" : "false"}
        >
          <div className={styles.mobileSheetHandle} aria-hidden="true"><span /></div>
          <div className={styles.inspectorTabs} role="tablist" aria-label="Selected structure information modes">
            <button
              type="button"
              className={referenceStyles.inspectorToggle}
              aria-label={inspectorOpen ? "Collapse information panel" : "Expand information panel"}
              aria-expanded={inspectorOpen}
              onClick={() => setInspectorOpen((value) => !value)}
            >
              <i aria-hidden="true">{inspectorOpen ? "›" : "‹"}</i>
              <span aria-hidden="true">{inspectorOpen ? "Close" : "Details"}</span>
            </button>
            {(["info", "micro", "data", "notes"] as PanelTab[]).map((tab) => (
              <button key={tab} type="button" role="tab" aria-label={tab} aria-selected={panelTab === tab} className={panelTab === tab ? styles.tabActive : ""} onClick={() => changePanelTab(tab)}>
                <i aria-hidden="true">{tab === "info" ? "ⓘ" : tab === "micro" ? "⌕" : tab === "data" ? "▥" : "▤"}</i>
                <span aria-hidden="true">{tab}</span>
              </button>
            ))}
          </div>

          <div className={styles.inspectorBody}>
            <header className={styles.inspectorHeader}>
              <div>
                <p>Plant anatomy · {selectedEntity.systemLabel}</p>
                <h2 ref={inspectorHeadingRef} tabIndex={-1}>{selectedEntity.label}</h2>
                <span className={conceptStyles.inspectorSubtitle}>{selectedEntity.microTitle}</span>
                <span className={styles.inspectorState}>{stateLabel(selectedState)} · {selectedCompleted}/{selectedRoutes.length} lessons</span>
              </div>
              <button type="button" onClick={() => setInspectorOpen(false)} aria-label="Collapse information panel">×</button>
            </header>

            {panelTab === "info" ? (
              <>
                <div className={`${styles.visualCard} ${conceptStyles.visualCard}`} data-entity={selectedEntity.id}>
                  <div className={styles.visualOrb} aria-hidden="true"><span>◎</span></div>
                  <div><small>Scientific detail preview</small><strong>{selectedSection.firstAsset}</strong><span>{selectedEntity.microTitle}</span></div>
                </div>
                <p className={styles.summary}>{selectedSection.summary}</p>
                <section className={styles.panelSection}>
                  <h3>Key functions</h3>
                  <div className={styles.functionList}>{selectedEntity.keyFunctions.map((item) => <span key={item}><i>✓</i>{item}</span>)}</div>
                </section>
                <section className={`${styles.learnMore} ${conceptStyles.learnMore}`}>
                  <h3>Explore this structure</h3>
                  <button type="button" onClick={() => changeLayer("anatomy")}>Anatomy <small>Structure & cell types</small></button>
                  <button type="button" onClick={() => changeLayer("physiology")}>Physiology <small>Development & function</small></button>
                  <button type="button" onClick={() => changePanelTab("micro")}>Microscopy <small>Detailed imagery & analysis</small></button>
                  <button type="button" onClick={() => changePanelTab("data")}>Data <small>Measurements, research & references</small></button>
                  <Link href={sectionRoute(selectedSection)}>Learn more about {selectedEntity.label}</Link>
                  {selectedNextRoute ? <Link href={selectedNextRoute}>{selectedCompleted === selectedRoutes.length ? "Review next lesson" : "Continue learning"}</Link> : null}
                </section>
              </>
            ) : null}

            {panelTab === "micro" ? (
              <section className={styles.detailMode}>
                <p className={styles.modeKicker}>Microscopy layer</p>
                <h3>{selectedEntity.microTitle}</h3>
                <div className={styles.microPreview} aria-hidden="true"><span>⌕</span><b>3D tissue teaching view</b></div>
                <p>The selected structure now switches the live plant into a schematic tissue-level 3D teaching layer. It is designed to connect to microscopy and cutaway assets while preserving the same hotspot, lesson, and evidence IDs.</p>
                <Link href={sectionRoute(selectedSection)}>Open source-backed lessons</Link>
              </section>
            ) : null}

            {panelTab === "data" ? (
              <section className={styles.detailMode}>
                <p className={styles.modeKicker}>System data</p>
                <h3>{selectedEntity.dataTitle}</h3>
                <div className={progressStyles.progressCard}>
                  <div className={progressStyles.progressTopline}><span>Your system state</span><strong>{stateLabel(selectedState)}</strong></div>
                  <div className={progressStyles.progressMetrics}>
                    <div><b>{selectedCompleted}/{selectedRoutes.length}</b><small>lessons complete</small></div>
                    <div><b>{selectedMastered}/{selectedRoutes.length}</b><small>checks mastered</small></div>
                  </div>
                </div>
                <div className={styles.topicGrid}>{selectedSection.topics.map((topic) => <span key={topic}>{topic}</span>)}</div>
                {selectedId === "diagnostic_overlay" ? <div className={styles.diagnosticRule}><b>Observation rule</b><p>{diagnosticFramework.diagnostic_rule}</p></div> : null}
              </section>
            ) : null}

            {panelTab === "notes" ? (
              <section className={styles.detailMode}>
                <p className={styles.modeKicker}>Observation notebook</p>
                <h3>Record what you observe</h3>
                <p>Keep the visual atlas connected to evidence: save the structure, plant location, pattern, measurements, and next discriminating observation rather than jumping straight to a diagnosis.</p>
                <Link href="/learn/atlas/notebook">Open Atlas Notebook</Link>
                <Link href="/learn/atlas/practice">Open diagnostic practice</Link>
              </section>
            ) : null}
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
            <button key={section.id} type="button" onClick={() => selectEntity(section.id)} aria-label={`${section.label}. ${stateLabel(state)}.`}>
              <span>{atlasEntities.find((entity) => entity.id === section.id)?.label ?? section.label}</span>
              <small>{completed}/{routes.length} · {stateLabel(state)}</small>
            </button>
          );
        })}
      </section>
    </div>
  );
}
