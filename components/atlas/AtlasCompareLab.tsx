"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./AtlasCompareLab.module.css";

type CompareSide = {
  label: string;
  summary: string;
  signals: string[];
  measure: string;
  href: string;
  linkLabel: string;
};

type CompareTopic = {
  id: string;
  title: string;
  question: string;
  left: CompareSide;
  right: CompareSide;
  shared: string[];
  caution: string;
};

const topics: CompareTopic[] = [
  {
    id: "roots",
    title: "Healthy roots vs root stress",
    question: "Which observations separate vigorous root growth from a stressed root zone?",
    left: {
      label: "Healthy root pattern",
      summary: "Active tips, branching, and even exploration indicate a root system with access to water, oxygen, and usable pore space.",
      signals: [
        "New root tips are intact and actively extending.",
        "Fine laterals expand through more than one media zone.",
        "Roots remain structurally firm rather than sloughing or collapsing.",
        "Moisture distribution supports both hydration and gas exchange.",
      ],
      measure: "Check root-zone moisture distribution, temperature, pH, EC, and recent irrigation behavior.",
      href: "/learn/atlas/root-system/root-architecture",
      linkLabel: "Open root architecture",
    },
    right: {
      label: "Root stress pattern",
      summary: "Loss of active tips, sparse branching, discoloration, or tissue breakdown becomes more meaningful when it aligns with root-zone measurements.",
      signals: [
        "New tips stop extending or appear damaged.",
        "Branching becomes sparse relative to the occupied media volume.",
        "Tissue darkening, translucency, sloughing, or odor may accompany severe stress.",
        "Persistent saturation or severe dryback can both disrupt root function.",
      ],
      measure: "Measure the root environment before assigning a nutrient or pathogen explanation.",
      href: "/learn/atlas/root-system/root-stress",
      linkLabel: "Open root stress",
    },
    shared: [
      "Root color alone is not a diagnosis; media, amendments, staining, and age can change appearance.",
      "Compare new tips with older roots and inspect more than one location in the container.",
      "Root-zone measurements should be interpreted using a consistent substrate-appropriate method.",
    ],
    caution: "A healthy-looking canopy can temporarily hide declining roots, while recently transplanted roots can look sparse without being unhealthy.",
  },
  {
    id: "transport",
    title: "Xylem vs phloem",
    question: "How do the plant's two major long-distance transport systems differ?",
    left: {
      label: "Xylem",
      summary: "Xylem conducts water and dissolved mineral nutrients through specialized vascular tissues, with canopy water loss helping drive upward flow.",
      signals: [
        "Connects root water uptake to stems, leaves, and expanding tissues.",
        "Carries water and many dissolved mineral ions.",
        "Flow is strongly coupled to transpiration and hydraulic continuity.",
        "Loss of vascular continuity can rapidly affect tissues above an injury.",
      ],
      measure: "Relate root water availability, leaf temperature, atmospheric demand, and vascular injury.",
      href: "/learn/atlas/stem-vascular/xylem-and-water-flow",
      linkLabel: "Open xylem lesson",
    },
    right: {
      label: "Phloem",
      summary: "Phloem redistributes sugars and other transported compounds from source tissues toward active sinks that are using or storing resources.",
      signals: [
        "Links photosynthetic source tissues with growing or storage sinks.",
        "Transport direction depends on source-sink relationships rather than a permanent top-to-bottom rule.",
        "Young shoots, roots, flowers, and developing seeds can act as strong sinks.",
        "Source and sink roles can change with development and plant condition.",
      ],
      measure: "Interpret growth demand, source leaf condition, developmental stage, and recent tissue damage together.",
      href: "/learn/atlas/stem-vascular/phloem-and-source-sink-flow",
      linkLabel: "Open phloem lesson",
    },
    shared: [
      "Xylem and phloem are neighboring vascular systems but move different materials under different driving forces.",
      "Both depend on living plant context; a transport diagram is a model, not a pipe-plumbing analogy.",
      "Damage at the stem can affect water delivery, assimilate movement, structural support, or several functions at once.",
    ],
    caution: "Avoid memorizing phloem as simply 'downward.' Source-to-sink transport can occur in different directions in different sieve tubes.",
  },
  {
    id: "sex",
    title: "Female vs male preflowers",
    question: "Which reproductive structures should be compared before assigning plant sex?",
    left: {
      label: "Pistillate preflower",
      summary: "A pistillate preflower develops a small bract-associated flower with receptive stigmatic structures emerging from it.",
      signals: [
        "Inspect the node where the branch and main stem meet.",
        "Look for a compact pistillate floral structure rather than leaf stipules alone.",
        "Paired stigmas are a strong visible clue when present.",
        "Confirm the pattern at more than one node as reproductive development progresses.",
      ],
      measure: "Record node location and developmental timing rather than judging from one immature structure.",
      href: "/learn/atlas/sex-pollen-seed/male-vs-female-preflowers",
      linkLabel: "Open preflower comparison",
    },
    right: {
      label: "Staminate preflower",
      summary: "A staminate preflower develops rounded pollen-producing structures that become more obvious as male inflorescences expand.",
      signals: [
        "Young pollen sacs are typically rounded and lack paired stigmas.",
        "Multiple developing sacs can form as the staminate inflorescence expands.",
        "Very early structures can be ambiguous before their morphology is developed.",
        "Mixed-sex expression requires inspecting the whole plant, not one node.",
      ],
      measure: "Recheck uncertain nodes over time and inspect multiple branches before acting on an identification.",
      href: "/learn/atlas/sex-pollen-seed/mixed-sex-expression",
      linkLabel: "Open mixed-sex expression",
    },
    shared: [
      "Stipules are normal vegetative structures and should not be used alone to determine sex.",
      "Developmental stage changes how obvious reproductive structures appear.",
      "Mixed or intersex expression can place different reproductive structures on the same plant.",
    ],
    caution: "Do not make a high-consequence decision from one blurry or immature node. Confirm morphology across time and locations.",
  },
  {
    id: "symptom-location",
    title: "New growth vs old growth symptoms",
    question: "Why does symptom age and canopy location matter before naming a deficiency or disorder?",
    left: {
      label: "New-growth pattern",
      summary: "Symptoms concentrated in the newest expanding tissues narrow the differential differently than symptoms beginning in older leaves.",
      signals: [
        "Inspect the shoot tip and recently expanded leaves separately from the mature canopy.",
        "Record whether distortion appears before or after visible discoloration.",
        "Compare several active growing tips for consistency.",
        "Check environmental or root events that could affect newly developing tissue.",
      ],
      measure: "Document new-leaf color, shape, expansion, recent pH/EC trends, root condition, and environmental changes.",
      href: "/learn/atlas/diagnostic-overlay/symptom-location",
      linkLabel: "Open symptom location",
    },
    right: {
      label: "Older-growth pattern",
      summary: "Symptoms beginning on older leaves create a different diagnostic pattern, especially when lower-canopy tissue changes before active new growth.",
      signals: [
        "Identify whether the oldest leaves or simply shaded leaves are affected first.",
        "Separate normal senescence from a progressing whole-plant problem.",
        "Map whether discoloration follows veins, margins, tips, spots, or uniform tissue.",
        "Track whether the pattern moves upward over time.",
      ],
      measure: "Record canopy position, leaf age, symptom progression, feed/root-zone data, and recent plant stage changes.",
      href: "/learn/atlas/diagnostic-overlay/symptom-progression",
      linkLabel: "Open symptom progression",
    },
    shared: [
      "Location is a clue, not a complete diagnosis.",
      "Nutrient mobility can help organize a differential, but root injury, pH, salinity, pests, disease, light, and environment can imitate nutrient patterns.",
      "Photograph the same plant regions over time so progression is evidence rather than memory.",
    ],
    caution: "A single yellow leaf has low diagnostic value. Pattern, distribution, progression, plant stage, and measurements are much stronger evidence together.",
  },
  {
    id: "airflow",
    title: "Thick vs thin boundary layer",
    question: "How does airflow around a leaf alter the small layer of air immediately next to its surface?",
    left: {
      label: "Thicker boundary layer",
      summary: "Still air allows a thicker near-leaf boundary layer to persist, increasing resistance to heat, water-vapor, and gas exchange.",
      signals: [
        "Air immediately beside the leaf changes more slowly than room air.",
        "Leaf temperature can diverge from measured room temperature.",
        "Local humidity around dense foliage can differ from a sensor several feet away.",
        "Crowded canopies create many overlapping low-air-movement zones.",
      ],
      measure: "Compare canopy-level air movement, leaf temperature, RH placement, and canopy density.",
      href: "/learn/atlas/environment-overlay/airflow-and-boundary-layer",
      linkLabel: "Open airflow lesson",
    },
    right: {
      label: "Thinner boundary layer",
      summary: "Moderate air movement reduces boundary-layer thickness and improves exchange between the leaf surface and surrounding air.",
      signals: [
        "Leaf-surface conditions track the surrounding air more closely.",
        "Convective heat transfer increases as air moves across leaves.",
        "Water-vapor removal from the leaf surface becomes less boundary-layer limited.",
        "Excessive direct airflow can create mechanical or desiccation stress instead of additional benefit.",
      ],
      measure: "Evaluate actual leaf movement, air speed distribution, leaf temperature, and signs of localized wind stress.",
      href: "/learn/atlas/environment-overlay/temperature-and-humidity",
      linkLabel: "Open temperature & humidity",
    },
    shared: [
      "The useful target is distributed air exchange, not maximum fan speed.",
      "Room sensors do not perfectly represent the microclimate inside a dense canopy.",
      "Airflow interacts with temperature, RH, VPD, stomatal behavior, and root water supply.",
    ],
    caution: "Strong fan blast on one plant can coexist with stagnant pockets elsewhere. Evaluate distribution across the canopy.",
  },
  {
    id: "trichomes",
    title: "Clear vs cloudy trichome appearance",
    question: "What can visible gland-head appearance tell you, and what can it not tell you?",
    left: {
      label: "More transparent appearance",
      summary: "A more transparent gland head allows more background light to pass through, but apparent clarity changes with optics, focus, lighting, and sampling location.",
      signals: [
        "Use consistent magnification and illumination before comparing samples.",
        "Focus on glandular heads rather than surrounding non-glandular hairs.",
        "Sample comparable floral tissue rather than mixing sugar leaves and bracts.",
        "Compare multiple representative sites rather than one photogenic gland.",
      ],
      measure: "Standardize magnification, light direction, tissue type, and sample location before estimating appearance distribution.",
      href: "/learn/atlas/trichomes-resin/clear-cloudy-amber-appearance",
      linkLabel: "Open appearance lesson",
    },
    right: {
      label: "More opaque appearance",
      summary: "An apparently cloudy or opaque gland head scatters light differently, but the visual category remains an observation rather than a direct chemical assay.",
      signals: [
        "Judge a population of glands rather than one head.",
        "Dirty optics, overexposure, and glare can create false opacity.",
        "Different tissue locations can mature at different rates.",
        "Ambering can reflect developmental change, oxidation, damage, or sampling context.",
      ],
      measure: "Record the distribution of appearances across standardized sample sites and relate it to whole-flower development.",
      href: "/learn/atlas/trichomes-resin/microscope-workflow",
      linkLabel: "Open microscope workflow",
    },
    shared: [
      "Visible trichome appearance is useful developmental evidence but is not a cannabinoid-potency test.",
      "Sampling method can change the conclusion as much as the microscope itself.",
      "Flower structure, cultivar behavior, tissue health, and whole-plant maturity belong in the interpretation.",
    ],
    caution: "Do not turn a clear/cloudy/amber visual estimate into a precise chemistry claim without analytical testing.",
  },
];

