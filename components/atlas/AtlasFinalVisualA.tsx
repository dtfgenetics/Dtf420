"use client";

import { useState } from "react";
import styles from "./AtlasConceptVisual.module.css";

type Point = { id: string; label: string; detail: string };
type Spec = { title: string; subtitle: string; points: Point[] };

const specs: Record<string, Spec> = {
  "atlas-germination-failure-v1": {
    title: "Germination failure patterns",
    subtitle: "Compare patterns and conditions without diagnosing from appearance alone",
    points: [
      { id: "stalled", label: "Stalled", detail: "A hydrated seed can fail to progress for many reasons, including low viability or unsuitable environmental conditions; timing alone does not identify the cause." },
      { id: "wet", label: "Excess moisture", detail: "Persistently saturated conditions can limit oxygen diffusion and favor tissue decline, especially after emergence." },
      { id: "shell", label: "Shell retention", detail: "Seed coat or membrane can remain attached to emerging cotyledons; assess tissue condition and development before intervening." },
      { id: "temperature", label: "Temperature delay", detail: "Temperature affects germination rate and metabolism, so compare timing only under known and consistent conditions." },
      { id: "collapse", label: "Seedling collapse risk", detail: "Post-emergence constriction or collapse can involve pathogens and environmental conditions; it requires sanitation, moisture and tissue context rather than a visual guess." },
    ],
  },
  "atlas-stem-damage-v1": {
    title: "Stem damage & recovery",
    subtitle: "Severity depends on vascular continuity, tissue loss, support and plant condition",
    points: [
      { id: "intact", label: "Intact stem", detail: "An undamaged stem maintains mechanical support and continuous xylem and phloem pathways." },
      { id: "bend", label: "Bending or compression", detail: "Localized crushing can disrupt tissues without complete separation; severity varies with depth and circumference affected." },
      { id: "break", label: "Partial or complete break", detail: "A split or break can sharply reduce structural and vascular continuity and may require immediate support if recovery is possible." },
      { id: "support", label: "Support & wound response", detail: "Mechanical support can limit further movement while living tissues form wound responses; a swollen repair area is not the same as fully restored original anatomy." },
      { id: "continuity", label: "Check function", detail: "Judge recovery by continued hydration, growth, stability and tissue condition above the injury, not by callus appearance alone." },
    ],
  },
  "atlas-mainline-scrog-v1": {
    title: "Mainlining & SCROG",
    subtitle: "Two different ways to organize growing points and canopy space",
    points: [
      { id: "mainline", label: "Structured branch selection", detail: "Mainlining uses deliberate pruning and branch selection to build a repeated framework from chosen nodes." },
      { id: "symmetry", label: "Repeated architecture", detail: "A symmetrical-looking framework is a training goal, not proof that all branches will grow identically." },
      { id: "screen", label: "Screen framework", detail: "SCROG uses a screen or grid to distribute flexible shoots horizontally across available canopy area." },
      { id: "tuck", label: "Positioning shoots", detail: "Shoots are guided into open spaces while avoiding constriction, severe damage and overcrowding." },
      { id: "compare", label: "Different systems", detail: "Mainlining emphasizes selected branch architecture; SCROG emphasizes spatial distribution. They can overlap but are not the same training method." },
    ],
  },
  "atlas-leaf-inspection-v1": {
    title: "Leaf inspection workflow",
    subtitle: "Inspect position, surfaces, structures and progression in a consistent order",
    points: [
      { id: "position", label: "Canopy position", detail: "Start by recording whether the leaf is new or old growth and upper, middle or lower canopy." },
      { id: "surfaces", label: "Upper & lower surfaces", detail: "Inspect both sides because pests, eggs, residue and tissue patterns can be much more visible on one surface." },
      { id: "structure", label: "Margins, veins & petiole", detail: "Record whether symptoms follow margins, interveinal areas, veins, tips or the petiole rather than describing only color." },
      { id: "pests", label: "Pests & residue", detail: "Look for insects, mites, webbing, frass, eggs, feeding marks, spray residue and physical contamination before assuming nutrition." },
      { id: "repeat", label: "Repeat over time", detail: "Photograph the same plant regions and note new versus old damage so progression can be separated from historical injury." },
    ],
  },
  "atlas-flower-initiation-v1": {
    title: "Flower initiation",
    subtitle: "Follow structural transition from preflower expression into expanding floral sites",
    points: [
      { id: "node", label: "Preflower at node", detail: "Early reproductive structures appear near nodes before dense flower clusters develop." },
      { id: "pistillate", label: "Pistillate structures", detail: "Female reproductive sites produce bracts with stigmas as floral development begins." },
      { id: "sites", label: "Multiple flower sites", detail: "Initiation occurs across shoot tips and nodes, with timing varying by position and plant development." },
      { id: "stack", label: "Cluster expansion", detail: "Closely spaced floral structures expand and begin forming larger inflorescence clusters." },
      { id: "context", label: "Stage, not week number", detail: "Use visible development and cultivar context rather than assuming all plants enter the same structural stage on a fixed calendar week." },
    ],
  },
  "atlas-maturity-risk-v1": {
    title: "Maturity & risk inspection",
    subtitle: "Use several maturity signals while actively checking for flower-health risks",
    points: [
      { id: "trichome", label: "Trichome observations", detail: "Use standardized bract sampling and magnification as one developmental observation, not a laboratory potency measurement." },
      { id: "flower", label: "Flower development", detail: "Consider bract expansion, cluster development, ongoing new growth and cultivar-specific maturation behavior." },
      { id: "senescence", label: "Senescence context", detail: "Changing leaf and stigma appearance can accompany maturation but should not be treated as a single harvest trigger." },
      { id: "mold", label: "Mold & tissue inspection", detail: "Dense flowers require inspection for abnormal discoloration, dead internal tissue, odor, visible fungal growth and localized collapse." },
      { id: "decision", label: "Combine evidence", detail: "Maturity decisions should combine repeated observations, plant health, cultivar behavior and intended use rather than one visual cue." },
    ],
  },
  "atlas-trichome-appearance-v1": {
    title: "Clear, cloudy & amber",
    subtitle: "Optical appearance changes with gland development, sampling and imaging conditions",
    points: [
      { id: "clear", label: "Clear-appearing", detail: "Some gland heads appear more transparent when viewed under consistent lighting and focus, particularly earlier in development." },
      { id: "cloudy", label: "Cloudy-appearing", detail: "Increased opacity can accompany gland maturation, but apparent cloudiness is sensitive to focus, illumination and tissue condition." },
      { id: "amber", label: "Amber-appearing", detail: "Yellow-to-amber tones can appear in aging gland heads, but color can also be altered by lighting, oxidation and imaging white balance." },
      { id: "sample", label: "Sample location", detail: "Compare representative flower-bract glands rather than mixing bracts and sugar leaves without recording tissue type." },
      { id: "limits", label: "Interpretation limits", detail: "Gland appearance is not a direct cannabinoid assay and should remain one observation among multiple maturity signals." },
    ],
  },
};

