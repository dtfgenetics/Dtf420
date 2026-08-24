"use client";

import { useState } from "react";
import styles from "./AtlasConceptVisual.module.css";

type Point = { id: string; label: string; detail: string };
type Spec = { title: string; subtitle: string; points: Point[] };

const specs: Record<string, Spec> = {
  "atlas-rhizosphere-v1": {
    title: "Rhizosphere interactions",
    subtitle: "A dynamic root-influenced zone of water, ions, gases, exudates and microbes",
    points: [
      { id: "root", label: "Root surface", detail: "Living root tissues alter the chemistry and biology of the narrow zone immediately surrounding them." },
      { id: "exudates", label: "Root exudates", detail: "Roots release a mixture of compounds that can influence nutrient chemistry and microbial communities; composition changes with tissue and conditions." },
      { id: "microbes", label: "Microbial community", detail: "Bacteria, fungi and other organisms interact with roots and one another; beneficial effects are context-dependent rather than guaranteed." },
      { id: "solution", label: "Water & ions", detail: "The rhizosphere solution supplies water and dissolved ions while local depletion, accumulation and pH shifts can develop near active roots." },
      { id: "oxygen", label: "Gas exchange", detail: "Root and microbial respiration consume oxygen, so pore structure, moisture and diffusion strongly influence rhizosphere oxygen status." },
    ],
  },
  "atlas-phloem-v1": {
    title: "Phloem transport",
    subtitle: "Photosynthate moves from source tissues toward active sinks",
    points: [
      { id: "source", label: "Source tissue", detail: "Mature photosynthetic leaves commonly export assimilated carbon when their production exceeds local demand." },
      { id: "loading", label: "Phloem loading", detail: "Sugars enter the transport pathway through regulated cellular processes that establish source-to-sink pressure relationships." },
      { id: "sieve", label: "Sieve pathway", detail: "Sieve elements and companion cells form living transport tissue that distributes photosynthate through the plant." },
      { id: "sink", label: "Sink tissues", detail: "Growing shoots, roots, developing flowers, seeds and storage tissues can import assimilated carbon depending on developmental demand." },
      { id: "direction", label: "Direction depends on source & sink", detail: "Different phloem pathways can move assimilates in different directions at the same time; transport is not simply always downward." },
    ],
  },
  "atlas-pollen-pathway-v1": {
    title: "Pollen biology",
    subtitle: "Production, release, transfer, stigma contact and pollen-tube growth",
    points: [
      { id: "production", label: "Pollen production", detail: "Staminate anthers develop and release pollen grains containing the male gametophyte." },
      { id: "release", label: "Release & transport", detail: "Dry airborne pollen can move by air currents, handling or intentional transfer; arrival alone does not guarantee fertilization." },
      { id: "stigma", label: "Stigma contact", detail: "Compatible pollen must reach receptive pistillate tissue and hydrate sufficiently to germinate." },
      { id: "tube", label: "Pollen-tube growth", detail: "A germinating pollen grain produces a tube that grows through pistillate tissues toward an ovule." },
      { id: "fertilization", label: "Fertilization", detail: "Successful gamete delivery and fusion initiates seed development; pollination and fertilization are distinct events." },
    ],
  },
  "atlas-ppfd-overlay-v1": {
    title: "Canopy light distribution",
    subtitle: "Map PPFD spatially instead of relying on one center reading",
    points: [
      { id: "source", label: "Light source", detail: "Fixture geometry, optics, mounting height and dimming determine the incident light field before the canopy modifies it." },
      { id: "grid", label: "Measurement grid", detail: "Multiple PPFD measurements across a consistent canopy-height grid reveal spatial variation that a single reading cannot show." },
      { id: "high", label: "High-light zones", detail: "Areas directly under intense portions of the fixture may receive substantially more photon flux than neighboring leaves." },
      { id: "shade", label: "Shaded zones", detail: "Leaf overlap, canopy depth and branch architecture reduce light reaching lower and interior leaves." },
      { id: "uniformity", label: "Uniformity context", detail: "A useful map considers average intensity, extremes and spatial uniformity together rather than maximizing the single highest value." },
    ],
  },
  "atlas-trichome-sampling-v1": {
    title: "Where to inspect trichomes",
    subtitle: "Standardize tissue, canopy position, magnification and repeat sampling",
    points: [
      { id: "bract", label: "Flower bracts", detail: "For floral maturity observations, glandular trichomes on representative flower bracts are generally more relevant than those on surrounding leaf tissue." },
      { id: "sugar", label: "Sugar leaves", detail: "Sugar-leaf trichomes can differ in apparent maturity and should not automatically be substituted for bract observations." },
      { id: "sites", label: "Multiple sites", detail: "Sample several representative flower sites because light exposure, canopy position and local development can vary." },
      { id: "optics", label: "Consistent optics", detail: "Keep magnification, lighting, focus and viewing angle consistent so repeated observations are more comparable." },
      { id: "repeat", label: "Repeat over time", detail: "A time series is more informative than one isolated image; record tissue sampled and date with each observation." },
    ],
  },
  "atlas-differential-v1": {
    title: "Observation-to-differential workflow",
    subtitle: "Rank plausible explanations and choose observations that separate them",
    points: [
      { id: "observe", label: "Describe first", detail: "Record location, color or tissue change, pattern, posture, progression and plant stage before assigning a cause." },
      { id: "context", label: "Collect context", detail: "Add root-zone moisture, pH, EC, environment, recent inputs, irrigation history, pests, damage and timing." },
      { id: "rank", label: "Rank hypotheses", detail: "Build a short ranked differential across environmental, root-zone, nutritional, pest, pathogen and physical possibilities." },
      { id: "separate", label: "Choose a discriminating check", detail: "Prefer the next measurement or observation that can meaningfully separate the leading explanations rather than collecting random data." },
      { id: "update", label: "Update with evidence", detail: "Revise the ranking as new evidence appears and avoid treating the first plausible explanation as confirmed." },
    ],
  },
};