function CompareGraphic({ topicId, side }: { topicId: string; side: "left" | "right" }) {
  const right = side === "right";

  if (topicId === "transport") {
    return (
      <svg viewBox="0 0 420 240" role="img" aria-label={right ? "Phloem source to sink diagram" : "Xylem root to shoot diagram"}>
        <rect width="420" height="240" rx="22" fill="#0b1912" />
        <path d="M210 205 V64" stroke="#638e60" strokeWidth="24" strokeLinecap="round" />
        <path d="M210 72 Q155 50 115 38 M210 76 Q270 52 310 40" stroke="#638e60" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M210 202 Q160 214 125 228 M210 202 Q260 214 300 228" stroke="#c8b993" strokeWidth="8" fill="none" />
        {right ? (
          <>
            <circle cx="112" cy="38" r="22" fill="#477f45" />
            <path d="M132 50 C170 86 178 128 192 178" stroke="#d8a85f" strokeWidth="7" fill="none" strokeDasharray="9 7" />
            <path d="M190 180 l-12 -12 h24z" fill="#d8a85f" />
            <text x="32" y="34" fill="#b9ddb9" fontSize="14">source leaf</text>
            <text x="246" y="211" fill="#e0c48c" fontSize="14">active sink</text>
          </>
        ) : (
          <>
            <path d="M194 194 C192 150 195 110 198 70" stroke="#72c0df" strokeWidth="7" fill="none" />
            <path d="M198 65 l-11 18 h22z" fill="#72c0df" />
            <circle cx="126" cy="220" r="8" fill="#72c0df" />
            <text x="24" y="212" fill="#a8ddec" fontSize="14">water uptake</text>
            <text x="244" y="76" fill="#a8ddec" fontSize="14">shoot delivery</text>
          </>
        )}
      </svg>
    );
  }

  if (topicId === "sex") {
    return (
      <svg viewBox="0 0 420 240" role="img" aria-label={right ? "Staminate preflower diagram" : "Pistillate preflower diagram"}>
        <rect width="420" height="240" rx="22" fill="#0b1912" />
        <path d="M210 220 V52" stroke="#638e60" strokeWidth="18" strokeLinecap="round" />
        <path d="M210 118 L118 82 M210 118 L306 84" stroke="#638e60" strokeWidth="11" strokeLinecap="round" />
        {right ? (
          <g>
            {[0, 1, 2, 3].map((i) => <g key={i}><line x1={223 + i * 12} y1={112 - i * 5} x2={248 + i * 14} y2={135 + i * 3} stroke="#789e62" strokeWidth="5" /><circle cx={254 + i * 14} cy={140 + i * 3} r="13" fill="#8da76c" stroke="#c5d29a" strokeWidth="2" /></g>)}
            <text x="250" y="204" fill="#c8dfa7" fontSize="15">developing pollen sacs</text>
          </g>
        ) : (
          <g>
            <path d="M230 126 C242 108 260 108 270 128 C258 148 241 151 230 126z" fill="#72925c" stroke="#bdd09a" strokeWidth="3" />
            <path d="M256 116 C260 90 273 72 281 53 M260 118 C277 93 292 83 303 66" stroke="#ebe4cf" strokeWidth="4" fill="none" strokeLinecap="round" />
            <text x="245" y="204" fill="#d9e6c0" fontSize="15">pistillate structure + stigmas</text>
          </g>
        )}
      </svg>
    );
  }

  if (topicId === "airflow") {
    return (
      <svg viewBox="0 0 420 240" role="img" aria-label={right ? "Thin leaf boundary layer diagram" : "Thick leaf boundary layer diagram"}>
        <rect width="420" height="240" rx="22" fill="#0b1912" />
        <path d="M62 152 Q205 85 355 142 Q235 205 62 152z" fill="#477c43" stroke="#80ad70" strokeWidth="4" />
        <path d="M82 151 Q210 132 338 143" stroke="#b6d09d" strokeWidth="4" fill="none" />
        <path d="M48 150 Q205 56 370 140" stroke="#73b8d2" strokeWidth={right ? 6 : 22} fill="none" opacity={right ? 0.62 : 0.28} />
        {right ? [0, 1, 2].map((i) => <path key={i} d={`M35 ${55 + i * 32} C115 ${46 + i * 28} 182 ${72 + i * 21} 250 ${66 + i * 28}`} stroke="#8bd3e7" strokeWidth="5" fill="none" />) : null}
        <text x="102" y="222" fill="#a7d5b1" fontSize="15">{right ? "moderate moving air" : "still-air microclimate"}</text>
      </svg>
    );
  }

  if (topicId === "trichomes") {
    return (
      <svg viewBox="0 0 420 240" role="img" aria-label={right ? "Opaque glandular trichomes" : "Transparent glandular trichomes"}>
        <rect width="420" height="240" rx="22" fill="#0b1912" />
        <line x1="50" y1="205" x2="370" y2="205" stroke="#416248" strokeWidth="5" />
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 82 + i * 64;
          return <g key={i}><path d={`M${x} 202 C${x - 2} 165 ${x + 3} 132 ${x} 102`} stroke="#cfe0d4" strokeWidth="8" strokeLinecap="round" /><circle cx={x} cy="77" r="31" fill={right ? "#d5e2d5" : "rgba(220,241,225,.22)"} stroke="#dceee0" strokeWidth="4" /></g>;
        })}
        <text x="100" y="31" fill="#b9dec2" fontSize="15">same magnification · standardized sample</text>
      </svg>
    );
  }

  if (topicId === "symptom-location") {
    return (
      <svg viewBox="0 0 420 240" role="img" aria-label={right ? "Older growth symptom location" : "New growth symptom location"}>
        <rect width="420" height="240" rx="22" fill="#0b1912" />
        <path d="M210 218 V42" stroke="#668f60" strokeWidth="14" strokeLinecap="round" />
        {[62, 96, 132, 168].map((y, i) => <g key={y}><path d={`M210 ${y} Q${150 - i * 5} ${y - 15} ${105 - i * 8} ${y + 8}`} stroke="#56834f" strokeWidth="9" fill="none" /><path d={`M210 ${y} Q${270 + i * 5} ${y - 15} ${315 + i * 8} ${y + 8}`} stroke="#56834f" strokeWidth="9" fill="none" /><ellipse cx={97 - i * 8} cy={y + 10} rx="28" ry="13" fill={(!right && i === 0) || (right && i >= 2) ? "#c6bd5f" : "#4d8948"} /><ellipse cx={323 + i * 8} cy={y + 10} rx="28" ry="13" fill={(!right && i === 0) || (right && i >= 2) ? "#c6bd5f" : "#4d8948"} /></g>)}
        <text x="126" y="232" fill="#bad7ad" fontSize="15">{right ? "older / lower tissue first" : "newest tissue first"}</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 420 240" role="img" aria-label={right ? "Root stress pattern diagram" : "Healthy root pattern diagram"}>
      <rect width="420" height="240" rx="22" fill="#0b1912" />
      <rect y="62" width="420" height="178" fill="#2c251c" />
      <path d="M210 22 V72" stroke="#678e5f" strokeWidth="18" strokeLinecap="round" />
      <path d="M210 68 C205 116 208 162 210 226" stroke={right ? "#8f6e55" : "#ddcfaa"} strokeWidth="12" fill="none" strokeLinecap="round" />
      {right ? (
        <>
          <path d="M210 118 C175 138 154 158 140 188 M208 147 C247 164 265 183 281 205" stroke="#8d725b" strokeWidth="5" fill="none" />
          <ellipse cx="306" cy="178" rx="68" ry="42" fill="rgba(74,126,151,.35)" stroke="#5f9fbb" strokeWidth="2" />
          <text x="258" y="184" fill="#a9d5e4" fontSize="14">persistent saturation</text>
        </>
      ) : (
        <>
          {[[210, 102, 146, 136], [210, 126, 280, 160], [208, 150, 128, 202], [210, 174, 294, 218]].map((r, i) => <path key={i} d={`M${r[0]} ${r[1]} C${(r[0] + r[2]) / 2} ${r[1] + 10} ${(r[0] + r[2]) / 2} ${r[3] - 9} ${r[2]} ${r[3]}`} stroke="#e1d5b7" strokeWidth="5" fill="none" />)}
          {Array.from({ length: 18 }).map((_, i) => <path key={i} d={`M${130 + (i % 6) * 28} ${160 + Math.floor(i / 6) * 22} q${i % 2 ? 24 : -22} 12 ${i % 2 ? 35 : -34} 28`} stroke="#eadfc5" strokeWidth="1.8" fill="none" />)}
        </>
      )}
    </svg>
  );
}

