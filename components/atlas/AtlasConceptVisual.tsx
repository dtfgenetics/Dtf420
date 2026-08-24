"use client";

import { useState } from "react";
import styles from "./AtlasConceptVisual.module.css";

type Point = { id: string; label: string; detail: string };
type Spec = { title: string; subtitle: string; points: Point[] };

const specs: Record<string, Spec> = {
  "atlas-imbibition-v1": {
    title: "Imbibition",
    subtitle: "Water uptake rehydrates seed tissues before visible germination",
    points: [
      { id: "dry", label: "Dry seed", detail: "A mature dry seed has low tissue water content and greatly reduced metabolic activity." },
      { id: "water", label: "Water uptake", detail: "Water moves into seed tissues, hydrating macromolecules and increasing seed volume." },
      { id: "coat", label: "Seed coat", detail: "The protective coat becomes hydrated and mechanically less restrictive as internal tissues swell." },
      { id: "metabolism", label: "Metabolic restart", detail: "Hydration enables enzyme activity, respiration, reserve mobilization and renewed cellular metabolism." },
      { id: "radicle", label: "Before radicle emergence", detail: "Imbibition precedes visible radicle emergence; hydration alone is not proof that germination will complete." },
    ],
  },
  "atlas-apical-dominance-v1": {
    title: "Apical dominance",
    subtitle: "Shoot position and hormonal signaling influence lateral bud growth",
    points: [
      { id: "apex", label: "Shoot apex", detail: "The active shoot apex strongly influences the growth behavior of axillary buds below it." },
      { id: "auxin", label: "Auxin context", detail: "Auxin produced near the shoot tip participates in apical-dominance signaling through interactions with other hormones and transport pathways." },
      { id: "bud", label: "Axillary buds", detail: "Lateral buds may remain relatively suppressed while the dominant apex is intact and favorably positioned." },
      { id: "remove", label: "Apex removed", detail: "Topping removes the dominant shoot tip and changes signaling and resource relationships among remaining buds." },
      { id: "response", label: "Lateral response", detail: "Multiple lateral shoots can increase growth after topping, but the magnitude and timing depend on plant condition and genetics." },
    ],
  },
  "atlas-photosynthesis-v1": {
    title: "Photosynthesis",
    subtitle: "Light energy, carbon dioxide and water support carbohydrate production",
    points: [
      { id: "light", label: "Light capture", detail: "Photosynthetic pigments absorb usable wavelengths of light and transfer energy into photochemical reactions." },
      { id: "co2", label: "CO₂ entry", detail: "Carbon dioxide diffuses through stomata and internal air spaces toward photosynthetic cells." },
      { id: "water", label: "Water supply", detail: "Water delivered through xylem supplies photosynthetic reactions and supports cell hydration and stomatal function." },
      { id: "chloroplast", label: "Chloroplast", detail: "Light reactions and carbon-fixation chemistry occur in coordinated compartments of the chloroplast." },
      { id: "sugar", label: "Carbohydrate output", detail: "Fixed carbon is incorporated into carbohydrates that support respiration, growth, storage and transport to sinks." },
    ],
  },
  "atlas-symptom-pattern-v1": {
    title: "Symptom pattern language",
    subtitle: "Describe what is visible before assigning a cause",
    points: [
      { id: "chlorosis", label: "Chlorosis", detail: "Loss of green color can be uniform, interveinal, marginal, localized or age-dependent; record the distribution precisely." },
      { id: "necrosis", label: "Necrosis", detail: "Dead tissue may begin at tips, margins, spots or damaged regions and should be mapped separately from discoloration." },
      { id: "spotting", label: "Spotting", detail: "Discrete lesions or speckles should be described by size, shape, color, margins, surface and progression." },
      { id: "curl", label: "Curl or distortion", detail: "Record whether tissue cups upward, curls downward, twists, puckers or develops asymmetrically." },
      { id: "location", label: "Location matters", detail: "Old versus new growth and upper versus lower canopy location often provide more diagnostic value than color alone." },
    ],
  },
  "atlas-seed-formation-v1": {
    title: "Seed formation",
    subtitle: "Fertilization initiates embryo and seed-coat development within the ovule",
    points: [
      { id: "pollination", label: "Pollination", detail: "Compatible pollen reaching a receptive stigma can germinate and begin pollen-tube growth." },
      { id: "fertilization", label: "Fertilization", detail: "Successful delivery of sperm cells to the ovule initiates embryo and supporting seed-tissue development." },
      { id: "embryo", label: "Embryo development", detail: "The embryo establishes its axis and cotyledon structures while the seed enlarges." },
      { id: "coat", label: "Seed coat", detail: "Maternal integument tissues differentiate into the protective seed coat as development proceeds." },
      { id: "maturity", label: "Physical maturity", detail: "Mature seeds become firmer and drier as development completes, but appearance alone does not guarantee viability." },
    ],
  },
  "atlas-vpd-flow-v1": {
    title: "VPD & transpiration",
    subtitle: "Temperature and vapor pressure shape atmospheric demand on the leaf",
    points: [
      { id: "leaf", label: "Leaf vapor pressure", detail: "Water vapor inside healthy leaf air spaces is typically near saturation at leaf temperature." },
      { id: "air", label: "Air vapor pressure", detail: "Ambient temperature and relative humidity determine the actual vapor pressure of surrounding air." },
      { id: "gradient", label: "Vapor-pressure gradient", detail: "The difference between leaf and air vapor pressure contributes to the driving force for water-vapor loss." },
      { id: "stomata", label: "Stomatal response", detail: "Stomatal conductance changes with plant water status, light, carbon dioxide, hormones and atmospheric demand." },
      { id: "system", label: "Whole-plant response", detail: "Transpiration demand must be interpreted together with root water supply, xylem transport, leaf temperature and developmental stage." },
    ],
  },
};

