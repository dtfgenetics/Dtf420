"use client";

import { useMemo, useState } from "react";
import labData from "@/content/atlas-interactive-labs.json";
import styles from "./AtlasInteractiveLab.module.css";

type RootState = { id: string; label: string; effect: string };
type RootControl = { id: string; label: string; states: RootState[] };
type RootLab = {
  kind: "root-zone";
  title: string;
  principle: string;
  controls: RootControl[];
  observe: string[];
};

type TransportChannel = {
  id: string;
  label: string;
  direction: string;
  cargo: string;
  driver: string;
  note: string;
};
type TransportLab = {
  kind: "transport";
  title: string;
  principle: string;
  channels: TransportChannel[];
  observe: string[];
};

type FlowerStage = { id: string; label: string; visible: string; biology: string };
type FlowerLab = {
  kind: "flower-development";
  title: string;
  principle: string;
  stages: FlowerStage[];
  observe: string[];
};

type TrichomeType = { id: string; label: string; scale: string; structure: string };
type TrichomeAppearance = { id: string; label: string; meaning: string };
type MicroscopeLab = {
  kind: "microscope";
  title: string;
  principle: string;
  types: TrichomeType[];
  appearance: TrichomeAppearance[];
  observe: string[];
};

type ReproductiveStructure = {
  id: string;
  label: string;
  features: string[];
  note: string;
};
type ReproductiveLab = {
  kind: "reproductive";
  title: string;
  principle: string;
  structures: ReproductiveStructure[];
  observe: string[];
};

type InteractiveLab = RootLab | TransportLab | FlowerLab | MicroscopeLab | ReproductiveLab;
type LabMap = Record<string, InteractiveLab>;

const labs = labData as LabMap;

function ObservePanel({ items }: { items: string[] }) {
  return (
    <div className={styles.observePanel}>
      <span>Pair the visual with these observations</span>
      <div>
        {items.map((item) => <small key={item}>{item}</small>)}
      </div>
    </div>
  );
}

function RootZoneVisual({ controlId, stateId }: { controlId: string; stateId: string }) {
  const saturated = controlId === "water" && stateId === "saturated";
  const dry = controlId === "water" && stateId === "dry";
  const lowOxygen = controlId === "oxygen" && stateId === "low";
  const higherEc = controlId === "ec" && stateId === "higher";

  return (
    <svg viewBox="0 0 520 420" className={styles.labSvg} role="img" aria-label="Root-zone interaction diagram">
      <defs>
        <linearGradient id="rootMedia" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dry ? "#9a7852" : saturated ? "#405f63" : "#665743"} />
          <stop offset="1" stopColor={saturated ? "#294c54" : "#3d342b"} />
        </linearGradient>
      </defs>
      <rect x="45" y="92" width="430" height="280" rx="28" fill="url(#rootMedia)" />
      <rect x="45" y="92" width="430" height="52" rx="26" className={styles.mediaTop} />
      <path d="M260 28 C260 80 258 116 260 168" className={styles.plantStem} />
      <path d="M260 154 C230 185 210 218 198 264 C186 307 172 335 151 360" className={styles.rootPrimary} />
      <path d="M260 154 C288 185 307 220 321 264 C335 306 351 338 375 360" className={styles.rootPrimary} />
      <path d="M230 204 C198 211 172 227 148 250" className={styles.rootFine} />
      <path d="M290 205 C322 214 346 230 370 252" className={styles.rootFine} />
      <path d="M207 263 C176 275 154 294 134 320" className={styles.rootFine} />
      <path d="M314 266 C347 278 371 299 390 328" className={styles.rootFine} />
      <g className={styles.rootTips}>
        <circle cx="149" cy="360" r="6" />
        <circle cx="376" cy="360" r="6" />
        <circle cx="134" cy="320" r="5" />
        <circle cx="390" cy="328" r="5" />
      </g>
      {saturated ? (
        <g className={styles.waterLayer}>
          <path d="M70 176 Q120 158 170 176 T270 176 T370 176 T450 176 L450 350 L70 350 Z" />
          <text x="82" y="205">air-filled pore space decreases</text>
        </g>
      ) : null}
      {dry ? <text className={styles.diagramLabel} x="70" y="200">less available water around roots</text> : null}
      {lowOxygen ? <text className={styles.warningLabel} x="70" y="198">oxygen diffusion constrained</text> : null}
      {higherEc ? (
        <g className={styles.ionField}>
          {[110, 155, 205, 315, 365, 415].map((x, index) => <circle key={x} cx={x} cy={210 + (index % 2) * 70} r="8" />)}
          <text x="72" y="338">higher dissolved-ion concentration</text>
        </g>
      ) : null}
      <text className={styles.diagramCaption} x="260" y="402" textAnchor="middle">Root response reflects the combined root-zone environment</text>
    </svg>
  );
}

