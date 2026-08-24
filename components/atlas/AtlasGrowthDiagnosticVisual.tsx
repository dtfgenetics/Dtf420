"use client";

import { useState } from "react";
import styles from "./AtlasConceptVisual.module.css";

type Point = {
  id: string;
  label: string;
  detail: string;
};

type Spec = {
  title: string;
  subtitle: string;
  points: Point[];
};

const specs: Record<string, Spec> = {
  "atlas-cotyledon-transition-v1": {
    title: "Cotyledon transition",
    subtitle: "Seed reserves support emergence before true leaves take over photosynthetic work",
    points: [
      { id: "shell", label: "Shell release", detail: "The emerging seedling sheds or escapes the seed coat as the hypocotyl and cotyledons expand." },
      { id: "cotyledon", label: "Cotyledons", detail: "Embryonic leaves expand and provide stored reserves while beginning limited photosynthetic activity." },
      { id: "hypocotyl", label: "Hypocotyl", detail: "The embryonic axis lifts the cotyledons and reorients the seedling above the substrate." },
      { id: "true", label: "First true leaves", detail: "The first serrated true leaves expand and increasingly become the main photosynthetic surface." },
      { id: "handoff", label: "Developmental handoff", detail: "Cotyledons may senesce later; their decline should be interpreted in developmental context rather than automatically labeled a deficiency." },
    ],
  },
  "atlas-root-stress-v1": {
    title: "Root stress patterns",
    subtitle: "Different root-zone stresses can converge on similar above-ground symptoms",
    points: [
      { id: "healthy", label: "Healthy context", detail: "Healthy active roots usually show firm tissue, branching and living tips, but color varies with media and age." },
      { id: "oxygen", label: "Low oxygen", detail: "Persistent saturation or poor gas exchange can impair root respiration and predispose tissues to decline." },
      { id: "dry", label: "Excessive dryback", detail: "Severe or repeated water deficits can reduce root activity, damage fine roots and limit transport." },
      { id: "salt", label: "High ionic concentration", detail: "Elevated root-zone solute concentration can reduce water uptake and alter ion relationships even when media appears moist." },
      { id: "temperature", label: "Temperature stress", detail: "Root-zone temperatures outside a favorable range alter metabolism, membrane function and dissolved-gas conditions." },
    ],
  },
  "atlas-internode-v1": {
    title: "Internodal spacing",
    subtitle: "Spacing reflects genetics, developmental stage, light, temperature and growth rate together",
    points: [
      { id: "node", label: "Nodes", detail: "Internode length is measured between successive nodes, so comparisons should use equivalent developmental positions." },
      { id: "compact", label: "Compact spacing", detail: "Shorter internodes can result from genetics or environmental conditions and are not automatically a sign of ideal growth." },
      { id: "extended", label: "Extended spacing", detail: "Longer internodes can occur with genetics, developmental stretch, lower local light or other interacting conditions." },
      { id: "light", label: "Light context", detail: "Light intensity, spectrum and canopy competition influence extension growth alongside temperature and hormonal signals." },
      { id: "compare", label: "Compare like with like", detail: "Use the same cultivar, stage and stem region when evaluating changes over time." },
    ],
  },
  "atlas-topping-fim-v1": {
    title: "Topping & FIM",
    subtitle: "Different removal points alter which meristems remain available for subsequent growth",
    points: [
      { id: "apex", label: "Shoot apex", detail: "The intact apical meristem maintains the primary growing tip and influences lateral bud behavior." },
      { id: "top", label: "Topping cut", detail: "A clean topping cut removes the primary apex above a chosen node, leaving lower axillary shoots to continue growth." },
      { id: "fim", label: "Partial apex removal", detail: "FIM-style cuts remove part of the shoot-tip region and can produce variable outcomes because the remaining meristematic tissue differs." },
      { id: "response", label: "Branch response", detail: "Resulting shoot number and vigor depend on cut position, plant condition, genetics and recovery." },
      { id: "recovery", label: "Recovery window", detail: "Training is a wound and architecture change; evaluate recovery before stacking additional stress." },
    ],
  },
  "atlas-lst-v1": {
    title: "LST & directional growth",
    subtitle: "Repositioning shoots changes height, orientation and light exposure without intentionally severing the stem",
    points: [
      { id: "bend", label: "Gentle bend", detail: "Low-stress training changes shoot orientation while preserving vascular continuity." },
      { id: "tie", label: "Anchor point", detail: "Soft ties or supports should guide direction without constricting enlarging stems." },
      { id: "light", label: "Light redistribution", detail: "Lower or lateral shoots may receive more direct light after the dominant tip is repositioned." },
      { id: "turn", label: "Reorientation", detail: "Growing tips bend back toward favorable light and gravity cues after repositioning." },
      { id: "canopy", label: "Canopy outcome", detail: "The goal is spatial organization and light distribution, not a guaranteed yield response from any one bend." },
    ],
  },
  "atlas-symptom-location-v1": {
    title: "Symptom location",
    subtitle: "Where a problem starts is part of the evidence",
    points: [
      { id: "new", label: "New growth", detail: "Symptoms concentrated on expanding tissues should be recorded separately from those beginning on older leaves." },
      { id: "old", label: "Older leaves", detail: "Lower or older leaves can show age-related or mobile-resource patterns, but location alone does not confirm a cause." },
      { id: "upper", label: "Upper canopy", detail: "Top-canopy patterns can reflect light, heat, exposure, pests or other local conditions." },
      { id: "branch", label: "One branch or sector", detail: "Localized symptoms can point toward physical, vascular, pest, pathogen or exposure differences that whole-plant explanations may miss." },
      { id: "root", label: "Root or whole plant", detail: "Root decline or whole-plant wilt changes the differential and should trigger root-zone and environment checks." },
    ],
  },
  "atlas-progression-v1": {
    title: "Progression over time",
    subtitle: "A time series can separate active problems from old damage",
    points: [
      { id: "onset", label: "Onset", detail: "Record when the first symptom appeared and what changed beforehand." },
      { id: "spread", label: "Spreading", detail: "New affected tissue or expanding lesions indicate an active process and help define direction and rate." },
      { id: "stable", label: "Stable damage", detail: "Old damaged tissue may remain visible even after the underlying stress has stopped." },
      { id: "recover", label: "Recovery", detail: "Improvement is usually judged by healthier new growth, restored posture or stable readings rather than damaged tissue turning normal again." },
      { id: "timeline", label: "Link actions to time", detail: "Record irrigation, feeding, environment changes, sprays, training and transplant events against symptom progression." },
    ],
  },
};