function SeedHydration({ selected }: { selected: string }) {
  const stages = [
    { x: 112, r: 55, id: "dry" },
    { x: 280, r: 62, id: "water" },
    { x: 452, r: 68, id: "metabolism" },
    { x: 610, r: 72, id: "radicle" },
  ];
  return <svg viewBox="0 0 720 420" role="img" aria-label="Seed imbibition sequence">
    <rect width="720" height="420" rx="24" fill="#0d1c14" />
    <path d="M70 285 H650" stroke="#466c50" strokeWidth="3" strokeDasharray="8 10" />
    {stages.map((stage, index) => <g key={stage.id} className={selected === stage.id ? styles.emphasis : undefined}>
      <ellipse cx={stage.x} cy="220" rx={stage.r} ry={stage.r * .7} fill={index === 0 ? "#7f725e" : "#9a896d"} stroke="#d2c3a2" strokeWidth="4" />
      <path d={`M${stage.x-28} 215 C${stage.x-5} 180 ${stage.x+24} 185 ${stage.x+35} 220`} fill="none" stroke="#d8e5b7" strokeWidth="8" strokeLinecap="round" opacity={.72 + index * .08} />
      {index > 0 ? <>{[0,1,2].map(i => <circle key={i} cx={stage.x - 76 + i * 22} cy={125 + i * 7} r="8" fill="#6cbad5" />)}<path d={`M${stage.x-52} 145 Q${stage.x-25} 170 ${stage.x-12} 190`} fill="none" stroke="#6cbad5" strokeWidth="4" /></> : null}
      {index === 3 ? <path d={`M${stage.x+18} 242 Q${stage.x+46} 280 ${stage.x+28} 326`} fill="none" stroke="#e5dec6" strokeWidth="8" strokeLinecap="round" /> : null}
      <text x={stage.x - 28} y="334" fill="#a9d8b5" fontSize="15">{index + 1}</text>
    </g>)}
    <g className={selected === "coat" ? styles.emphasis : undefined}><ellipse cx="280" cy="220" rx="68" ry="47" fill="none" stroke="#e9d4a8" strokeWidth="7" /></g>
  </svg>;
}

function ApicalDominance({ selected }: { selected: string }) {
  return <svg viewBox="0 0 720 420" role="img" aria-label="Apical dominance and lateral branching diagram">
    <rect width="720" height="420" rx="24" fill="#0d1c14" />
    <line x1="190" y1="345" x2="190" y2="85" stroke="#608a5c" strokeWidth="15" strokeLinecap="round" />
    <g className={selected === "apex" ? styles.emphasis : undefined}><path d="M190 62 l-24 38 h48z" fill="#9bd46e" /></g>
    {[145,205,265].map((y, i) => <g key={y} className={selected === "bud" ? styles.emphasis : undefined}><line x1="190" y1={y} x2={115-i*8} y2={y+34} stroke="#628958" strokeWidth="10" /><circle cx={108-i*8} cy={y+38} r="12" fill="#7fae67" /></g>)}
    <g className={selected === "auxin" ? styles.emphasis : undefined}><path d="M220 92 C260 145 250 218 225 300" fill="none" stroke="#d8b85c" strokeWidth="6" strokeDasharray="10 8" /><text x="248" y="188" fill="#e9d48d" fontSize="15">apical signal</text></g>
    <line x1="360" y1="65" x2="360" y2="350" stroke="#355642" strokeWidth="2" />
    <line x1="520" y1="345" x2="520" y2="155" stroke="#608a5c" strokeWidth="15" strokeLinecap="round" />
    <g className={selected === "remove" ? styles.emphasis : undefined}><path d="M490 137 l60 -20 M492 117 l56 22" stroke="#df8274" strokeWidth="8" strokeLinecap="round" /></g>
    <g className={selected === "response" ? styles.emphasis : undefined}><path d="M520 235 Q455 190 425 135 M520 235 Q585 190 615 135" fill="none" stroke="#74a967" strokeWidth="13" strokeLinecap="round" /><circle cx="420" cy="130" r="17" fill="#8fc879" /><circle cx="620" cy="130" r="17" fill="#8fc879" /></g>
  </svg>;
}

