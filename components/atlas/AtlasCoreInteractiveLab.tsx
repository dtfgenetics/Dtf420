"use client";

import { useMemo, useState } from "react";
import coreLabData from "@/content/atlas-core-interactive-labs.json";
import styles from "./AtlasCoreInteractiveLab.module.css";

type SeedStage = { id: string; label: string; visible: string; biology: string; observe: string };
type SeedLab = { title: string; principle: string; stages: SeedStage[] };
type NodeMode = { id: string; label: string; effect: string; watch: string };
type NodeLab = { title: string; principle: string; modes: NodeMode[] };
type LeafPattern = { id: string; label: string; description: string; firstChecks: string[] };
type LeafLab = { title: string; principle: string; patterns: LeafPattern[] };
type EnvironmentFactor = { id: string; label: string; connections: string[]; summary: string };
type EnvironmentLab = { title: string; principle: string; factors: EnvironmentFactor[] };
type DiagnosticLab = { title: string; principle: string; locations: string[]; patterns: string[]; speeds: string[]; context: string[] };
type CoreLabs = {
  seed_germination: SeedLab;
  nodes_branching: NodeLab;
  leaves: LeafLab;
  environment_overlay: EnvironmentLab;
  diagnostic_overlay: DiagnosticLab;
};

const labs = coreLabData as CoreLabs;

function LabHeader({ title, principle }: { title: string; principle: string }) {
  return (
    <header className={styles.header}>
      <div><p>Interactive visual lab</p><h2>{title}</h2></div>
      <span>observe before you conclude</span>
      <div className={styles.principle}>{principle}</div>
    </header>
  );
}

function SeedVisual({ stageIndex }: { stageIndex: number }) {
  const radicle = stageIndex >= 3;
  const emerging = stageIndex >= 4;
  const cotyledons = stageIndex >= 5;
  return (
    <svg className={styles.svg} viewBox="0 0 520 410" role="img" aria-label="Seed germination stage diagram">
      <rect x="35" y="238" width="450" height="135" rx="24" className={styles.soil} />
      <g transform={`translate(260 ${stageIndex < 4 ? 205 : 188})`}>
        <ellipse rx={stageIndex >= 1 ? 67 : 59} ry={stageIndex >= 1 ? 43 : 37} className={styles.seedCoat} />
        <path d="M-32 -5 C-10 -25 12 -24 34 3 C17 25 -8 28 -31 8 Z" className={styles.embryo} />
        {stageIndex >= 2 ? <path d="M48 -23 C61 -8 64 8 55 22" className={styles.splitLine} /> : null}
        {radicle ? <path d="M28 20 C33 57 23 90 10 128 C2 151 -1 173 -2 197" className={styles.radicle} /> : null}
        {emerging ? <path d="M-18 -21 C-24 -58 -14 -89 4 -119 C15 -136 22 -157 20 -177" className={styles.hypocotyl} /> : null}
        {cotyledons ? <g className={styles.cotyledons}><ellipse cx="-10" cy="-188" rx="38" ry="17" transform="rotate(-24 -10 -188)" /><ellipse cx="48" cy="-188" rx="38" ry="17" transform="rotate(24 48 -188)" /><path d="M19 -170 L19 -220" /></g> : null}
      </g>
      <text x="260" y="398" textAnchor="middle" className={styles.caption}>hydration → embryo growth → radicle → emergence → photosynthetic seedling</text>
    </svg>
  );
}

function SeedLabView({ lab }: { lab: SeedLab }) {
  const [stageIndex, setStageIndex] = useState(0);
  const stage = lab.stages[stageIndex];
  return (
    <section className={styles.shell}>
      <LabHeader title={lab.title} principle={lab.principle} />
      <div className={styles.grid}>
        <div className={styles.visual}><SeedVisual stageIndex={stageIndex} /></div>
        <div className={styles.panel}>
          <span className={styles.kicker}>Developmental stage</span>
          <input className={styles.slider} type="range" min="0" max={lab.stages.length - 1} value={stageIndex} onChange={(event) => setStageIndex(Number(event.target.value))} />
          <div className={styles.stepRow}>{lab.stages.map((item, index) => <button key={item.id} type="button" className={index === stageIndex ? styles.active : ""} onClick={() => setStageIndex(index)}>{index + 1}</button>)}</div>
          <h3>{stage.label}</h3>
          <div className={styles.infoBlock}><b>Visible</b><p>{stage.visible}</p></div>
          <div className={styles.infoBlock}><b>Biology</b><p>{stage.biology}</p></div>
          <div className={styles.watch}><b>Observe</b><span>{stage.observe}</span></div>
        </div>
      </div>
    </section>
  );
}

