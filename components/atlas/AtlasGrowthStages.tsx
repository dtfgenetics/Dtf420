"use client";

import { useMemo, useState } from "react";
import stages from "@/content/atlas-growth-stages.json";
import atlasSections from "@/content/atlas-sections.json";
import styles from "./AtlasGrowthStages.module.css";

type StageId = (typeof stages)[number]["id"];

const systemLabels = new Map(atlasSections.map((section) => [section.id, section.label]));

function SeedGraphic() {
  return (
    <svg className={styles.stageArt} viewBox="0 0 520 620" role="img" aria-label="Germinating cannabis seed illustration">
      <ellipse className={styles.soilGlow} cx="260" cy="486" rx="170" ry="55" />
      <ellipse className={styles.seedShell} cx="250" cy="390" rx="86" ry="116" transform="rotate(-13 250 390)" />
      <path className={styles.seedSeam} d="M215 296 C254 331 285 385 287 475" />
      <path className={styles.radicle} d="M265 472 C272 505 290 526 278 584" />
      <path className={styles.rootFine} d="M280 535 C304 548 316 564 320 588" />
      <path className={styles.rootFine} d="M278 552 C258 564 246 580 242 598" />
      <path className={styles.cotyledonHint} d="M222 347 C238 322 259 316 276 326 C263 354 247 366 222 347 Z" />
    </svg>
  );
}

function SeedlingGraphic() {
  return (
    <svg className={styles.stageArt} viewBox="0 0 520 620" role="img" aria-label="Cannabis seedling illustration">
      <rect className={styles.media} x="135" y="505" width="250" height="48" rx="22" />
      <path className={styles.root} d="M260 525 C247 554 233 571 224 609" />
      <path className={styles.root} d="M260 525 C274 553 293 578 300 609" />
      <path className={styles.stem} d="M254 508 C254 430 255 356 260 286 C265 356 266 430 266 508 Z" />
      <ellipse className={styles.cotyledon} cx="214" cy="320" rx="62" ry="27" transform="rotate(-13 214 320)" />
      <ellipse className={styles.cotyledon} cx="306" cy="320" rx="62" ry="27" transform="rotate(13 306 320)" />
      <path className={styles.trueLeaf} d="M257 285 C209 256 193 218 203 195 C229 198 251 218 260 249 C269 216 292 198 318 195 C328 220 310 257 263 286 Z" />
      <circle className={styles.apex} cx="260" cy="282" r="8" />
    </svg>
  );
}

function PlantGraphic({ stage }: { stage: StageId }) {
  const transition = stage === "transition";
  const flowering = stage === "flowering" || stage === "maturation";
  const maturation = stage === "maturation";

  if (stage === "germination") return <SeedGraphic />;
  if (stage === "seedling") return <SeedlingGraphic />;

  return (
    <svg className={styles.stageArt} viewBox="0 0 520 620" role="img" aria-label={`${stage} cannabis plant illustration`}>
      <defs>
        <linearGradient id={`stageLeaf-${stage}`} x1="0" x2="1">
          <stop offset="0" stopColor={maturation ? "#5f7b3a" : "#1f603e"} />
          <stop offset="1" stopColor={maturation ? "#8a7a35" : "#438c5b"} />
        </linearGradient>
      </defs>
      <rect className={styles.media} x="125" y="526" width="270" height="46" rx="22" />
      <path className={styles.root} d="M260 546 C247 570 230 585 220 614" />
      <path className={styles.root} d="M260 546 C276 573 296 592 304 615" />
      <path className={styles.rootFine} d="M237 580 C213 590 201 603 194 616" />
      <path className={styles.rootFine} d="M286 582 C309 594 323 605 330 618" />

      <path className={styles.stem} d="M253 533 C253 438 255 324 260 126 C265 324 267 438 267 533 Z" />
      <path className={styles.branch} d="M260 437 C215 411 184 386 143 369" />
      <path className={styles.branch} d="M260 437 C304 410 337 385 378 367" />
      <path className={styles.branch} d="M260 349 C223 321 195 297 166 271" />
      <path className={styles.branch} d="M260 349 C298 320 325 295 355 269" />
      <path className={styles.branch} d="M260 260 C233 235 214 211 194 187" />
      <path className={styles.branch} d="M260 260 C287 235 307 210 328 185" />

      <g fill={`url(#stageLeaf-${stage})`} className={styles.leafGroup}>
        <path d="M150 370 C112 336 91 302 98 278 C130 280 159 303 177 338 C170 310 174 286 192 267 C210 293 206 326 187 356 C213 329 236 317 258 324 C246 353 205 375 166 379 Z" />
        <path d="M370 368 C408 334 429 300 422 276 C390 278 361 301 343 336 C350 308 346 284 328 265 C310 291 314 324 333 354 C307 327 284 315 262 322 C274 351 315 373 354 377 Z" />
        <path d="M176 272 C146 241 132 212 139 193 C164 195 188 215 201 244 C196 220 201 198 216 182 C232 204 228 230 213 257 C234 234 253 225 272 230 C262 257 231 276 193 279 Z" />
        <path d="M344 270 C374 239 388 210 381 191 C356 193 332 213 319 242 C324 218 319 196 304 180 C288 202 292 228 307 255 C286 232 267 223 248 228 C258 255 289 274 327 277 Z" />
        <path d="M205 188 C184 162 176 140 184 125 C203 129 220 145 229 168 C227 149 234 132 247 121 C258 139 252 160 239 180 C256 164 272 158 286 166 C273 185 248 197 221 195 Z" />
        <path d="M315 186 C336 160 344 138 336 123 C317 127 300 143 291 166 C293 147 286 130 273 119 C262 137 268 158 281 178 C264 162 248 156 234 164 C247 183 272 195 299 193 Z" />
      </g>

      <g className={styles.nodes}>
        <circle cx="260" cy="437" r="7" />
        <circle cx="260" cy="349" r="7" />
        <circle cx="260" cy="260" r="7" />
      </g>

      {transition ? (
        <g className={styles.preflowers}>
          <circle cx="244" cy="344" r="7" />
          <circle cx="276" cy="344" r="7" />
          <circle cx="246" cy="255" r="6" />
          <circle cx="274" cy="255" r="6" />
        </g>
      ) : null}

      {flowering ? (
        <g className={`${styles.flowerClusters} ${maturation ? styles.matureFlowers : ""}`}>
          <ellipse cx="260" cy="111" rx="37" ry="61" />
          <ellipse cx="204" cy="187" rx="25" ry="39" />
          <ellipse cx="316" cy="185" rx="25" ry="39" />
          <ellipse cx="169" cy="270" rx="22" ry="34" />
          <ellipse cx="351" cy="268" rx="22" ry="34" />
          <ellipse cx="143" cy="368" rx="20" ry="31" />
          <ellipse cx="378" cy="367" rx="20" ry="31" />
        </g>
      ) : null}

      {flowering ? (
        <g className={styles.trichomeSparkles}>
          <circle cx="250" cy="95" r="3" /><circle cx="270" cy="118" r="3" /><circle cx="195" cy="181" r="2.5" />
          <circle cx="324" cy="179" r="2.5" /><circle cx="165" cy="263" r="2.5" /><circle cx="358" cy="261" r="2.5" />
        </g>
      ) : null}
    </svg>
  );
}