function RootZoneLab({ lab }: { lab: RootLab }) {
  const [controlId, setControlId] = useState(lab.controls[0].id);
  const control = useMemo(() => lab.controls.find((item) => item.id === controlId) ?? lab.controls[0], [controlId, lab.controls]);
  const [stateByControl, setStateByControl] = useState<Record<string, string>>(() =>
    Object.fromEntries(lab.controls.map((item) => [item.id, item.states[Math.min(1, item.states.length - 1)].id])),
  );
  const stateId = stateByControl[control.id] ?? control.states[0].id;
  const selectedState = control.states.find((state) => state.id === stateId) ?? control.states[0];

  return (
    <div className={styles.labGrid}>
      <div className={styles.visualCard}>
        <RootZoneVisual controlId={control.id} stateId={selectedState.id} />
      </div>
      <div className={styles.controlCard}>
        <span className={styles.kicker}>Change one variable, then read the interaction</span>
        <div className={styles.controlTabs}>
          {lab.controls.map((item) => (
            <button key={item.id} type="button" className={item.id === control.id ? styles.activeControl : ""} onClick={() => setControlId(item.id)}>{item.label}</button>
          ))}
        </div>
        <h3>{control.label}</h3>
        <div className={styles.segmented}>
          {control.states.map((state) => (
            <button key={state.id} type="button" className={state.id === selectedState.id ? styles.selectedSegment : ""} onClick={() => setStateByControl((current) => ({ ...current, [control.id]: state.id }))}>{state.label}</button>
          ))}
        </div>
        <p>{selectedState.effect}</p>
        <div className={styles.ruleBox}><b>Interpret together</b><span>Water, oxygen, EC, pH, temperature, and media structure interact. Do not use this control as a standalone diagnosis.</span></div>
      </div>
    </div>
  );
}

function TransportLabView({ lab }: { lab: TransportLab }) {
  const [channelId, setChannelId] = useState(lab.channels[0].id);
  const channel = lab.channels.find((item) => item.id === channelId) ?? lab.channels[0];

  return (
    <div className={styles.labGrid}>
      <div className={styles.visualCard}>
        <svg viewBox="0 0 520 420" className={styles.labSvg} role="img" aria-label={`${channel.label} transport diagram`}>
          <rect x="222" y="58" width="76" height="300" rx="36" className={styles.stemBody} />
          <path d="M246 338 L246 84" className={`${styles.transportPath} ${channel.id === "xylem" ? styles.xylemPath : styles.mutedPath}`} />
          <path d="M276 90 L276 338" className={`${styles.transportPath} ${channel.id === "phloem" ? styles.phloemPath : styles.mutedPath}`} />
          <g className={styles.transportLeaf}><path d="M222 155 C160 112 109 123 82 162 C123 195 172 194 222 170 Z" /><path d="M298 224 C356 190 410 202 440 241 C398 272 350 266 298 242 Z" /></g>
          <g className={styles.transportRoot}><path d="M252 356 C228 372 210 387 197 410" /><path d="M270 356 C294 372 311 387 325 410" /></g>
          <text x="112" y="112" className={styles.diagramLabel}>source / transpiring leaf</text>
          <text x="302" y="385" className={styles.diagramLabel}>root + sink tissues</text>
          <text x="260" y="36" textAnchor="middle" className={styles.diagramCaption}>{channel.direction}</text>
        </svg>
      </div>
      <div className={styles.controlCard}>
        <span className={styles.kicker}>Toggle transport tissue</span>
        <div className={styles.bigToggle}>
          {lab.channels.map((item) => <button key={item.id} type="button" className={item.id === channel.id ? styles.selectedSegment : ""} onClick={() => setChannelId(item.id)}>{item.label}</button>)}
        </div>
        <h3>{channel.label}</h3>
        <dl className={styles.factList}>
          <div><dt>Typical direction</dt><dd>{channel.direction}</dd></div>
          <div><dt>Main cargo</dt><dd>{channel.cargo}</dd></div>
          <div><dt>Primary driver</dt><dd>{channel.driver}</dd></div>
        </dl>
        <p>{channel.note}</p>
      </div>
    </div>
  );
}

