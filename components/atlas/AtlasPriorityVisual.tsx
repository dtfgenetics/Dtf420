"use client";

import { useMemo, useState } from "react";
import styles from "./AtlasPriorityVisual.module.css";

type VisualPoint = {
  id: string;
  label: string;
  detail: string;
};

type VisualSpec = {
  title: string;
  subtitle: string;
  points: VisualPoint[];
};

const visualSpecs: Record<string, VisualSpec> = {
  "atlas-seed-anatomy-v1": {
    title: "Cannabis seed anatomy",
    subtitle: "Intact seed + simplified botanical cutaway",
    points: [
      { id: "coat", label: "Seed coat", detail: "Protective outer covering that limits mechanical injury and water loss before germination." },
      { id: "cotyledon", label: "Cotyledon tissue", detail: "Embryonic leaf tissue that supports the seedling during the earliest stage after emergence." },
      { id: "axis", label: "Embryo axis", detail: "The developing shoot-root axis connecting the embryonic tissues." },
      { id: "radicle", label: "Radicle", detail: "Embryonic root region that emerges first during normal germination." },
      { id: "micropyle", label: "Micropyle", detail: "Small opening associated with the ovule that remains visible on the mature seed surface." },
    ],
  },
  "atlas-root-architecture-v1": {
    title: "Root architecture",
    subtitle: "Whole root zone from crown to fine absorbing structures",
    points: [
      { id: "primary", label: "Primary axis", detail: "Main structural root axis established early in development." },
      { id: "lateral", label: "Lateral roots", detail: "Branches that expand exploration through the occupied substrate volume." },
      { id: "fine", label: "Fine roots", detail: "Young, highly branched roots that contribute strongly to water and ion uptake." },
      { id: "hairs", label: "Root-hair zone", detail: "Microscopic extensions increase contact with the surrounding substrate solution." },
      { id: "volume", label: "Occupied volume", detail: "Root distribution should be interpreted across the whole media profile, not from one exposed root." },
    ],
  },
  "atlas-healthy-leaf-baseline-v1": {
    title: "Healthy leaf baseline",
    subtitle: "Reference morphology before symptom interpretation",
    points: [
      { id: "leaflet", label: "Leaflet", detail: "Individual blade segment of the compound cannabis leaf." },
      { id: "serration", label: "Serrated margin", detail: "Toothed outer edge; margin shape varies with genetics and development." },
      { id: "midrib", label: "Midrib", detail: "Primary vein running through each leaflet." },
      { id: "veins", label: "Secondary veins", detail: "Branching vascular network distributing water and assimilates through the blade." },
      { id: "petiole", label: "Petiole", detail: "Stalk connecting the compound leaf to the stem." },
    ],
  },
  "atlas-female-flower-anatomy-v1": {
    title: "Female flower anatomy",
    subtitle: "Representative pistillate flower cluster",
    points: [
      { id: "bract", label: "Bract", detail: "Leaf-like floral structure surrounding the pistillate flower; avoid treating the whole bract as a calyx." },
      { id: "stigma", label: "Stigmas", detail: "Paired receptive structures extending from pistillate flowers." },
      { id: "cluster", label: "Flower cluster", detail: "Many small pistillate flowers compact together to create the visible inflorescence." },
      { id: "sugar", label: "Sugar leaf", detail: "Small leaf embedded within or projecting from the floral cluster." },
      { id: "resin", label: "Glandular surface", detail: "Trichome-rich floral surfaces; apparent frost alone is not a maturity measurement." },
    ],
  },
  "atlas-trichome-types-v1": {
    title: "Glandular trichome types",
    subtitle: "Relative morphology shown at intentionally different scales",
    points: [
      { id: "bulbous", label: "Bulbous", detail: "Very small glandular trichome form with limited elevation above the epidermis." },
      { id: "sessile", label: "Capitate-sessile", detail: "Glandular head positioned close to the epidermal surface on a short basal structure." },
      { id: "stalked", label: "Capitate-stalked", detail: "Prominent gland head elevated by a multicellular stalk; common on mature floral tissues." },
      { id: "head", label: "Gland head", detail: "Secretory disc and overlying cuticular storage space produce the visible rounded gland head." },
      { id: "scale", label: "Relative scale", detail: "These forms are not equal in size. Compare morphology only when magnification and scale are known." },
    ],
  },
};

export function isAtlasPriorityVisual(assetId: string) {
  return Boolean(visualSpecs[assetId]);
}