function ArchitectureVisual({ mode }: { mode: string }) {
  const topped = mode === "topping";
  const lst = mode === "lst";
  const scrog = mode === "scrog";
  return (
    <svg className={styles.svg} viewBox="0 0 520 430" role="img" aria-label={`${mode} canopy architecture diagram`}>
      {scrog ? <g className={styles.screen}>{[135,190,245,300,355].map((y) => <path key={`h${y}`} d={`M70 ${y} L450 ${y}`} />)}{[105,170,235,300,365,430].map((x) => <path key={`v${x}`} d={`M${x} 120 L${x} 385`} />)}</g> : null}
      <g className={styles.architecture} transform={lst ? "rotate(18 260 355)" : undefined}>
        <path d="M260 390 C260 310 260 225 260 105" />
        <path d="M260 310 C220 286 187 270 140 259" />
        <path d="M260 310 C300 286 333 269 380 258" />
        <path d="M260 245 C224 220 197 200 160 182" />
        <path d="M260 245 C296 219 323 199 360 181" />
        <path d="M260 180 C235 158 214 140 191 124" />
        <path d="M260 180 C286 157 307 139 331 123" />
        {!topped ? <path d="M260 105 L260 61" /> : null}
        {topped ? <path d="M249 104 L271 104" className={styles.cutMark} /> : null}
      </g>
      {lst ? <path d="M265 122 C324 123 371 133 418 162" className={styles.tieLine} /> : null}
      <text x="260" y="412" textAnchor="middle" className={styles.caption}>{mode === "natural" ? "main apex remains intact" : mode === "topping" ? "apex removed; lateral competition changes" : mode === "lst" ? "shoot orientation changes without removing apex" : "shoots distributed across a horizontal screen"}</text>
    </svg>
  );
}

function NodeLabView({ lab }: { lab: NodeLab }) {
  const [modeId, setModeId] = useState(lab.modes[0].id);
  const mode = lab.modes.find((item) => item.id === modeId) ?? lab.modes[0];
  return (
    <section className={styles.shell}>
      <LabHeader title={lab.title} principle={lab.principle} />
      <div className={styles.grid}>
        <div className={styles.visual}><ArchitectureVisual mode={mode.id} /></div>
        <div className={styles.panel}>
          <span className={styles.kicker}>Architecture mode</span>
          <div className={styles.tabs}>{lab.modes.map((item) => <button key={item.id} type="button" className={item.id === mode.id ? styles.active : ""} onClick={() => setModeId(item.id)}>{item.label}</button>)}</div>
          <h3>{mode.label}</h3>
          <p>{mode.effect}</p>
          <div className={styles.watch}><b>Watch for</b><span>{mode.watch}</span></div>
          <div className={styles.rule}><b>Training principle</b><span>Judge the resulting light distribution, airflow, recovery, and branch structure—not the technique name by itself.</span></div>
        </div>
      </div>
    </section>
  );
}

