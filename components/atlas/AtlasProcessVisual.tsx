"use client";

import { useMemo, useState } from "react";
import styles from "./AtlasPriorityVisual.module.css";

type ProcessPoint = { id: string; label: string; detail: string };
type ProcessSpec = { title: string; subtitle: string; points: ProcessPoint[] };

const processSpecs: Record<string, ProcessSpec> = {
  "atlas-root-absorption-v1": {
    title: "Root hairs & absorption",
    subtitle: "Water, dissolved ions, oxygen and root-surface exchange",
    points: [
      { id: "film", label: "Water film", detail: "Water occupies pore spaces and carries dissolved ions to the root surface." },
      { id: "hair", label: "Root hair", detail: "A short-lived epidermal extension that greatly increases contact with the surrounding solution." },
      { id: "membrane", label: "Cell membrane", detail: "Selective transport across membranes determines which ions enter living root cells." },
      { id: "oxygen", label: "Root-zone oxygen", detail: "Respiring root cells require oxygen; prolonged saturation can restrict gas exchange." },
      { id: "xylem", label: "Toward xylem", detail: "Water and ions move inward through root tissues before entering the vascular stream." },
    ],
  },
  "atlas-xylem-transport-v1": {
    title: "Xylem transport",
    subtitle: "Root-to-shoot movement driven through a continuous water column",
    points: [
      { id: "uptake", label: "Root uptake", detail: "Water enters roots from the substrate solution when plant and environmental conditions permit." },
      { id: "column", label: "Water column", detail: "Xylem conduits provide a low-resistance pathway from root to shoot." },
      { id: "cohesion", label: "Cohesion", detail: "Water molecules remain connected, helping transmit tension through the xylem stream." },
      { id: "transpiration", label: "Transpiration pull", detail: "Evaporation from leaves contributes to tension that draws water upward." },
      { id: "delivery", label: "Shoot delivery", detail: "Water and dissolved mineral nutrients reach expanding tissues and transpiring leaves." },
    ],
  },
  "atlas-stomata-transpiration-v1": {
    title: "Stomata & transpiration",
    subtitle: "Gas exchange and water loss at the leaf surface",
    points: [
      { id: "open", label: "Open pore", detail: "An open stomatal pore permits carbon dioxide diffusion inward while water vapor diffuses outward." },
      { id: "guard", label: "Guard cells", detail: "Guard-cell water status and signaling regulate pore opening rather than acting as a simple humidity switch." },
      { id: "co2", label: "CO₂ entry", detail: "Carbon dioxide diffuses toward photosynthetic tissues when concentration gradients and stomatal conductance allow." },
      { id: "vapor", label: "Water vapor", detail: "Water evaporates into internal leaf air spaces and exits through stomata." },
      { id: "vpd", label: "Vapor-pressure context", detail: "Temperature and humidity together influence the evaporative gradient; one number should not be optimized in isolation." },
    ],
  },
  "atlas-flower-development-v1": {
    title: "Flower development",
    subtitle: "Structural progression rather than fixed calendar-week assumptions",
    points: [
      { id: "initiation", label: "Initiation", detail: "Pistillate sites become evident as reproductive growth begins." },
      { id: "stacking", label: "Cluster expansion", detail: "Additional floral structures accumulate and visible inflorescences enlarge." },
      { id: "bracts", label: "Bract expansion", detail: "Bracts enlarge as flowers mature and contribute strongly to visible flower mass." },
      { id: "resin", label: "Resin development", detail: "Glandular trichome abundance and gland development increase across floral tissues." },
      { id: "maturation", label: "Maturation", detail: "Senescence, cultivar behavior, trichome condition and tissue health should be assessed together." },
    ],
  },
  "atlas-trichome-gland-v1": {
    title: "Trichome gland anatomy",
    subtitle: "Simplified capitate-stalked gland showing secretory and storage regions",
    points: [
      { id: "stalk", label: "Stalk", detail: "Multicellular support elevates the gland above the epidermal surface." },
      { id: "disc", label: "Secretory disc", detail: "Specialized cells at the top of the stalk synthesize and export metabolites." },
      { id: "cavity", label: "Subcuticular storage", detail: "Secretions accumulate beneath the cuticle and create the characteristic rounded gland head." },
      { id: "cuticle", label: "Cuticle", detail: "The outer cuticular layer expands as secretory products accumulate beneath it." },
      { id: "surface", label: "Epidermal surface", detail: "The gland originates from epidermal tissue and remains integrated with the plant surface." },
    ],
  },
};

export const atlasProcessVisualIds = Object.keys(processSpecs);