function SeedGraphic({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 430" role="img" aria-label="Cannabis seed anatomy cutaway diagram">
      <defs>
        <linearGradient id="seedShell" x1="0" x2="1">
          <stop offset="0" stopColor="#4e3d2b" />
          <stop offset="1" stopColor="#8b6b43" />
        </linearGradient>
      </defs>
      <rect width="720" height="430" rx="26" fill="#0e1d15" />
      <ellipse cx="210" cy="215" rx="105" ry="145" fill="url(#seedShell)" stroke="#b99362" strokeWidth="4" />
      <path d="M165 95 C230 130 250 315 165 340" fill="none" stroke="#d0af7b" strokeWidth="7" opacity=".55" />
      <ellipse cx="500" cy="215" rx="126" ry="154" fill="#c9ad74" stroke="#d5bd88" strokeWidth="5" />
      <path d="M446 105 C500 128 530 175 534 222 C538 276 512 315 465 336 C442 292 430 251 432 207 C434 166 439 132 446 105Z" fill="#a9c884" stroke="#dce8bd" strokeWidth="3" />
      <path d="M500 150 C514 189 511 236 491 283" fill="none" stroke="#7a9a55" strokeWidth="11" strokeLinecap="round" />
      <path d="M490 282 C477 299 468 314 462 333" fill="none" stroke="#eef5d7" strokeWidth="8" strokeLinecap="round" />
      <circle cx="582" cy="330" r="8" fill="#d4a26e" stroke="#fff1cf" strokeWidth="2" />
      <g className={selected === "coat" ? styles.emphasis : ""}><path d="M589 130 H655" stroke="#9dd2ad" strokeWidth="2"/><circle cx="590" cy="130" r="6" fill="#9dd2ad" /></g>
      <g className={selected === "cotyledon" ? styles.emphasis : ""}><path d="M445 160 H360" stroke="#9dd2ad" strokeWidth="2"/><circle cx="445" cy="160" r="6" fill="#9dd2ad" /></g>
      <g className={selected === "axis" ? styles.emphasis : ""}><path d="M500 215 H640" stroke="#9dd2ad" strokeWidth="2"/><circle cx="500" cy="215" r="6" fill="#9dd2ad" /></g>
      <g className={selected === "radicle" ? styles.emphasis : ""}><path d="M463 322 H350" stroke="#9dd2ad" strokeWidth="2"/><circle cx="463" cy="322" r="6" fill="#9dd2ad" /></g>
      <g className={selected === "micropyle" ? styles.emphasis : ""}><path d="M582 330 H668" stroke="#9dd2ad" strokeWidth="2"/><circle cx="582" cy="330" r="6" fill="#9dd2ad" /></g>
      <text x="115" y="390" fill="#d9eadf" fontSize="19">Intact seed</text>
      <text x="438" y="390" fill="#d9eadf" fontSize="19">Simplified cutaway</text>
    </svg>
  );
}

function RootGraphic({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 430" role="img" aria-label="Cannabis root architecture cutaway diagram">
      <rect width="720" height="430" rx="26" fill="#101e16" />
      <rect y="105" width="720" height="325" fill="#2c241a" />
      <path d="M0 105 C160 94 280 118 420 102 C560 88 620 102 720 96" fill="#234a2f" stroke="#6b9d73" strokeWidth="4" />
      <path d="M360 32 V106" stroke="#6d9f63" strokeWidth="22" strokeLinecap="round" />
      <path d="M360 106 C356 170 352 254 358 395" fill="none" stroke="#cbb88e" strokeWidth="13" strokeLinecap="round" className={selected === "primary" ? styles.emphasis : ""}/>
      {[
        [360,150,265,210],[360,180,455,238],[355,215,235,292],[357,255,490,330],[355,295,275,380],[355,330,455,405]
      ].map((r,i)=><path key={i} d={`M${r[0]} ${r[1]} C${(r[0]+r[2])/2} ${r[1]+18} ${(r[0]+r[2])/2} ${r[3]-12} ${r[2]} ${r[3]}`} fill="none" stroke="#d8c59c" strokeWidth="7" strokeLinecap="round" className={selected === "lateral" ? styles.emphasis : ""}/>) }
      {Array.from({length: 26}).map((_,i)=>{
        const x=235+(i%13)*20; const y=220+Math.floor(i/13)*75+(i%4)*8; return <path key={i} d={`M${x+110} ${y-50} C${x+40} ${y-25} ${x+20} ${y} ${x} ${y+30}`} fill="none" stroke="#ead9b6" strokeWidth="2.4" opacity=".88" className={selected === "fine" ? styles.emphasis : ""}/>;
      })}
      <g className={selected === "hairs" ? styles.emphasis : ""}>
        {Array.from({length: 16}).map((_,i)=><line key={i} x1={180+i*10} y1={350+(i%3)*5} x2={165+i*10} y2={370+(i%2)*8} stroke="#e9dfc7" strokeWidth="1.5" />)}
      </g>
      <rect x="48" y="135" width="118" height="250" rx="18" fill="none" stroke="#6da77a" strokeDasharray="8 8" className={selected === "volume" ? styles.emphasis : ""}/>
      <text x="62" y="160" fill="#91d3a7" fontSize="16">occupied</text><text x="62" y="180" fill="#91d3a7" fontSize="16">substrate</text><text x="62" y="200" fill="#91d3a7" fontSize="16">volume</text>
    </svg>
  );
}