function FlowerLabView({ lab }: { lab: FlowerLab }) {
  const [stageIndex, setStageIndex] = useState(0);
  const stage = lab.stages[stageIndex];
  const density = 1 + stageIndex * 0.22;

  return (
    <div className={styles.labGrid}>
      <div className={styles.visualCard}>
        <svg viewBox="0 0 520 420" className={styles.labSvg} role="img" aria-label={`${stage.label} flower development diagram`}>
          <path d="M260 385 C260 300 258 215 260 104" className={styles.flowerStem} />
          <g className={styles.flowerNodes}>
            {[128, 177, 228, 279].map((y, index) => (
              <g key={y} transform={`translate(260 ${y}) scale(${density - index * 0.04})`}>
                <ellipse cx="-20" cy="0" rx="18" ry="26" />
                <ellipse cx="20" cy="0" rx="18" ry="26" />
                <ellipse cx="0" cy="-12" rx="19" ry="29" />
                {stageIndex >= 1 ? <path d="M-10 -18 C-25 -40 -28 -55 -34 -70 M8 -17 C22 -41 28 -54 34 -68" className={styles.stigmaLines} /> : null}
                {stageIndex >= 2 ? <g className={styles.trichomeDots}><circle cx="-15" cy="-10" r="3" /><circle cx="13" cy="-17" r="3" /><circle cx="2" cy="5" r="3" /></g> : null}
              </g>
            ))}
          </g>
          <text x="260" y="48" textAnchor="middle" className={styles.diagramCaption}>{stage.label}</text>
        </svg>
      </div>
      <div className={styles.controlCard}>
        <span className={styles.kicker}>Scrub development by structure, not calendar week</span>
        <input className={styles.stageSlider} type="range" min="0" max={lab.stages.length - 1} value={stageIndex} onChange={(event) => setStageIndex(Number(event.target.value))} aria-label="Flower development stage" />
        <div className={styles.stageTicks}>{lab.stages.map((item, index) => <button key={item.id} type="button" className={index === stageIndex ? styles.activeTick : ""} onClick={() => setStageIndex(index)}>{index + 1}</button>)}</div>
        <h3>{stage.label}</h3>
        <div className={styles.dualFacts}>
          <div><b>What you can see</b><p>{stage.visible}</p></div>
          <div><b>What is happening</b><p>{stage.biology}</p></div>
        </div>
      </div>
    </div>
  );
}

function MicroscopeLabView({ lab }: { lab: MicroscopeLab }) {
  const [typeId, setTypeId] = useState(lab.types[2]?.id ?? lab.types[0].id);
  const [appearanceId, setAppearanceId] = useState(lab.appearance[1]?.id ?? lab.appearance[0].id);
  const selectedType = lab.types.find((item) => item.id === typeId) ?? lab.types[0];
  const appearance = lab.appearance.find((item) => item.id === appearanceId) ?? lab.appearance[0];

  return (
    <div className={styles.labGrid}>
      <div className={`${styles.visualCard} ${styles.microscopeCard}`}>
        <div className={styles.scopeCircle} data-appearance={appearance.id}>
          <svg viewBox="0 0 360 360" className={styles.scopeSvg} role="img" aria-label={`${selectedType.label}, ${appearance.label} appearance`}>
            <g className={styles.scopeField}>
              {[72, 144, 222, 288].map((x, index) => <circle key={x} cx={x} cy={82 + (index % 2) * 130} r="26" opacity="0.08" />)}
            </g>
            <g className={styles.trichomeDrawing}>
              <path d="M180 305 C177 246 178 196 180 136" />
              {selectedType.id === "capitate-stalked" ? <><rect x="169" y="120" width="22" height="92" rx="10" /><circle cx="180" cy="99" r="45" /></> : null}
              {selectedType.id === "capitate-sessile" ? <><rect x="173" y="181" width="14" height="30" rx="7" /><circle cx="180" cy="157" r="34" /></> : null}
              {selectedType.id === "bulbous" ? <><rect x="176" y="197" width="8" height="18" rx="4" /><circle cx="180" cy="181" r="19" /></> : null}
            </g>
          </svg>
        </div>
      </div>
      <div className={styles.controlCard}>
        <span className={styles.kicker}>Virtual microscope</span>
        <h3>{selectedType.label}</h3>
        <div className={styles.controlLabel}>Trichome type</div>
        <div className={styles.segmented}>{lab.types.map((item) => <button key={item.id} type="button" className={item.id === selectedType.id ? styles.selectedSegment : ""} onClick={() => setTypeId(item.id)}>{item.label}</button>)}</div>
        <p><b>{selectedType.scale}:</b> {selectedType.structure}</p>
        <div className={styles.controlLabel}>Gland-head appearance</div>
        <div className={styles.segmented}>{lab.appearance.map((item) => <button key={item.id} type="button" className={item.id === appearance.id ? styles.selectedSegment : ""} onClick={() => setAppearanceId(item.id)}>{item.label}</button>)}</div>
        <p>{appearance.meaning}</p>
        <div className={styles.ruleBox}><b>Microscope rule</b><span>Compare representative trichomes on flower bracts. Apparent color alone is not a laboratory potency measurement.</span></div>
      </div>
    </div>
  );
}