function active(selected: string, id: string) {
  return selected === id ? styles.emphasis : undefined;
}

function GerminationFailure({ selected }: { selected: string }) {
  const patterns = ["stalled", "wet", "shell", "temperature", "collapse"];
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Germination failure pattern comparison">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      {patterns.map((id, index) => {
        const x = 80 + index * 140;
        return (
          <g key={id} className={active(selected, id)}>
            <rect x={x - 52} y="70" width="108" height="275" rx="18" fill="#173226" stroke="#557a61" strokeWidth="3" />
            <ellipse cx={x} cy="160" rx="35" ry="26" fill="#917f64" stroke="#cdbb97" strokeWidth="3" />
            {id === "stalled" ? <path d={`M${x} 187 V245`} stroke="#d9d2bb" strokeWidth="6" /> : null}
            {id === "wet" ? <><rect x={x - 48} y="250" width="98" height="75" fill="#335b67" opacity=".8" /><circle cx={x + 30} cy="225" r="11" fill="#75bed7" /></> : null}
            {id === "shell" ? <><path d={`M${x} 188 V280`} stroke="#7da365" strokeWidth="8" /><ellipse cx={x} cy="220" rx="32" ry="22" fill="none" stroke="#b6a582" strokeWidth="7" /></> : null}
            {id === "temperature" ? <><path d={`M${x} 188 V285`} stroke="#7da365" strokeWidth="8" /><rect x={x - 15} y="235" width="30" height="62" rx="15" fill="#a7554e" /><circle cx={x} cy="300" r="18" fill="#cf6d61" /></> : null}
            {id === "collapse" ? <path d={`M${x} 190 Q${x - 12} 245 ${x + 38} 290`} stroke="#7d8b58" strokeWidth="8" fill="none" /> : null}
            <text x={x - 38} y="375" fill="#b8d7c0" fontSize="11">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}

function StemDamage({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Stem damage and recovery sequence">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <line x1="110" y1="350" x2="110" y2="75" stroke="#6b8f5d" strokeWidth="24" className={active(selected, "intact")} />
      <g className={active(selected, "bend")}><path d="M260 350 V245 Q260 195 305 175 Q335 160 325 80" stroke="#6b8f5d" strokeWidth="24" fill="none" /><ellipse cx="286" cy="205" rx="35" ry="24" fill="#8f815d" opacity=".75" /></g>
      <g className={active(selected, "break")}><line x1="435" y1="350" x2="435" y2="225" stroke="#6b8f5d" strokeWidth="24" /><line x1="452" y1="202" x2="475" y2="85" stroke="#6b8f5d" strokeWidth="24" /><path d="M420 222 l40 -35" stroke="#e28b75" strokeWidth="7" /></g>
      <g className={active(selected, "support")}><line x1="585" y1="350" x2="585" y2="80" stroke="#6b8f5d" strokeWidth="24" /><ellipse cx="585" cy="205" rx="39" ry="52" fill="#927d5e" opacity=".65" /><rect x="545" y="165" width="80" height="82" rx="12" fill="none" stroke="#d0b36e" strokeWidth="5" /></g>
      <g className={active(selected, "continuity")}><path d="M90 120 C260 55 450 55 610 118" stroke="#6db8d5" strokeWidth="5" fill="none" strokeDasharray="10 8" /><text x="272" y="47" fill="#a8d7e8" fontSize="14">check function above injury</text></g>
    </svg>
  );
}

function MainlineScrog({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Mainlining and SCROG comparison">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <line x1="360" y1="40" x2="360" y2="385" stroke="#365142" strokeWidth="2" />
      <g className={active(selected, "mainline")}>
        <line x1="180" y1="350" x2="180" y2="235" stroke="#668b5d" strokeWidth="16" />
        <path d="M180 240 Q115 200 88 140 M180 240 Q245 200 272 140" stroke="#668b5d" strokeWidth="14" fill="none" />
        <path d="M88 140 Q65 105 52 75 M88 140 Q112 105 125 75 M272 140 Q247 105 235 75 M272 140 Q295 105 310 75" stroke="#78a267" strokeWidth="10" fill="none" />
      </g>
      <g className={active(selected, "symmetry")}><path d="M40 190 H320" stroke="#d0b66c" strokeWidth="3" strokeDasharray="8 7" /></g>
      <g className={active(selected, "screen")}>
        {[430, 480, 530, 580, 630].map((x) => <line key={x} x1={x} y1="105" x2={x} y2="330" stroke="#698575" strokeWidth="3" />)}
        {[120, 170, 220, 270, 320].map((y) => <line key={y} x1="410" y1={y} x2="650" y2={y} stroke="#698575" strokeWidth="3" />)}
        <path d="M525 350 Q500 275 445 235 Q500 230 548 185 Q575 250 625 145" stroke="#69a05f" strokeWidth="12" fill="none" />
      </g>
      <g className={active(selected, "tuck")}><circle cx="548" cy="185" r="20" fill="#d2b763" /><path d="M548 150 v-35" stroke="#d2b763" strokeWidth="4" /></g>
      <g className={active(selected, "compare")}><text x="82" y="400" fill="#b8d7c0" fontSize="14">selected framework</text><text x="465" y="400" fill="#b8d7c0" fontSize="14">spatial screen</text></g>
    </svg>
  );
}

function LeafInspection({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Leaf inspection workflow">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <path d="M360 350 C250 292 210 175 360 60 C510 175 470 292 360 350z" fill="#44804a" stroke="#7cad6c" strokeWidth="4" />
      <path d="M360 330 V90" stroke="#b2cc8b" strokeWidth="7" />
      <g className={active(selected, "position")}><circle cx="360" cy="70" r="22" fill="#e4c761" /><circle cx="360" cy="335" r="22" fill="#cf8b55" /></g>
      <g className={active(selected, "surfaces")}><path d="M120 130 q65 -40 130 0 q-65 65 -130 0z" fill="#4a854e" /><path d="M470 130 q65 -40 130 0 q-65 65 -130 0z" fill="#718d60" /></g>
      <g className={active(selected, "structure")}><path d="M285 190 Q360 145 435 190 M275 240 Q360 205 445 240" stroke="#b6cf8e" strokeWidth="5" fill="none" /></g>
      <g className={active(selected, "pests")}><circle cx="292" cy="265" r="9" fill="#d09a54" /><circle cx="315" cy="282" r="7" fill="#d09a54" /><path d="M288 260 l-12 -8 M296 260 l12 -8" stroke="#d09a54" strokeWidth="3" /></g>
      <g className={active(selected, "repeat")}><path d="M560 285 A58 58 0 1 1 600 335" stroke="#82b994" strokeWidth="6" fill="none" /><path d="M600 335 l-24 -4 12 -20z" fill="#82b994" /></g>
    </svg>
  );
}

function FlowerInitiation({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Flower initiation sequence">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      {[0, 1, 2, 3].map((stage) => {
        const x = 100 + stage * 170;
        return (
          <g key={stage}>
            <line x1={x} y1="340" x2={x} y2="120" stroke="#668b5d" strokeWidth="14" />
            <circle cx={x} cy="205" r="16" fill="#8eb46e" className={stage === 0 ? active(selected, "node") : undefined} />
            {stage > 0 ? Array.from({ length: stage + 1 }).map((_, i) => <ellipse key={i} cx={x + (i % 2 ? 25 : -25)} cy={190 - i * 25} rx={22 + stage * 3} ry={30 + stage * 4} fill="#698052" stroke="#a8b77d" strokeWidth="2" className={stage === 1 ? active(selected, "pistillate") : undefined} />) : null}
            {stage > 1 ? <path d={`M${x - 20} 125 q20 -55 40 0`} stroke="#eceef0" strokeWidth="6" fill="none" /> : null}
          </g>
        );
      })}
      <g className={active(selected, "sites")}><path d="M80 280 Q360 235 650 275" stroke="#7ba16a" strokeWidth="5" fill="none" strokeDasharray="9 8" /></g>
      <g className={active(selected, "stack")}><ellipse cx="610" cy="175" rx="70" ry="105" fill="none" stroke="#d1b568" strokeWidth="4" /></g>
      <g className={active(selected, "context")}><text x="255" y="390" fill="#b9d9c0" fontSize="14">structural stage ≠ fixed week number</text></g>
    </svg>
  );
}