function RootAbsorption({ selected }: { selected: string }) {
  return <svg viewBox="0 0 720 430" role="img" aria-label="Root hair absorption process diagram">
    <rect width="720" height="430" rx="26" fill="#0e1d15"/><rect y="250" width="720" height="180" fill="#2a241c"/>
    {Array.from({length:24}).map((_,i)=><circle key={i} cx={40+(i%12)*58} cy={280+Math.floor(i/12)*85+(i%3)*8} r={8+(i%4)} fill="#574936" opacity=".8"/>)}
    <path d="M360 40 C352 110 350 190 360 390" fill="none" stroke="#d8c7a4" strokeWidth="24" strokeLinecap="round"/>
    <g className={selected==="hair"?styles.emphasis:""}>{Array.from({length:18}).map((_,i)=><line key={i} x1="350" y1={230+i*8} x2={255-(i%3)*18} y2={222+i*9} stroke="#eee0c3" strokeWidth="2.3"/>)}</g>
    <g className={selected==="film"?styles.emphasis:""}>{Array.from({length:18}).map((_,i)=><circle key={i} cx={210+(i%6)*26} cy={260+Math.floor(i/6)*34} r="7" fill="#69b8d7" opacity=".8"/>)}</g>
    <g className={selected==="oxygen"?styles.emphasis:""}><circle cx="520" cy="300" r="38" fill="#173d4c" stroke="#73c5de" strokeWidth="3"/><text x="498" y="308" fill="#c8eff9" fontSize="22">O₂</text></g>
    <g className={selected==="membrane"?styles.emphasis:""}><ellipse cx="360" cy="250" rx="34" ry="90" fill="none" stroke="#9ad2aa" strokeWidth="5"/></g>
    <g className={selected==="xylem"?styles.emphasis:""}><path d="M360 230 C390 190 410 145 420 90" fill="none" stroke="#6ab6d5" strokeWidth="7"/><path d="M420 90 l-9 18 h18z" fill="#6ab6d5"/></g>
  </svg>;
}

function XylemFlow({ selected }: { selected: string }) {
  return <svg viewBox="0 0 720 430" role="img" aria-label="Xylem water transport diagram">
    <rect width="720" height="430" rx="26" fill="#0e1d15"/><rect y="335" width="720" height="95" fill="#2a241c"/>
    <path d="M360 385 V105" stroke="#6d9160" strokeWidth="34" strokeLinecap="round"/><path d="M360 110 C300 88 250 66 205 55 M360 120 C420 95 470 70 520 52" stroke="#5f8d55" strokeWidth="16" fill="none" strokeLinecap="round"/>
    <g className={selected==="uptake"?styles.emphasis:""}><path d="M360 382 C312 370 280 384 248 412 M360 382 C414 368 450 388 478 414" stroke="#d5c49e" strokeWidth="8" fill="none"/></g>
    <g className={selected==="column"||selected==="cohesion"?styles.emphasis:""}>{[0,1,2].map(i=><path key={i} d={`M${346+i*14} 345 C${350+i*14} 275 ${347+i*14} 205 ${350+i*14} 135`} stroke="#72bfe0" strokeWidth="7" fill="none"/> )}</g>
    <g className={selected==="transpiration"?styles.emphasis:""}>{[[200,55],[520,52]].map(([x,y],i)=><g key={i}><path d={`M${x} ${y} C${x-15} ${y-18} ${x-25} ${y-35} ${x-32} ${y-54}`} stroke="#9fd7e8" strokeWidth="4" fill="none"/><circle cx={x-35} cy={y-62} r="8" fill="#a8deed"/></g>)}</g>
    <g className={selected==="delivery"?styles.emphasis:""}><circle cx="205" cy="55" r="30" fill="#3f8847"/><circle cx="520" cy="52" r="30" fill="#3f8847"/></g>
  </svg>;
}

function Stomata({ selected }: { selected: string }) {
  return <svg viewBox="0 0 720 430" role="img" aria-label="Stomatal gas exchange and transpiration diagram">
    <rect width="720" height="430" rx="26" fill="#0e1d15"/>
    <rect x="85" y="260" width="550" height="90" rx="45" fill="#3d7041" stroke="#79a970" strokeWidth="4"/>
    <g className={selected==="guard"?styles.emphasis:""}><ellipse cx="315" cy="305" rx="68" ry="35" fill="#79a967" transform="rotate(-18 315 305)"/><ellipse cx="405" cy="305" rx="68" ry="35" fill="#79a967" transform="rotate(18 405 305)"/></g>
    <g className={selected==="open"?styles.emphasis:""}><ellipse cx="360" cy="305" rx="27" ry="50" fill="#0b1911" stroke="#b9d8a9" strokeWidth="3"/></g>
    <g className={selected==="co2"?styles.emphasis:""}>{[0,1,2].map(i=><g key={i}><circle cx={255+i*28} cy={120+i*10} r="14" fill="#99d3a8"/><text x={244+i*28} y={126+i*10} fill="#0b1911" fontSize="12">CO₂</text><path d={`M${267+i*28} ${135+i*10} C${290+i*20} 180 ${320+i*15} 225 345 265`} stroke="#99d3a8" strokeWidth="3" fill="none"/></g>)}</g>
    <g className={selected==="vapor"?styles.emphasis:""}>{[0,1,2].map(i=><path key={i} d={`M${370+i*22} 270 C${405+i*16} 220 ${430+i*20} 165 ${448+i*25} 120`} stroke="#76c5e0" strokeWidth="4" fill="none"/>)}</g>
    <g className={selected==="vpd"?styles.emphasis:""}><rect x="500" y="45" width="145" height="68" rx="14" fill="#17362a" stroke="#83bb91" strokeWidth="2"/><text x="522" y="72" fill="#bfe1c7" fontSize="16">temperature + RH</text><text x="531" y="94" fill="#8fcda1" fontSize="15">shape vapor gradient</text></g>
  </svg>;
}