function LeafPatternVisual({ patternId }: { patternId: string }) {
  return (
    <svg className={styles.svg} viewBox="0 0 520 430" role="img" aria-label={`${patternId} leaf pattern diagram`}>
      <g className={styles.leafGraphic}>
        <path d="M260 370 C242 318 213 283 171 259 C205 256 231 264 250 281 C239 232 242 186 260 131 C279 185 282 232 270 281 C291 263 316 255 349 258 C309 284 280 320 260 370 Z" />
        <path d="M260 344 C205 321 157 292 116 248 C161 252 198 268 229 297 C192 250 169 203 163 154 C207 178 238 214 260 267 C282 214 313 178 357 154 C351 204 328 251 291 298 C323 269 360 252 405 248 C363 292 315 321 260 344 Z" />
        <path d="M260 365 L260 142" className={styles.midVein} />
        <path d="M260 316 L178 267 M260 316 L342 267 M260 272 L202 215 M260 272 L318 215" className={styles.veins} />
      </g>
      {patternId === "interveinal" ? <g className={styles.chlorosis}><path d="M207 270 C225 252 244 249 258 266 C244 292 224 302 205 291 Z" /><path d="M313 270 C295 252 276 249 262 266 C277 292 296 302 315 291 Z" /><path d="M224 222 C238 210 251 210 260 223 C249 242 235 247 221 239 Z" /></g> : null}
      {patternId === "marginal" ? <path d="M116 248 C159 252 197 269 229 297 M405 248 C363 292 315 321 260 344" className={styles.necrosisLine} /> : null}
      {patternId === "tip" ? <g className={styles.tipMarks}><circle cx="116" cy="248" r="10" /><circle cx="405" cy="248" r="10" /><circle cx="163" cy="154" r="9" /><circle cx="357" cy="154" r="9" /></g> : null}
      {patternId === "posture" ? <path d="M150 270 Q260 365 370 270" className={styles.postureArc} /> : null}
      {patternId === "stippling" ? <g className={styles.stippling}>{[[180,245],[205,277],[231,235],[288,247],[320,278],[348,238],[260,302],[297,207],[223,197]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="6" />)}</g> : null}
      <text x="260" y="410" textAnchor="middle" className={styles.caption}>describe location + pattern + progression before naming a cause</text>
    </svg>
  );
}

function LeafLabView({ lab }: { lab: LeafLab }) {
  const [patternId, setPatternId] = useState(lab.patterns[0].id);
  const pattern = lab.patterns.find((item) => item.id === patternId) ?? lab.patterns[0];
  return (
    <section className={styles.shell}>
      <LabHeader title={lab.title} principle={lab.principle} />
      <div className={styles.grid}>
        <div className={styles.visual}><LeafPatternVisual patternId={pattern.id} /></div>
        <div className={styles.panel}>
          <span className={styles.kicker}>Pattern library</span>
          <div className={styles.tabs}>{lab.patterns.map((item) => <button key={item.id} type="button" className={item.id === pattern.id ? styles.active : ""} onClick={() => setPatternId(item.id)}>{item.label}</button>)}</div>
          <h3>{pattern.label}</h3>
          <p>{pattern.description}</p>
          <div className={styles.checks}>{pattern.firstChecks.map((item, index) => <span key={item}><b>{index + 1}</b>{item}</span>)}</div>
        </div>
      </div>
    </section>
  );
}

const environmentPositions: Record<string, [number, number]> = {
  light: [50, 12], leaf_temperature: [34, 32], rh: [77, 29], vpd: [62, 45], airflow: [18, 51], water: [36, 79], co2: [83, 58], ec: [68, 82]
};