function Rhizosphere({ selected }: { selected: string }) {
  return <svg viewBox="0 0 720 420" role="img" aria-label="Rhizosphere interaction map">
    <rect width="720" height="420" rx="24" fill="#0d1c14"/><rect y="105" width="720" height="315" fill="#2b261d"/>
    <g className={selected === "root" ? styles.emphasis : undefined}><path d="M355 72 C345 150 350 235 362 385" stroke="#d7c6a6" strokeWidth="34" fill="none" strokeLinecap="round"/></g>
    <g className={selected === "exudates" ? styles.emphasis : undefined}>{[0,1,2,3,4].map(i=><circle key={i} cx={310+(i%2)*96} cy={160+i*40} r="9" fill="#d9a866"/>)}</g>
    <g className={selected === "microbes" ? styles.emphasis : undefined}>{[0,1,2,3,4,5].map(i=><g key={i}><ellipse cx={190+(i%3)*165} cy={185+Math.floor(i/3)*110} rx="18" ry="9" fill="#84bc71" transform={`rotate(${i*23} ${190+(i%3)*165} ${185+Math.floor(i/3)*110})`}/><circle cx={215+(i%3)*165} cy={200+Math.floor(i/3)*110} r="7" fill="#ad83c9"/></g>)}</g>
    <g className={selected === "solution" ? styles.emphasis : undefined}>{[0,1,2,3,4,5,6].map(i=><circle key={i} cx={105+(i%4)*145} cy={135+Math.floor(i/4)*205+(i%2)*24} r="10" fill="#67b7d4" opacity=".82"/>)}</g>
    <g className={selected === "oxygen" ? styles.emphasis : undefined}><circle cx="595" cy="145" r="40" fill="#173c4b" stroke="#75c4dc" strokeWidth="3"/><text x="572" y="153" fill="#c9edf7" fontSize="22">O₂</text><path d="M560 174 Q520 214 485 250" stroke="#75c4dc" strokeWidth="4" fill="none" strokeDasharray="7 7"/></g>
    <ellipse cx="360" cy="235" rx="118" ry="170" fill="none" stroke="#a4d092" strokeWidth="3" strokeDasharray="9 8" opacity=".7"/>
  </svg>;
}

function Phloem({ selected }: { selected: string }) {
  return <svg viewBox="0 0 720 420" role="img" aria-label="Phloem source-to-sink transport map">
    <rect width="720" height="420" rx="24" fill="#0d1c14"/>
    <path d="M360 365 V85" stroke="#607f56" strokeWidth="34" strokeLinecap="round"/><path d="M360 135 Q290 100 220 105 M360 165 Q430 120 510 120" stroke="#658c5d" strokeWidth="16" fill="none" strokeLinecap="round"/>
    <g className={selected === "source" ? styles.emphasis : undefined}><ellipse cx="205" cy="100" rx="78" ry="31" fill="#438547" transform="rotate(-12 205 100)"/><text x="164" y="105" fill="#e3f3de" fontSize="15">SOURCE LEAF</text></g>
    <g className={selected === "loading" ? styles.emphasis : undefined}><circle cx="285" cy="125" r="26" fill="#d1ab62"/><path d="M275 126 h22" stroke="#173018" strokeWidth="5"/><path d="M292 116 l11 10 -11 10" fill="none" stroke="#173018" strokeWidth="4"/></g>
    <g className={selected === "sieve" ? styles.emphasis : undefined}><path d="M345 160 C340 225 340 300 348 350" stroke="#d7ad67" strokeWidth="8" fill="none"/><path d="M375 155 C390 220 400 265 430 320" stroke="#d7ad67" strokeWidth="8" fill="none"/></g>
    <g className={selected === "sink" ? styles.emphasis : undefined}><circle cx="510" cy="118" r="34" fill="#799b5d"/><text x="482" y="123" fill="#edf5dd" fontSize="13">GROWTH</text><path d="M348 350 Q300 372 260 396" stroke="#d6c49f" strokeWidth="8" fill="none"/><circle cx="250" cy="394" r="18" fill="#b49b72"/></g>
    <g className={selected === "direction" ? styles.emphasis : undefined}><path d="M333 205 l-10 20 h20z" fill="#f0cd7a"/><path d="M411 270 l-10 -20 h20z" fill="#f0cd7a"/><text x="455" y="292" fill="#f0d895" fontSize="14">different source→sink paths</text></g>
  </svg>;
}