function Photosynthesis({ selected }: { selected: string }) {
  return <svg viewBox="0 0 720 420" role="img" aria-label="Leaf photosynthesis process diagram">
    <rect width="720" height="420" rx="24" fill="#0d1c14" />
    <path d="M120 270 Q260 82 530 142 Q600 165 628 248 Q420 332 120 270z" fill="#397641" stroke="#76ad6d" strokeWidth="4" />
    <path d="M145 265 Q350 235 605 225" stroke="#a9c88d" strokeWidth="7" fill="none" />
    <g className={selected === "light" ? styles.emphasis : undefined}>{[0,1,2,3].map(i => <path key={i} d={`M${165+i*55} 52 L${215+i*45} 130`} stroke="#f1d46e" strokeWidth="6" />)}</g>
    <g className={selected === "co2" ? styles.emphasis : undefined}>{[0,1,2].map(i => <g key={i}><circle cx={505+i*35} cy={70+i*18} r="14" fill="#a2d8ad" /><text x={494+i*35} y={75+i*18} fill="#102017" fontSize="11">CO₂</text></g>)}</g>
    <g className={selected === "water" ? styles.emphasis : undefined}><path d="M120 350 C190 330 225 310 265 278" stroke="#6bb7d5" strokeWidth="7" fill="none" /><circle cx="110" cy="352" r="12" fill="#79c5df" /></g>
    <g className={selected === "chloroplast" ? styles.emphasis : undefined}>{[0,1,2,3].map(i => <ellipse key={i} cx={300+i*55} cy={190+(i%2)*35} rx="31" ry="17" fill="#84b95d" stroke="#c9e7a4" strokeWidth="3" />)}</g>
    <g className={selected === "sugar" ? styles.emphasis : undefined}><path d="M405 290 C455 315 500 326 565 342" stroke="#d6aa66" strokeWidth="6" fill="none" /><rect x="555" y="326" width="72" height="38" rx="12" fill="#5d452a" stroke="#e1bd7d" strokeWidth="3" /><text x="570" y="350" fill="#f4dfb2" fontSize="14">carbon</text></g>
  </svg>;
}

function SymptomPatterns({ selected }: { selected: string }) {
  const leaf = (x: number, pattern: string) => <g transform={`translate(${x} 0)`} className={selected === pattern ? styles.emphasis : undefined}>
    <path d="M80 300 C38 220 50 128 120 76 C187 140 187 228 112 304z" fill="#4e8b4d" stroke="#8fbd70" strokeWidth="4" />
    <path d="M108 292 L116 98" stroke="#b4d08b" strokeWidth="5" />
    {pattern === "chlorosis" ? <path d="M72 178 Q116 125 157 176 Q140 220 94 238z" fill="#c8c865" opacity=".8" /> : null}
    {pattern === "necrosis" ? <path d="M62 236 Q76 270 100 287 L84 307 Q49 274 45 244z" fill="#6b3d2b" /> : null}
    {pattern === "spotting" ? [0,1,2,3,4].map(i => <circle key={i} cx={78+(i%2)*60} cy={145+i*27} r={7+i} fill="#9e7140" />) : null}
    {pattern === "curl" ? <path d="M65 115 Q103 145 145 112" stroke="#d9dd93" strokeWidth="8" fill="none" /> : null}
    {pattern === "location" ? <><circle cx="118" cy="98" r="16" fill="#eb8f65" /><circle cx="78" cy="260" r="16" fill="#67b8df" /></> : null}
  </g>;
  return <svg viewBox="0 0 720 420" role="img" aria-label="Leaf symptom pattern comparison">
    <rect width="720" height="420" rx="24" fill="#0d1c14" />
    {leaf(0,"chlorosis")}{leaf(125,"necrosis")}{leaf(250,"spotting")}{leaf(375,"curl")}{leaf(500,"location")}
    {[[80,"chlorosis"],[205,"necrosis"],[330,"spotting"],[455,"curl"],[580,"location"]].map(([x,label]) => <text key={String(label)} x={Number(x)-34} y="360" fill="#a7d9b4" fontSize="13">{String(label)}</text>)}
  </svg>;
}

