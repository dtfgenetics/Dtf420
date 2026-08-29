"use client";

import { useMemo, useState } from "react";
import styles from "./AtlasPriorityVisual.module.css";

type VisualPoint = {
  id: string;
  label: string;
  detail: string;
};

const points: VisualPoint[] = [
  {
    id: "achene",
    label: "Achene (whole planted unit)",
    detail:
      "The object growers commonly call a cannabis seed is botanically a dry, indehiscent, one-seeded fruit: an achene. Everyday cultivation can still use the familiar word seed when the fruit–seed distinction is not important.",
  },
  {
    id: "pericarp",
    label: "Pericarp / fruit wall",
    detail:
      "The visible protective shell includes the pericarp, which develops from the ovary wall. It is fruit tissue and must not be labeled as if the whole shell were the true seed coat.",
  },
  {
    id: "seedcoat",
    label: "True seed + seed coat",
    detail:
      "Inside the pericarp is the true seed. Its comparatively thin seed coat is distinct from the surrounding fruit wall.",
  },
  {
    id: "endosperm",
    label: "Residual peripheral endosperm",
    detail:
      "A limited residual endosperm persists around part of the mature seed. The embryo occupies most of the true seed; cannabis does not have a large cereal-like endosperm mass.",
  },
  {
    id: "cotyledons",
    label: "Two cotyledons",
    detail:
      "The curved embryo contains two cotyledons. They hold substantial reserves that support early development and later become photosynthetically active after emergence.",
  },
  {
    id: "radicle",
    label: "Radicle + hypocotyl region",
    detail:
      "The radicle is the embryonic root axis. It connects through the hypocotyl region to the rest of the embryo and normally emerges first during germination.",
  },
  {
    id: "plumule",
    label: "Plumule / shoot region",
    detail:
      "The plumule or shoot region contains the embryonic shoot apex and early leaf structures.",
  },
  {
    id: "stylar",
    label: "Stylar end",
    detail:
      "Cannabis anatomy studies place the radicle toward the stylar end in the material examined. This is anatomical context, not a universal planting-direction rule.",
  },
];