export function AtlasCompareLab() {
  const [activeId, setActiveId] = useState(topics[0].id);
  const active = useMemo(() => topics.find((topic) => topic.id === activeId) ?? topics[0], [activeId]);

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <h1>Compare & Contrast</h1>
          <p>Study two related plant patterns side by side, then use the shared evidence and measurement prompts to understand what actually separates them.</p>
        </div>
        <Link href="/learn/atlas">Back to Living Plant Atlas</Link>
      </header>

      <nav className={styles.topicNav} aria-label="Atlas comparison topics">
        {topics.map((topic) => (
          <button key={topic.id} type="button" className={topic.id === active.id ? styles.activeTopic : undefined} onClick={() => setActiveId(topic.id)}>
            {topic.title}
          </button>
        ))}
      </nav>

      <section className={styles.question} aria-live="polite">
        <h2>{active.title}</h2>
        <p>{active.question}</p>
      </section>

      <section className={styles.compareGrid} aria-label={`${active.title} comparison`}>
        {(["left", "right"] as const).map((sideName) => {
          const side = active[sideName];
          return (
            <article key={sideName} className={styles.side}>
              <CompareGraphic topicId={active.id} side={sideName} />
              <div className={styles.sideBody}>
                <h3>{side.label}</h3>
                <p>{side.summary}</p>
                <ul>{side.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
                <div className={styles.measure}><strong>Measure next</strong><span>{side.measure}</span></div>
                <Link href={side.href}>{side.linkLabel}</Link>
              </div>
            </article>
          );
        })}
      </section>

      <section className={styles.shared}>
        <div>
          <h2>What both sides have in common</h2>
          <div>{active.shared.map((item, index) => <p key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span></p>)}</div>
        </div>
        <aside>
          <h3>Interpretation guardrail</h3>
          <p>{active.caution}</p>
        </aside>
      </section>
    </div>
  );
}