function active(selected: string, id: string) {
  return selected === id ? styles.emphasis : undefined;
}

function CotyledonTransition({ selected }: { selected: string }) {
  const stages = [0, 1, 2, 3];
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Cotyledon to true-leaf seedling transition">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      {stages.map((stage) => {
        const x = 105 + stage * 165;
        const y = 225 - stage * 24;
        return (
          <g key={stage}>
            <line x1={x} y1="330" x2={x} y2={y} stroke="#6b8e5d" strokeWidth="10" className={active(selected, "hypocotyl")} />
            <ellipse cx={x - 30} cy={y} rx="38" ry="18" fill="#79a35f" className={stage < 3 ? active(selected, "cotyledon") : undefined} />
            <ellipse cx={x + 30} cy={y} rx="38" ry="18" fill="#79a35f" className={stage < 3 ? active(selected, "cotyledon") : undefined} />
            {stage > 1 ? <path d={`M${x} ${y - 22} l-45 -55 45 22 45 -22z`} fill="#438149" className={active(selected, "true")} /> : null}
            {stage === 0 ? <ellipse cx={x} cy={y - 24} rx="42" ry="30" fill="#978262" className={active(selected, "shell")} /> : null}
          </g>
        );
      })}
      <g className={active(selected, "handoff")}>
        <path d="M500 92 Q575 52 650 84" stroke="#d6bd6a" strokeWidth="5" fill="none" />
        <text x="515" y="55" fill="#e8d89b" fontSize="14">true-leaf handoff</text>
      </g>
    </svg>
  );
}

const rootStressKinds = ["healthy", "oxygen", "dry", "salt", "temperature"] as const;

function rootStroke(id: string) {
  if (id === "healthy") return "#ded0ae";
  if (id === "oxygen") return "#8b7965";
  if (id === "dry") return "#b29979";
  if (id === "salt") return "#c8b595";
  return "#9aa3b0";
}