function MaturityRisk({ selected }: { selected: string }) {
  const cards = [
    { id: "trichome", x: 65, label: "TRICHOMES" },
    { id: "flower", x: 190, label: "FLOWER" },
    { id: "senescence", x: 315, label: "SENESCENCE" },
    { id: "mold", x: 440, label: "RISK" },
    { id: "decision", x: 565, label: "COMBINE" },
  ];
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Flower maturity and risk inspection checklist">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      {cards.map((card) => (
        <g key={card.id} className={active(selected, card.id)}>
          <rect x={card.x - 50} y="90" width="110" height="220" rx="17" fill="#183427" stroke="#668d70" strokeWidth="3" />
          <circle cx={card.x + 5} cy="165" r="34" fill={card.id === "mold" ? "#704b49" : "#4b754c"} />
          <path d={`M${card.x - 23} 240 l18 18 37 -45`} stroke="#a8d1b1" strokeWidth="6" fill="none" />
          <text x={card.x - 38} y="290" fill="#c8dfcd" fontSize="11">{card.label}</text>
        </g>
      ))}
      <path d="M80 350 H640" stroke="#8cb497" strokeWidth="4" />
      <text x="245" y="382" fill="#a9d0b2" fontSize="13">repeat observations + cultivar context</text>
    </svg>
  );
}