function ReproductiveLabView({ lab }: { lab: ReproductiveLab }) {
  const [structureId, setStructureId] = useState(lab.structures[0].id);
  const structure = lab.structures.find((item) => item.id === structureId) ?? lab.structures[0];

  return (
    <div className={styles.labGrid}>
      <div className={styles.visualCard}>
        <svg viewBox="0 0 520 420" className={styles.labSvg} role="img" aria-label={`${structure.label} reproductive structure diagram`}>
          <path d="M260 385 L260 88" className={styles.flowerStem} />
          <path d="M260 180 C218 160 181 150 135 151 M260 230 C306 211 342 201 388 202" className={styles.branchLines} />
          {structure.id === "female" ? <g className={styles.femaleStructure}><ellipse cx="260" cy="135" rx="48" ry="62" /><path d="M244 116 C222 84 220 62 212 42 M275 115 C298 84 302 61 310 42" /></g> : null}
          {structure.id === "male" ? <g className={styles.maleStructure}>{[220, 252, 286, 321].map((x, index) => <g key={x}><path d={`M260 134 Q${x} 112 ${x} ${88 + index * 8}`} /><ellipse cx={x} cy={80 + index * 8} rx="17" ry="23" /></g>)}</g> : null}
          {structure.id === "intersex" ? <g><g className={styles.femaleStructure}><ellipse cx="260" cy="139" rx="50" ry="64" /><path d="M240 114 C220 86 220 64 213 44 M280 114 C300 86 301 64 309 44" /></g><path d="M266 141 C284 118 289 98 286 78" className={styles.antherLine} /></g> : null}
          {structure.id === "seed" ? <g className={styles.seedStructure}><ellipse cx="260" cy="164" rx="78" ry="110" /><ellipse cx="260" cy="164" rx="51" ry="76" /><path d="M244 205 C231 164 235 124 264 96 C287 127 289 170 272 207" /></g> : null}
          <text x="260" y="405" textAnchor="middle" className={styles.diagramCaption}>{structure.label}</text>
        </svg>
      </div>
      <div className={styles.controlCard}>
        <span className={styles.kicker}>Compare reproductive structures</span>
        <div className={styles.segmented}>{lab.structures.map((item) => <button key={item.id} type="button" className={item.id === structure.id ? styles.selectedSegment : ""} onClick={() => setStructureId(item.id)}>{item.label}</button>)}</div>
        <h3>{structure.label}</h3>
        <ul className={styles.featureList}>{structure.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
        <p>{structure.note}</p>
      </div>
    </div>
  );
}

export function AtlasInteractiveLab({ systemId }: { systemId: string }) {
  const lab = labs[systemId];
  if (!lab) return null;

  return (
    <section className={styles.labShell} aria-labelledby={`interactive-${systemId}`}>
      <header className={styles.labHeader}>
        <div>
          <p>Interactive visual lab</p>
          <h2 id={`interactive-${systemId}`}>{lab.title}</h2>
        </div>
        <span>change → observe → interpret</span>
      </header>
      <p className={styles.principle}>{lab.principle}</p>

      {lab.kind === "root-zone" ? <RootZoneLab lab={lab} /> : null}
      {lab.kind === "transport" ? <TransportLabView lab={lab} /> : null}
      {lab.kind === "flower-development" ? <FlowerLabView lab={lab} /> : null}
      {lab.kind === "microscope" ? <MicroscopeLabView lab={lab} /> : null}
      {lab.kind === "reproductive" ? <ReproductiveLabView lab={lab} /> : null}

      <ObservePanel items={lab.observe} />
    </section>
  );
}