function RootStress({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Healthy and stressed root pattern comparison">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <rect y="210" width="720" height="210" fill="#2a251d" />
      {rootStressKinds.map((id, index) => {
        const x = 72 + index * 142;
        return (
          <g key={id} className={active(selected, id)}>
            <path d={`M${x} 110 V250 Q${x - 28} 300 ${x - 45} 360 M${x} 250 Q${x + 35} 300 ${x + 48} 365`} stroke={rootStroke(id)} strokeWidth="7" fill="none" />
            <circle cx={x} cy="92" r="34" fill={id === "healthy" ? "#4f874b" : "#536746"} />
            <text x={x - 32} y="397" fill="#a9d5b3" fontSize="11">{id}</text>
            {id === "oxygen" ? <circle cx={x + 35} cy="300" r="20" fill="#4a7180" opacity=".6" /> : null}
            {id === "salt" ? [0, 1, 2].map((marker) => <circle key={marker} cx={x - 40 + marker * 32} cy={275 + marker * 20} r="6" fill="#e1c86c" />) : null}
          </g>
        );
      })}
    </svg>
  );
}

function InternodeSpacing({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Compact and extended internode spacing comparison">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <g className={active(selected, "compact")}><line x1="210" y1="350" x2="210" y2="75" stroke="#668b5d" strokeWidth="16" />{[110, 165, 220, 275, 330].map((y) => <circle key={y} cx="210" cy={y} r="14" fill="#9abb76" />)}</g>
      <g className={active(selected, "extended")}><line x1="500" y1="350" x2="500" y2="55" stroke="#668b5d" strokeWidth="16" />{[75, 150, 230, 330].map((y) => <circle key={y} cx="500" cy={y} r="14" fill="#9abb76" />)}</g>
      <g className={active(selected, "node")}><path d="M150 165 H270 M440 150 H560" stroke="#d7b966" strokeWidth="4" /></g>
      <g className={active(selected, "light")}><path d="M60 55 L140 130 M100 45 L170 125 M620 55 L560 125" stroke="#ecd36e" strokeWidth="5" /></g>
      <g className={active(selected, "compare")}><path d="M310 365 H410" stroke="#96c09f" strokeWidth="4" /><text x="320" y="395" fill="#b9dbc0" fontSize="14">same stage / region</text></g>
    </svg>
  );
}

function ToppingFim({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Topping and partial apex removal comparison">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <line x1="300" y1="355" x2="300" y2="80" stroke="#668b5d" strokeWidth="17" />
      <g className={active(selected, "apex")}><path d="M300 55 l-24 42 h48z" fill="#9dcf74" /></g>
      <g className={active(selected, "top")}><path d="M255 140 l90 -28 M259 112 l82 32" stroke="#e58c79" strokeWidth="8" /></g>
      <g className={active(selected, "fim")}><path d="M465 70 q45 30 0 60 q-45 -30 0 -60z" fill="#7aa65e" /><path d="M435 85 l62 34" stroke="#e4a071" strokeWidth="7" /></g>
      <g className={active(selected, "response")}><path d="M300 220 Q220 170 165 125 M300 220 Q380 170 440 125" stroke="#70a064" strokeWidth="12" fill="none" /></g>
      <g className={active(selected, "recovery")}><circle cx="590" cy="275" r="52" fill="#1f4732" stroke="#78ad87" strokeWidth="4" /><text x="551" y="280" fill="#cce5d2" fontSize="13">observe recovery</text></g>
    </svg>
  );
}

function LstDirectional({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Low stress training and directional shoot growth">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <line x1="160" y1="335" x2="160" y2="85" stroke="#678d5d" strokeWidth="16" />
      <path d="M160 150 Q300 155 425 270" stroke="#678d5d" strokeWidth="16" fill="none" className={active(selected, "bend")} />
      <g className={active(selected, "tie")}><line x1="420" y1="270" x2="520" y2="330" stroke="#d0b46b" strokeWidth="5" /><circle cx="520" cy="330" r="14" fill="#9a8a65" /></g>
      <g className={active(selected, "light")}><path d="M450 55 L400 145 M530 55 L450 165 M610 55 L520 190" stroke="#ecd36e" strokeWidth="5" /></g>
      <g className={active(selected, "turn")}><path d="M425 270 Q500 235 525 165" stroke="#8ebc72" strokeWidth="12" fill="none" /></g>
      <g className={active(selected, "canopy")}><path d="M90 300 Q250 235 575 245" stroke="#4b854b" strokeWidth="24" fill="none" opacity=".55" /></g>
    </svg>
  );
}