function Pollen({ selected }: { selected: string }) {
  return <svg viewBox="0 0 720 420" role="img" aria-label="Pollen production to fertilization pathway">
    <rect width="720" height="420" rx="24" fill="#0d1c14"/>
    <g className={selected === "production" ? styles.emphasis : undefined}><path d="M90 130 Q125 70 160 130 Q125 192 90 130z" fill="#a8b75f"/><path d="M125 130 V300" stroke="#668d58" strokeWidth="10"/></g>
    <g className={selected === "release" ? styles.emphasis : undefined}>{[0,1,2,3,4].map(i=><circle key={i} cx={190+i*52} cy={105+(i%2)*24} r="10" fill="#e4ce65" stroke="#f4e59b" strokeWidth="2"/>)}<path d="M175 150 Q300 190 430 150" stroke="#d9c867" strokeWidth="3" fill="none" strokeDasharray="8 8"/></g>
    <g className={selected === "stigma" ? styles.emphasis : undefined}><path d="M500 105 Q470 135 505 165 M500 105 Q530 135 505 165" stroke="#e4edf0" strokeWidth="9" fill="none" strokeLinecap="round"/><path d="M505 160 V300" stroke="#87a264" strokeWidth="13"/></g>
    <g className={selected === "tube" ? styles.emphasis : undefined}><path d="M500 130 C460 175 475 225 520 270" stroke="#efdc7d" strokeWidth="6" fill="none"/><circle cx="499" cy="128" r="11" fill="#e5ce63"/></g>
    <g className={selected === "fertilization" ? styles.emphasis : undefined}><ellipse cx="525" cy="300" rx="62" ry="46" fill="#708f57" stroke="#b8cb82" strokeWidth="3"/><circle cx="525" cy="300" r="17" fill="#dbc579"/><text x="491" y="366" fill="#b8d5b8" fontSize="13">ovule context</text></g>
  </svg>;
}

function Ppfd({ selected }: { selected: string }) {
  const cells=[.65,.82,.98,.88,.62,.72,.9,1,.92,.7,.55,.73,.86,.75,.53];
  return <svg viewBox="0 0 720 420" role="img" aria-label="Canopy PPFD measurement overlay">
    <rect width="720" height="420" rx="24" fill="#0d1c14"/>
    <g className={selected === "source" ? styles.emphasis : undefined}><rect x="180" y="35" width="360" height="42" rx="16" fill="#d8c96d"/><path d="M215 80 L135 260 M300 80 L270 260 M420 80 L450 260 M505 80 L585 260" stroke="#e9da7b" strokeWidth="4" opacity=".65"/></g>
    <path d="M80 285 Q160 230 240 272 Q320 212 395 270 Q480 225 640 285" stroke="#4c844b" strokeWidth="25" fill="none" strokeLinecap="round"/>
    <g className={selected === "grid" || selected === "high" || selected === "shade" || selected === "uniformity" ? styles.emphasis : undefined}>{cells.map((v,i)=>{const x=95+(i%5)*110;const y=305+Math.floor(i/5)*42;const high=v>.9;const low=v<.6;return <g key={i}><rect x={x} y={y} width="86" height="31" rx="8" fill={high?"#d7ba55":low?"#345e49":"#65925b"} opacity={selected==="high"&&!high||selected==="shade"&&!low?.35:1}/><text x={x+26} y={y+21} fill="#edf4e5" fontSize="12">{Math.round(v*100)}%</text></g>})}</g>
  </svg>;
}