function LeafGraphic({ selected }: { selected: string }) {
  const leaflets = [
    "360,205 332,62 372,126 360,205",
    "355,210 245,88 320,160 355,210",
    "355,215 170,155 306,194 355,215",
    "365,210 475,88 400,160 365,210",
    "365,215 550,155 414,194 365,215",
    "355,220 225,285 320,238 355,220",
    "365,220 495,285 400,238 365,220"
  ];
  return (
    <svg viewBox="0 0 720 430" role="img" aria-label="Healthy cannabis fan leaf reference diagram">
      <rect width="720" height="430" rx="26" fill="#0e1e15" />
      <line x1="360" y1="218" x2="360" y2="392" stroke="#7fa963" strokeWidth="11" strokeLinecap="round" className={selected === "petiole" ? styles.emphasis : ""}/>
      {leaflets.map((pts,i)=><polygon key={i} points={pts} fill={i%2 ? "#3f8c45":"#4c9a50"} stroke="#8bc47d" strokeWidth="3" className={selected === "leaflet" ? styles.emphasis : ""}/>)}
      <g className={selected === "midrib" ? styles.emphasis : ""}>{leaflets.map((_,i)=>{const ends=[[352,68],[250,95],[180,160],[468,95],[540,160],[235,278],[485,278]]; return <line key={i} x1="360" y1="214" x2={ends[i][0]} y2={ends[i][1]} stroke="#b3d99c" strokeWidth="2"/>})}</g>
      <g className={selected === "veins" ? styles.emphasis : ""}>{Array.from({length:18}).map((_,i)=><line key={i} x1={330+(i%6)*12} y1={170+(i%3)*22} x2={305+(i%6)*22} y2={140+(i%3)*34} stroke="#90bc7b" strokeWidth="1.2" opacity=".8"/>)}</g>
      <g className={selected === "serration" ? styles.emphasis : ""}><path d="M250 95 L264 107 L253 118 L269 129 L258 140 L278 149" fill="none" stroke="#d6efc1" strokeWidth="4" /></g>
      <circle cx="590" cy="135" r="76" fill="#173224" stroke="#75a87f" strokeWidth="3" />
      <path d="M535 150 C555 110 615 105 646 146 C618 178 560 182 535 150Z" fill="#497c4d" />
      <text x="530" y="232" fill="#9fd6ad" fontSize="16">underside detail</text>
    </svg>
  );
}

function FlowerGraphic({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 430" role="img" aria-label="Female cannabis flower anatomy diagram">
      <rect width="720" height="430" rx="26" fill="#0e1d15" />
      <path d="M360 400 C356 330 358 250 360 120" stroke="#57885b" strokeWidth="13" strokeLinecap="round" />
      {[[360,120],[325,165],[395,172],[310,220],[410,228],[330,275],[390,290]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx={48-(i%3)*5} ry={61-(i%2)*7} fill="#557a43" stroke="#8db16b" strokeWidth="3" className={selected === "cluster" ? styles.emphasis : ""}/>)}
      {Array.from({length:18}).map((_,i)=>{const x=310+(i%6)*20; const y=110+Math.floor(i/6)*80; return <path key={i} d={`M${x} ${y} C${x-25} ${y-25} ${x-35} ${y-45} ${x-48} ${y-60}`} fill="none" stroke="#f0e8d0" strokeWidth="3" strokeLinecap="round" className={selected === "stigma" ? styles.emphasis : ""}/>})}
      <g className={selected === "bract" ? styles.emphasis : ""}><path d="M330 245 C310 220 318 188 344 176 C365 198 363 227 348 249Z" fill="#73995b" stroke="#b6d08e" strokeWidth="3"/></g>
      <g className={selected === "sugar" ? styles.emphasis : ""}><path d="M393 255 L475 185 L430 278Z" fill="#3b8544" stroke="#87bd77" strokeWidth="3"/><path d="M330 310 L250 250 L300 334Z" fill="#3b8544" stroke="#87bd77" strokeWidth="3"/></g>
      <g className={selected === "resin" ? styles.emphasis : ""}>{Array.from({length:22}).map((_,i)=><circle key={i} cx={300+(i%7)*18} cy={150+Math.floor(i/7)*58} r="4" fill="#dff4ca" opacity=".9"/>)}</g>
      <text x="484" y="102" fill="#9fd6ad" fontSize="17">representative pistillate cluster</text>
    </svg>
  );
}