function SymptomLocation({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Whole plant symptom location map">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <line x1="360" y1="360" x2="360" y2="70" stroke="#65895d" strokeWidth="18" />
      {[120, 180, 240, 300].map((y, index) => <g key={y}><path d={`M360 ${y} Q${260 - index * 12} ${y - 20} ${185 - index * 8} ${y - 45}`} stroke="#628a5d" strokeWidth="12" fill="none" /><path d={`M360 ${y} Q${460 + index * 12} ${y - 20} ${535 + index * 8} ${y - 45}`} stroke="#628a5d" strokeWidth="12" fill="none" /></g>)}
      <g className={active(selected, "new")}><circle cx="360" cy="72" r="30" fill="#e5c864" /></g>
      <g className={active(selected, "old")}><circle cx="185" cy="300" r="30" fill="#d69c55" /></g>
      <g className={active(selected, "upper")}><ellipse cx="360" cy="140" rx="210" ry="75" fill="none" stroke="#e4bf62" strokeWidth="5" /></g>
      <g className={active(selected, "branch")}><path d="M360 240 Q500 220 610 160" stroke="#e08973" strokeWidth="18" fill="none" /></g>
      <g className={active(selected, "root")}><path d="M360 360 Q300 385 265 410 M360 360 Q420 385 455 410" stroke="#d7c6a3" strokeWidth="8" /></g>
    </svg>
  );
}

function SymptomProgression({ selected }: { selected: string }) {
  const stages = [
    { id: "onset", marks: 1 },
    { id: "spread", marks: 3 },
    { id: "stable", marks: 3 },
    { id: "recover", marks: 1 },
  ];
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Symptom progression over time">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <line x1="70" y1="320" x2="650" y2="320" stroke="#52705b" strokeWidth="4" />
      {stages.map((stage, index) => {
        const x = 115 + index * 165;
        return (
          <g key={stage.id} className={active(selected, stage.id)}>
            <circle cx={x} cy="320" r="15" fill="#8db79a" />
            <path d={`M${x} 300 C${x - 35} 235 ${x - 25} 155 ${x} 110 C${x + 35} 165 ${x + 30} 240 ${x} 300z`} fill="#4e874c" />
            {Array.from({ length: stage.marks }).map((_, mark) => <circle key={mark} cx={x - 18 + mark * 18} cy={170 + mark * 22} r="10" fill={stage.id === "recover" ? "#8ec47c" : "#c58b54"} />)}
          </g>
        );
      })}
      <g className={active(selected, "timeline")}><path d="M80 370 H640" stroke="#d2b868" strokeWidth="3" strokeDasharray="8 7" /><text x="235" y="398" fill="#dfcc8a" fontSize="13">actions + measurements aligned to symptom time</text></g>
    </svg>
  );
}

function Graphic({ assetId, selected }: { assetId: string; selected: string }) {
  if (assetId === "atlas-cotyledon-transition-v1") return <CotyledonTransition selected={selected} />;
  if (assetId === "atlas-root-stress-v1") return <RootStress selected={selected} />;
  if (assetId === "atlas-internode-v1") return <InternodeSpacing selected={selected} />;
  if (assetId === "atlas-topping-fim-v1") return <ToppingFim selected={selected} />;
  if (assetId === "atlas-lst-v1") return <LstDirectional selected={selected} />;
  if (assetId === "atlas-symptom-location-v1") return <SymptomLocation selected={selected} />;
  return <SymptomProgression selected={selected} />;
}

export function AtlasGrowthDiagnosticVisual({ assetId }: { assetId: string }) {
  const spec = specs[assetId];
  const [selected, setSelected] = useState(spec?.points[0]?.id ?? "");
  if (!spec) return null;
  const point = spec.points.find((item) => item.id === selected) ?? spec.points[0];

  return (
    <div className={styles.shell}>
      <div className={styles.heading}><div><p>Interactive academic visual</p><h2>{spec.title}</h2><span>{spec.subtitle}</span></div></div>
      <div className={styles.graphic}><Graphic assetId={assetId} selected={selected} /></div>
      <div className={styles.controls} aria-label={`${spec.title} concepts`}>
        {spec.points.map((item) => <button key={item.id} type="button" className={item.id === selected ? styles.active : undefined} onClick={() => setSelected(item.id)}>{item.label}</button>)}
      </div>
      <div className={styles.detail}><strong>{point.label}</strong><p>{point.detail}</p></div>
    </div>
  );
}