function SeedFormation({ selected }: { selected: string }) {
  const stages = ["pollination","fertilization","embryo","coat","maturity"];
  return <svg viewBox="0 0 720 420" role="img" aria-label="Seed formation developmental sequence">
    <rect width="720" height="420" rx="24" fill="#0d1c14" />
    <path d="M55 310 H665" stroke="#456c50" strokeWidth="4" />
    {stages.map((stage,index) => {
      const x = 90 + index * 135;
      return <g key={stage} className={selected === stage ? styles.emphasis : undefined}>
        <ellipse cx={x} cy="215" rx={30+index*8} ry={44+index*7} fill={index<2 ? "#6d985d" : "#9b865f"} stroke="#d3c596" strokeWidth="3" />
        {index >= 2 ? <path d={`M${x-12} 236 Q${x} ${185-index*3} ${x+14} 228`} stroke="#e0e6b7" strokeWidth="7" fill="none" strokeLinecap="round" /> : null}
        {index === 0 ? <>{[0,1,2].map(i => <circle key={i} cx={x-28+i*28} cy="130-i*8" r="6" fill="#e6d16f" />)}<path d={`M${x} 140 V170`} stroke="#e6d16f" strokeWidth="4" /></> : null}
        <text x={x-9} y="340" fill="#a9d7b4" fontSize="14">{index+1}</text>
      </g>;
    })}
  </svg>;
}

function VpdFlow({ selected }: { selected: string }) {
  return <svg viewBox="0 0 720 420" role="img" aria-label="Whole plant VPD and transpiration relationship diagram">
    <rect width="720" height="420" rx="24" fill="#0d1c14" />
    <rect y="330" width="720" height="90" fill="#2a241c" />
    <path d="M360 360 V155" stroke="#60885a" strokeWidth="24" /><path d="M360 180 Q290 140 225 130 M360 190 Q430 145 500 130" stroke="#668f60" strokeWidth="14" fill="none" />
    <g className={selected === "leaf" ? styles.emphasis : undefined}><ellipse cx="215" cy="125" rx="70" ry="28" fill="#43844a" transform="rotate(-15 215 125)" /><ellipse cx="510" cy="125" rx="70" ry="28" fill="#43844a" transform="rotate(15 510 125)" /></g>
    <g className={selected === "air" ? styles.emphasis : undefined}><rect x="520" y="30" width="145" height="68" rx="14" fill="#17372a" stroke="#8fc69c" strokeWidth="3" /><text x="541" y="58" fill="#c7e5ce" fontSize="14">air temp + RH</text><text x="547" y="80" fill="#91cf9f" fontSize="13">air vapor pressure</text></g>
    <g className={selected === "gradient" ? styles.emphasis : undefined}>{[0,1,2].map(i => <path key={i} d={`M${470+i*20} 120 Q${500+i*24} 85 ${520+i*32} 58`} fill="none" stroke="#79c6df" strokeWidth="5" />)}</g>
    <g className={selected === "stomata" ? styles.emphasis : undefined}><circle cx="215" cy="125" r="15" fill="#b6d99d" /><ellipse cx="215" cy="125" rx="5" ry="12" fill="#102017" /></g>
    <g className={selected === "system" ? styles.emphasis : undefined}><path d="M360 355 Q300 372 260 398 M360 355 Q420 372 460 398" stroke="#d8c7a4" strokeWidth="8" fill="none" /><path d="M350 325 C348 270 350 235 355 205" stroke="#6db8d3" strokeWidth="6" /></g>
  </svg>;
}

function Graphic({ assetId, selected }: { assetId: string; selected: string }) {
  if (assetId === "atlas-imbibition-v1") return <SeedHydration selected={selected} />;
  if (assetId === "atlas-apical-dominance-v1") return <ApicalDominance selected={selected} />;
  if (assetId === "atlas-photosynthesis-v1") return <Photosynthesis selected={selected} />;
  if (assetId === "atlas-symptom-pattern-v1") return <SymptomPatterns selected={selected} />;
  if (assetId === "atlas-seed-formation-v1") return <SeedFormation selected={selected} />;
  return <VpdFlow selected={selected} />;
}

export function AtlasConceptVisual({ assetId }: { assetId: string }) {
  const spec = specs[assetId];
  const [selected, setSelected] = useState(spec?.points[0]?.id ?? "");
  if (!spec) return null;
  const point = spec.points.find(item => item.id === selected) ?? spec.points[0];

  return <div className={styles.shell}>
    <div className={styles.heading}><div><p>Interactive academic visual</p><h2>{spec.title}</h2><span>{spec.subtitle}</span></div></div>
    <div className={styles.graphic}><Graphic assetId={assetId} selected={selected} /></div>
    <div className={styles.controls} aria-label={`${spec.title} structures`}>
      {spec.points.map(item => <button key={item.id} type="button" className={item.id === selected ? styles.active : undefined} onClick={() => setSelected(item.id)}>{item.label}</button>)}
    </div>
    <div className={styles.detail}><strong>{point.label}</strong><p>{point.detail}</p></div>
  </div>;
}