function AcheneGraphic({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 820 500" role="img" aria-labelledby="achene-title achene-desc">
      <title id="achene-title">Cannabis achene and true seed anatomy</title>
      <desc id="achene-desc">
        Exterior cannabis achene beside a schematic longitudinal cutaway showing the pericarp, true seed, thin seed coat, small residual peripheral endosperm, two cotyledons, radicle, hypocotyl region, plumule, and stylar end.
      </desc>
      <defs>
        <linearGradient id="acheneShell" x1="0" x2="1">
          <stop offset="0" stopColor="#493827" />
          <stop offset="0.55" stopColor="#7b5d3d" />
          <stop offset="1" stopColor="#a3845c" />
        </linearGradient>
        <linearGradient id="cotyledonFill" x1="0" x2="1">
          <stop offset="0" stopColor="#879b62" />
          <stop offset="1" stopColor="#b4c58b" />
        </linearGradient>
      </defs>

      <rect width="820" height="500" rx="26" fill="#0e1d15" />

      <text x="52" y="48" fill="#dcebe0" fontSize="20" fontWeight="700">Exterior</text>
      <text x="404" y="48" fill="#dcebe0" fontSize="20" fontWeight="700">Longitudinal cutaway</text>

      <g className={selected === "achene" ? styles.emphasis : ""}>
        <ellipse cx="190" cy="244" rx="112" ry="157" fill="url(#acheneShell)" stroke="#c4a676" strokeWidth="4" />
        <path d="M138 112 C196 136 225 186 231 245 C237 308 209 348 151 374" fill="none" stroke="#d7b987" strokeWidth="7" opacity=".48" />
        <path d="M232 128 C203 158 194 193 197 226" fill="none" stroke="#4d3828" strokeWidth="5" opacity=".65" />
      </g>

      <g className={selected === "stylar" ? styles.emphasis : ""}>
        <circle cx="190" cy="397" r="7" fill="#e6c996" />
        <path d="M190 397 V432" stroke="#9dd2ad" strokeWidth="2" />
        <text x="145" y="455" fill="#b9d8c3" fontSize="15">stylar end</text>
      </g>

      <text x="75" y="472" fill="#d5e6da" fontSize="15">Common grower term: seed</text>

      <g className={selected === "pericarp" ? styles.emphasis : ""}>
        <ellipse cx="585" cy="245" rx="151" ry="174" fill="#8d6c46" stroke="#d0b487" strokeWidth="5" />
        <ellipse cx="585" cy="245" rx="137" ry="160" fill="#6f5337" stroke="#b99869" strokeWidth="5" />
      </g>

      <g className={selected === "seedcoat" ? styles.emphasis : ""}>
        <ellipse cx="585" cy="245" rx="124" ry="147" fill="#ded0a8" stroke="#efe4c7" strokeWidth="5" />
      </g>

      <g className={selected === "endosperm" ? styles.emphasis : ""}>
        <path
          d="M495 159 C471 196 468 274 495 323 C508 345 522 359 540 371 C521 333 514 291 517 244 C520 203 531 169 546 141 C526 142 507 149 495 159Z"
          fill="#cfbf91"
          stroke="#f0ddb0"
          strokeWidth="3"
        />
      </g>

      <g className={selected === "cotyledons" ? styles.emphasis : ""}>
        <path
          d="M559 123 C622 133 657 178 660 235 C663 296 632 347 576 370 C555 333 545 292 548 244 C550 193 553 153 559 123Z"
          fill="url(#cotyledonFill)"
          stroke="#d9e7bd"
          strokeWidth="3"
        />
        <path
          d="M596 147 C630 167 645 199 643 238 C642 279 625 313 594 336 C580 303 575 271 578 235 C580 198 585 169 596 147Z"
          fill="#9fb377"
          stroke="#cfdfae"
          strokeWidth="3"
        />
      </g>

      <g className={selected === "plumule" ? styles.emphasis : ""}>
        <path d="M561 189 C545 176 534 167 525 153" fill="none" stroke="#eef6d7" strokeWidth="8" strokeLinecap="round" />
        <path d="M526 154 C516 149 508 140 505 130" fill="none" stroke="#b9d795" strokeWidth="6" strokeLinecap="round" />
      </g>

      <g className={selected === "radicle" ? styles.emphasis : ""}>
        <path d="M562 190 C552 229 549 276 552 320" fill="none" stroke="#6e8e52" strokeWidth="12" strokeLinecap="round" />
        <path d="M552 320 C548 343 538 363 526 384" fill="none" stroke="#eef6d7" strokeWidth="9" strokeLinecap="round" />
      </g>

      <g className={selected === "stylar" ? styles.emphasis : ""}>
        <circle cx="526" cy="388" r="7" fill="#e6c996" />
        <path d="M526 388 V422" stroke="#9dd2ad" strokeWidth="2" />
      </g>

      <g className={selected === "pericarp" ? styles.emphasis : ""}>
        <path d="M696 126 H770" stroke="#9dd2ad" strokeWidth="2" />
        <circle cx="696" cy="126" r="6" fill="#9dd2ad" />
        <text x="704" y="117" fill="#b9d8c3" fontSize="14">pericarp</text>
      </g>
      <g className={selected === "seedcoat" ? styles.emphasis : ""}>
        <path d="M692 184 H770" stroke="#9dd2ad" strokeWidth="2" />
        <circle cx="692" cy="184" r="6" fill="#9dd2ad" />
        <text x="704" y="175" fill="#b9d8c3" fontSize="14">true seed / seed coat</text>
      </g>
      <g className={selected === "endosperm" ? styles.emphasis : ""}>
        <path d="M502 270 H410" stroke="#9dd2ad" strokeWidth="2" />
        <circle cx="502" cy="270" r="6" fill="#9dd2ad" />
        <text x="405" y="258" textAnchor="end" fill="#b9d8c3" fontSize="14">residual peripheral</text>
        <text x="405" y="276" textAnchor="end" fill="#b9d8c3" fontSize="14">endosperm</text>
      </g>
      <g className={selected === "cotyledons" ? styles.emphasis : ""}>
        <path d="M619 267 H758" stroke="#9dd2ad" strokeWidth="2" />
        <circle cx="619" cy="267" r="6" fill="#9dd2ad" />
        <text x="704" y="257" fill="#b9d8c3" fontSize="14">cotyledons</text>
      </g>
      <g className={selected === "plumule" ? styles.emphasis : ""}>
        <path d="M526 151 H411" stroke="#9dd2ad" strokeWidth="2" />
        <circle cx="526" cy="151" r="6" fill="#9dd2ad" />
        <text x="406" y="142" textAnchor="end" fill="#b9d8c3" fontSize="14">plumule / shoot region</text>
      </g>
      <g className={selected === "radicle" ? styles.emphasis : ""}>
        <path d="M548 337 H420" stroke="#9dd2ad" strokeWidth="2" />
        <circle cx="548" cy="337" r="6" fill="#9dd2ad" />
        <text x="415" y="329" textAnchor="end" fill="#b9d8c3" fontSize="14">radicle + hypocotyl</text>
      </g>

      <text x="451" y="456" fill="#d5e6da" fontSize="15">Botanical planted unit: achene (fruit + true seed)</text>
      <text x="452" y="478" fill="#93b29d" fontSize="13">Schematic — proportions vary and are not universal scale</text>
    </svg>
  );
}

export function AtlasAcheneVisual() {
  const [selectedId, setSelectedId] = useState(points[0].id);
  const selected = useMemo(
    () => points.find((point) => point.id === selectedId) ?? points[0],
    [selectedId],
  );

  return (
    <div className={styles.visualShell}>
      <div className={styles.visualHeader}>
        <div>
          <p>Interactive academic visual · corrected achene anatomy</p>
          <h2>Cannabis achene anatomy</h2>
          <span>Common grower term “seed” · botanical unit achene (fruit + true seed)</span>
        </div>
        <small>Select a structure to inspect the fruit–seed distinction</small>
      </div>
      <div className={styles.visualGrid}>
        <div className={styles.figure}>
          <AcheneGraphic selected={selectedId} />
        </div>
        <aside className={styles.legend}>
          <div className={styles.pointList}>
            {points.map((point, index) => (
              <button
                key={point.id}
                type="button"
                className={point.id === selectedId ? styles.active : ""}
                onClick={() => setSelectedId(point.id)}
              >
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>{point.label}</span>
              </button>
            ))}
          </div>
          <div className={styles.detail}>
            <p>Selected structure</p>
            <h3>{selected.label}</h3>
            <span>{selected.detail}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