function EnvironmentLabView({ lab }: { lab: EnvironmentLab }) {
  const [factorId, setFactorId] = useState("vpd");
  const factor = lab.factors.find((item) => item.id === factorId) ?? lab.factors[0];
  return (
    <section className={styles.shell}>
      <LabHeader title={lab.title} principle={lab.principle} />
      <div className={styles.grid}>
        <div className={`${styles.visual} ${styles.network}`}>
          <div className={styles.networkPlant}><i /><i /><i /><i /><b /></div>
          {lab.factors.map((item) => {
            const [x, y] = environmentPositions[item.id] ?? [50, 50];
            const connected = factor.connections.includes(item.id) || item.id === factor.id;
            return <button key={item.id} type="button" className={`${styles.networkNode} ${item.id === factor.id ? styles.networkActive : ""} ${connected ? styles.networkConnected : ""}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => setFactorId(item.id)}>{item.label}</button>;
          })}
        </div>
        <div className={styles.panel}>
          <span className={styles.kicker}>Select one variable</span>
          <h3>{factor.label}</h3>
          <p>{factor.summary}</p>
          <div className={styles.connections}><b>Directly connect the interpretation to</b>{factor.connections.map((id) => <span key={id}>{lab.factors.find((item) => item.id === id)?.label ?? id}</span>)}</div>
          <div className={styles.rule}><b>System rule</b><span>A change that improves one number can still worsen plant response if the connected variables cannot support it.</span></div>
        </div>
      </div>
    </section>
  );
}

function DiagnosticLabView({ lab }: { lab: DiagnosticLab }) {
  const [location, setLocation] = useState(lab.locations[0]);
  const [pattern, setPattern] = useState(lab.patterns[0]);
  const [speed, setSpeed] = useState(lab.speeds[0]);
  const [context, setContext] = useState(lab.context[1]);

  const nextEvidence = useMemo(() => {
    const items = new Set<string>(["photograph the same marked tissue again", "record temperature, RH, and recent environmental changes"]);
    if (pattern.includes("yellowing") || pattern.includes("tip") || pattern.includes("margin")) items.add("check root-zone pH and EC using a consistent method");
    if (pattern.includes("spots") || pattern.includes("pest")) items.add("inspect leaf undersides and nodes with magnification");
    if (pattern.includes("curl") || pattern.includes("wilting")) items.add("compare media moisture, leaf temperature, airflow, and VPD context");
    if (context.includes("wet")) items.add("inspect root health and root-zone aeration");
    if (context.includes("dry")) items.add("check irrigation timing and whether the root ball is drying uniformly");
    if (location.includes("newest")) items.add("compare newest tissue with mature leaves before assuming a mobile-nutrient pattern");
    if (location.includes("older")) items.add("compare progression from the oldest affected leaves toward newer growth");
    return Array.from(items);
  }, [context, location, pattern]);

  const groups = [
    { label: "Location", value: location, setValue: setLocation, choices: lab.locations },
    { label: "Pattern", value: pattern, setValue: setPattern, choices: lab.patterns },
    { label: "Progression", value: speed, setValue: setSpeed, choices: lab.speeds },
    { label: "Moisture context", value: context, setValue: setContext, choices: lab.context }
  ];

  return (
    <section className={styles.shell}>
      <LabHeader title={lab.title} principle={lab.principle} />
      <div className={styles.diagnosticGrid}>
        <div className={styles.diagnosticInputs}>
          {groups.map((group) => <div key={group.label}><b>{group.label}</b><div>{group.choices.map((choice) => <button key={choice} type="button" className={choice === group.value ? styles.active : ""} onClick={() => group.setValue(choice)}>{choice}</button>)}</div></div>)}
        </div>
        <aside className={styles.evidenceCard}>
          <span className={styles.kicker}>Evidence profile</span>
          <h3>What you actually know</h3>
          <dl><div><dt>Location</dt><dd>{location}</dd></div><div><dt>Pattern</dt><dd>{pattern}</dd></div><div><dt>Progression</dt><dd>{speed}</dd></div><div><dt>Moisture</dt><dd>{context}</dd></div></dl>
          <div className={styles.nextEvidence}><b>Collect next</b>{nextEvidence.map((item) => <span key={item}>{item}</span>)}</div>
          <div className={styles.rule}><b>No diagnosis yet</b><span>This tool organizes evidence. The next step is to compare plausible causes and choose observations or measurements that can separate them.</span></div>
        </aside>
      </div>
    </section>
  );
}

export function AtlasCoreInteractiveLab({ systemId }: { systemId: string }) {
  if (systemId === "seed_germination") return <SeedLabView lab={labs.seed_germination} />;
  if (systemId === "nodes_branching") return <NodeLabView lab={labs.nodes_branching} />;
  if (systemId === "leaves") return <LeafLabView lab={labs.leaves} />;
  if (systemId === "environment_overlay") return <EnvironmentLabView lab={labs.environment_overlay} />;
  if (systemId === "diagnostic_overlay") return <DiagnosticLabView lab={labs.diagnostic_overlay} />;
  return null;
}