function FlowerProgress({ selected }: { selected: string }) {
  const stages=[{id:"initiation",x:90,n:2},{id:"stacking",x:220,n:4},{id:"bracts",x:355,n:6},{id:"resin",x:495,n:7},{id:"maturation",x:625,n:8}];
  return <svg viewBox="0 0 720 430" role="img" aria-label="Female flower structural development sequence">
    <rect width="720" height="430" rx="26" fill="#0e1d15"/><line x1="65" y1="340" x2="660" y2="340" stroke="#557961" strokeWidth="4"/>
    {stages.map((s,index)=><g key={s.id} className={selected===s.id?styles.emphasis:""}><line x1={s.x} y1="335" x2={s.x} y2={220-index*18} stroke="#61845e" strokeWidth="9"/>{Array.from({length:s.n}).map((_,i)=><ellipse key={i} cx={s.x+(i%2?12:-12)} cy={310-i*24} rx={13+index*2} ry={18+index*3} fill="#637f49" stroke="#9db17a" strokeWidth="2"/>)}{index>1?Array.from({length:index+2}).map((_,i)=><circle key={i} cx={s.x-18+i*8} cy={230+i*7} r="3" fill="#dff3cd"/>):null}<text x={s.x-35} y="382" fill="#a2d9b1" fontSize="14">{index+1}</text></g>)}
  </svg>;
}

function TrichomeGland({ selected }: { selected: string }) {
  return <svg viewBox="0 0 720 430" role="img" aria-label="Capitate-stalked trichome gland anatomy diagram">
    <rect width="720" height="430" rx="26" fill="#0e1d15"/><rect x="80" y="345" width="560" height="45" rx="20" fill="#35543e" className={selected==="surface"?styles.emphasis:""}/>
    <path d="M360 350 C350 300 349 245 355 188" stroke="#c6dbcb" strokeWidth="35" strokeLinecap="round" className={selected==="stalk"?styles.emphasis:""}/>
    <g className={selected==="disc"?styles.emphasis:""}><ellipse cx="360" cy="175" rx="78" ry="28" fill="#9ac3a3" stroke="#d5e8d9" strokeWidth="3"/></g>
    <g className={selected==="cavity"?styles.emphasis:""}><ellipse cx="360" cy="120" rx="112" ry="92" fill="#b8dec0" opacity=".62" stroke="#dff2e2" strokeWidth="4"/></g>
    <g className={selected==="cuticle"?styles.emphasis:""}><ellipse cx="360" cy="120" rx="118" ry="98" fill="none" stroke="#eff8ee" strokeWidth="8"/></g>
    {Array.from({length:16}).map((_,i)=><circle key={i} cx={315+(i%4)*30} cy={78+Math.floor(i/4)*26} r="7" fill="#7fb18a" opacity=".82"/>)}
  </svg>;
}

function ProcessGraphic({ assetId, selected }: { assetId: string; selected: string }) {
  if(assetId==="atlas-root-absorption-v1") return <RootAbsorption selected={selected}/>;
  if(assetId==="atlas-xylem-transport-v1") return <XylemFlow selected={selected}/>;
  if(assetId==="atlas-stomata-transpiration-v1") return <Stomata selected={selected}/>;
  if(assetId==="atlas-flower-development-v1") return <FlowerProgress selected={selected}/>;
  return <TrichomeGland selected={selected}/>;
}

export function AtlasProcessVisual({ assetId }: { assetId: string }) {
  const spec=processSpecs[assetId];
  const [selectedId,setSelectedId]=useState(spec.points[0].id);
  const selected=useMemo(()=>spec.points.find(point=>point.id===selectedId)??spec.points[0],[selectedId,spec.points]);
  return <div className={styles.visualShell}>
    <div className={styles.visualHeader}><div><p>Interactive physiology visual · review build</p><h2>{spec.title}</h2><span>{spec.subtitle}</span></div><small>Select a step to inspect the process</small></div>
    <div className={styles.visualGrid}><div className={styles.figure}><ProcessGraphic assetId={assetId} selected={selectedId}/></div><aside className={styles.legend}><div className={styles.pointList}>{spec.points.map((point,index)=><button key={point.id} type="button" className={point.id===selectedId?styles.active:""} onClick={()=>setSelectedId(point.id)}><b>{String(index+1).padStart(2,"0")}</b><span>{point.label}</span></button>)}</div><div className={styles.detail}><p>Selected process</p><h3>{selected.label}</h3><span>{selected.detail}</span></div></aside></div>
  </div>;
}