function TrichomeGraphic({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 430" role="img" aria-label="Comparison of cannabis glandular trichome types">
      <rect width="720" height="430" rx="26" fill="#0e1d15" />
      <line x1="65" y1="345" x2="655" y2="345" stroke="#5c7e66" strokeWidth="4" />
      <g className={selected === "bulbous" ? styles.emphasis : ""}><line x1="170" y1="340" x2="170" y2="315" stroke="#d4e6d9" strokeWidth="4"/><circle cx="170" cy="303" r="13" fill="#d9eddc" stroke="#8ab89a" strokeWidth="3"/></g>
      <g className={selected === "sessile" ? styles.emphasis : ""}><rect x="340" y="294" width="10" height="46" rx="5" fill="#c8ddd0"/><circle cx="345" cy="267" r="34" fill="#dff2e3" stroke="#8ab89a" strokeWidth="4"/></g>
      <g className={selected === "stalked" ? styles.emphasis : ""}><path d="M522 340 C525 285 528 230 530 160" stroke="#c9ddd0" strokeWidth="12" strokeLinecap="round"/><circle cx="530" cy="120" r="54" fill="#e2f2e5" stroke="#8ab89a" strokeWidth="5" className={selected === "head" ? styles.emphasis : ""}/><circle cx="530" cy="120" r="36" fill="#c6e1cc" opacity=".82"/></g>
      <g className={selected === "scale" ? styles.emphasis : ""}><line x1="116" y1="382" x2="584" y2="382" stroke="#9ad2aa" strokeWidth="2"/><path d="M116 374 V390 M584 374 V390" stroke="#9ad2aa" strokeWidth="2"/></g>
      <text x="132" y="410" fill="#9fd6ad" fontSize="16">bulbous</text><text x="294" y="410" fill="#9fd6ad" fontSize="16">capitate-sessile</text><text x="480" y="410" fill="#9fd6ad" fontSize="16">capitate-stalked</text>
    </svg>
  );
}

function VisualGraphic({ assetId, selected }: { assetId: string; selected: string }) {
  if (assetId === "atlas-seed-anatomy-v1") return <SeedGraphic selected={selected} />;
  if (assetId === "atlas-root-architecture-v1") return <RootGraphic selected={selected} />;
  if (assetId === "atlas-healthy-leaf-baseline-v1") return <LeafGraphic selected={selected} />;
  if (assetId === "atlas-female-flower-anatomy-v1") return <FlowerGraphic selected={selected} />;
  return <TrichomeGraphic selected={selected} />;
}

export function AtlasPriorityVisual({ assetId }: { assetId: string }) {
  const spec = visualSpecs[assetId];
  const [selectedId, setSelectedId] = useState(spec.points[0].id);
  const selected = useMemo(() => spec.points.find((point) => point.id === selectedId) ?? spec.points[0], [selectedId, spec.points]);

  return (
    <div className={styles.visualShell}>
      <div className={styles.visualHeader}>
        <div><p>Interactive academic visual · review build</p><h2>{spec.title}</h2><span>{spec.subtitle}</span></div>
        <small>Click a structure to inspect its role</small>
      </div>
      <div className={styles.visualGrid}>
        <div className={styles.figure}><VisualGraphic assetId={assetId} selected={selectedId} /></div>
        <aside className={styles.legend}>
          <div className={styles.pointList}>{spec.points.map((point, index) => <button key={point.id} type="button" className={point.id === selectedId ? styles.active : ""} onClick={() => setSelectedId(point.id)}><b>{String(index + 1).padStart(2, "0")}</b><span>{point.label}</span></button>)}</div>
          <div className={styles.detail}><p>Selected structure</p><h3>{selected.label}</h3><span>{selected.detail}</span></div>
        </aside>
      </div>
    </div>
  );
}