function TrichomeSampling({ selected }: { selected: string }) {
  return <svg viewBox="0 0 720 420" role="img" aria-label="Trichome sampling location and repeat-observation map">
    <rect width="720" height="420" rx="24" fill="#0d1c14"/>
    <path d="M345 360 V95" stroke="#648558" strokeWidth="18"/><g className={selected === "bract" ? styles.emphasis : undefined}>{[0,1,2,3,4].map(i=><ellipse key={i} cx={345+(i%2?28:-28)} cy={255-i*37} rx="31" ry="45" fill="#667f4d" stroke="#a5b979" strokeWidth="3"/>)}</g>
    <g className={selected === "sugar" ? styles.emphasis : undefined}><path d="M320 220 l-130 -55 108 94z M370 220 l135 -70 -110 105z" fill="#467e48"/></g>
    <g className={selected === "sites" ? styles.emphasis : undefined}>{[[335,115],[315,190],[372,250]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="17" fill="none" stroke="#f0d579" strokeWidth="4"/>)}</g>
    <g className={selected === "optics" ? styles.emphasis : undefined}><circle cx="585" cy="130" r="62" fill="#17372c" stroke="#79c4a0" strokeWidth="5"/><circle cx="585" cy="130" r="39" fill="#243c2d"/>{[0,1,2,3].map(i=><g key={i}><line x1="565" y1={112+i*12} x2="565" y2={132+i*12} stroke="#ddd3b5" strokeWidth="4"/><circle cx="565" cy={110+i*12} r="8" fill="#d8ecd0"/></g>)}</g>
    <g className={selected === "repeat" ? styles.emphasis : undefined}><path d="M530 280 A65 65 0 1 1 610 335" fill="none" stroke="#79b98c" strokeWidth="7"/><path d="M610 335 l-24 -4 12 -20z" fill="#79b98c"/><text x="530" y="300" fill="#bde1c6" fontSize="15">repeat</text></g>
  </svg>;
}

function Differential({ selected }: { selected: string }) {
  const nodes=[{id:"observe",x:70,w:110,label:"OBSERVE"},{id:"context",x:200,w:110,label:"CONTEXT"},{id:"rank",x:330,w:110,label:"RANK"},{id:"separate",x:460,w:120,label:"SEPARATE"},{id:"update",x:600,w:92,label:"UPDATE"}];
  return <svg viewBox="0 0 720 420" role="img" aria-label="Observation to differential diagnostic workflow">
    <rect width="720" height="420" rx="24" fill="#0d1c14"/>
    <path d="M100 130 H630" stroke="#506f58" strokeWidth="5"/>
    {nodes.map((n,i)=><g key={n.id} className={selected === n.id ? styles.emphasis : undefined}><rect x={n.x} y="95" width={n.w} height="70" rx="15" fill="#254431" stroke="#82b28e" strokeWidth="3"/><text x={n.x+14} y="137" fill="#d9eadc" fontSize="13">{n.label}</text>{i<nodes.length-1?<path d={`M${n.x+n.w} 130 l18 -10 v20z`} fill="#8fc49b"/>:null}</g>)}
    <g className={selected === "rank" ? styles.emphasis : undefined}>{["environment","root zone","nutrition","pest/pathogen","physical"].map((label,i)=><g key={label}><rect x={235+i*94} y={235+(i%2)*58} width="84" height="39" rx="9" fill="#1d3a2a" stroke="#608b6d"/><text x={244+i*94} y={259+(i%2)*58} fill="#b8d7c0" fontSize="10">{label}</text></g>)}</g>
    <path d="M646 168 Q690 245 625 320 Q540 382 450 336" fill="none" stroke="#6a9876" strokeWidth="4" strokeDasharray="9 8"/><text x="505" y="370" fill="#8fc39b" fontSize="13">new evidence updates ranking</text>
  </svg>;
}

function Graphic({ assetId, selected }: { assetId: string; selected: string }) {
  if(assetId === "atlas-rhizosphere-v1") return <Rhizosphere selected={selected}/>;
  if(assetId === "atlas-phloem-v1") return <Phloem selected={selected}/>;
  if(assetId === "atlas-pollen-pathway-v1") return <Pollen selected={selected}/>;
  if(assetId === "atlas-ppfd-overlay-v1") return <Ppfd selected={selected}/>;
  if(assetId === "atlas-trichome-sampling-v1") return <TrichomeSampling selected={selected}/>;
  return <Differential selected={selected}/>;
}

export function AtlasCrossSystemVisual({ assetId }: { assetId: string }) {
  const spec=specs[assetId];
  const [selected,setSelected]=useState(spec?.points[0]?.id ?? "");
  if(!spec) return null;
  const point=spec.points.find(item=>item.id===selected) ?? spec.points[0];
  return <div className={styles.shell}>
    <div className={styles.heading}><div><p>Interactive academic visual</p><h2>{spec.title}</h2><span>{spec.subtitle}</span></div></div>
    <div className={styles.graphic}><Graphic assetId={assetId} selected={selected}/></div>
    <div className={styles.controls} aria-label={`${spec.title} concepts`}>{spec.points.map(item=><button key={item.id} type="button" className={item.id===selected?styles.active:undefined} onClick={()=>setSelected(item.id)}>{item.label}</button>)}</div>
    <div className={styles.detail}><strong>{point.label}</strong><p>{point.detail}</p></div>
  </div>;
}