function TrichomeAppearance({ selected }: { selected: string }) {
  const heads = [
    { id: "clear", x: 155, fill: "rgba(220,238,226,.28)", stroke: "#dceee2" },
    { id: "cloudy", x: 360, fill: "rgba(230,238,226,.78)", stroke: "#eff6ec" },
    { id: "amber", x: 565, fill: "rgba(207,149,67,.82)", stroke: "#e6b86e" },
  ];
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Clear cloudy and amber trichome appearance comparison">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      {heads.map((head) => (
        <g key={head.id} className={active(selected, head.id)}>
          <rect x={head.x - 14} y="225" width="28" height="125" rx="12" fill="#cbd9c2" opacity=".75" />
          <circle cx={head.x} cy="165" r="70" fill={head.fill} stroke={head.stroke} strokeWidth="5" />
          <text x={head.x - 28} y="390" fill="#bedbc5" fontSize="14">{head.id}</text>
        </g>
      ))}
      <g className={active(selected, "sample")}><rect x="50" y="45" width="240" height="45" rx="12" fill="#1c3b2b" /><text x="70" y="73" fill="#cde5d3" fontSize="13">same tissue + representative sites</text></g>
      <g className={active(selected, "limits")}><rect x="420" y="45" width="250" height="45" rx="12" fill="#3d3422" /><text x="445" y="73" fill="#e4d6aa" fontSize="13">appearance ≠ potency assay</text></g>
    </svg>
  );
}

function Graphic({ assetId, selected }: { assetId: string; selected: string }) {
  if (assetId === "atlas-germination-failure-v1") return <GerminationFailure selected={selected} />;
  if (assetId === "atlas-stem-damage-v1") return <StemDamage selected={selected} />;
  if (assetId === "atlas-mainline-scrog-v1") return <MainlineScrog selected={selected} />;
  if (assetId === "atlas-leaf-inspection-v1") return <LeafInspection selected={selected} />;
  if (assetId === "atlas-flower-initiation-v1") return <FlowerInitiation selected={selected} />;
  if (assetId === "atlas-maturity-risk-v1") return <MaturityRisk selected={selected} />;
  return <TrichomeAppearance selected={selected} />;
}

export function AtlasFinalVisualA({ assetId }: { assetId: string }) {
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