export function AtlasGrowthStages() {
  const [selectedId, setSelectedId] = useState<StageId>("vegetative");
  const selected = useMemo(
    () => stages.find((stage) => stage.id === selectedId) ?? stages[2],
    [selectedId],
  );

  return (
    <section className={styles.stageShell} aria-labelledby="atlas-growth-stages">
      <header className={styles.heading}>
        <div>
          <p>Lifecycle lens</p>
          <h2 id="atlas-growth-stages">Watch the plant change across development</h2>
        </div>
        <span>Structure, function, and diagnostic context change with stage.</span>
      </header>

      <nav className={styles.stageNav} aria-label="Cannabis growth stages">
        {stages.map((stage) => (
          <button
            key={stage.id}
            type="button"
            className={stage.id === selected.id ? styles.active : ""}
            onClick={() => setSelectedId(stage.id as StageId)}
          >
            <b>{stage.stageNumber}</b>
            <span>{stage.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.workspace}>
        <div className={styles.visualPanel}>
          <div className={styles.visualLabel}>
            <span>Stage {selected.stageNumber} of {stages.length}</span>
            <strong>{selected.label}</strong>
          </div>
          <PlantGraphic stage={selected.id as StageId} />
          <div className={styles.structureTags}>
            {selected.visibleStructures.map((structure) => <span key={structure}>{structure}</span>)}
          </div>
        </div>

        <aside className={styles.detailPanel}>
          <p className={styles.eyebrow}>Developmental context</p>
          <h3>{selected.label}</h3>
          <p className={styles.summary}>{selected.summary}</p>

          <div className={styles.activeSystems}>
            <strong>Atlas systems most active in this view</strong>
            <div>
              {selected.activeSystems.map((system) => <span key={system}>{systemLabels.get(system) ?? system}</span>)}
            </div>
          </div>

          <div className={styles.twoColumn}>
            <div>
              <h4>What to observe</h4>
              <ul>{selected.observe.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <h4>What is happening biologically</h4>
              <ul>{selected.biology.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>

          <div className={styles.contextRule}>
            <strong>Atlas rule</strong>
            <p>The same color, posture, or growth pattern can mean something different at another developmental stage. Stage is part of the diagnostic evidence.</p>
          </div>
        </aside>
      </div>

      <div className={styles.progressTrack} aria-hidden="true">
        {stages.map((stage) => <i key={stage.id} className={stage.stageNumber <= selected.stageNumber ? styles.complete : ""} />)}
      </div>
    </section>
  );
}
