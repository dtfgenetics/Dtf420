"use client";

import { useMemo, useState } from "react";
import overlays from "@/content/atlas-overlays.json";
import styles from "./AtlasVisualOverlays.module.css";

type OverlayMode = "environment" | "diagnostics";

const environmentPositions: Record<string, { x: number; y: number }> = {
  light: { x: 50, y: 8 },
  leaf_temperature: { x: 35, y: 24 },
  temperature: { x: 17, y: 38 },
  rh: { x: 82, y: 34 },
  vpd: { x: 76, y: 19 },
  airflow: { x: 13, y: 54 },
  co2: { x: 86, y: 53 },
  water: { x: 30, y: 88 },
  root_oxygen: { x: 47, y: 93 },
  ph: { x: 64, y: 88 },
  ec: { x: 78, y: 82 },
};

const diagnosticPositions: Record<string, { x: number; y: number }> = {
  new_growth: { x: 50, y: 15 },
  upper_canopy: { x: 34, y: 30 },
  middle_canopy: { x: 64, y: 45 },
  older_lower: { x: 33, y: 63 },
  one_branch: { x: 72, y: 58 },
  whole_plant: { x: 18, y: 46 },
  root_zone: { x: 50, y: 89 },
};

function PlantDiagram({ mode }: { mode: OverlayMode }) {
  return (
    <svg className={styles.plant} viewBox="0 0 500 660" role="img" aria-label={`${mode} plant overlay diagram`}>
      <defs>
        <linearGradient id="overlayLeaf" x1="0" x2="1">
          <stop offset="0" stopColor="#1d5d3c" />
          <stop offset="1" stopColor="#3f8a58" />
        </linearGradient>
        <linearGradient id="overlayStem" x1="0" x2="1">
          <stop offset="0" stopColor="#7a9861" />
          <stop offset="1" stopColor="#4d6c43" />
        </linearGradient>
      </defs>
      <circle className={mode === "environment" ? styles.sun : styles.hidden} cx="250" cy="52" r="31" />
      <path className={styles.stem} d="M243 535 C243 440 246 350 250 145 C254 350 257 440 257 535 Z" fill="url(#overlayStem)" />
      <path className={styles.branch} d="M250 415 C206 389 176 365 129 351" />
      <path className={styles.branch} d="M250 415 C292 388 324 364 372 349" />
      <path className={styles.branch} d="M250 329 C212 302 186 276 153 248" />
      <path className={styles.branch} d="M250 329 C289 300 316 274 350 245" />
      <path className={styles.branch} d="M250 245 C225 218 206 193 188 168" />
      <path className={styles.branch} d="M250 245 C276 218 294 193 313 167" />
      <g fill="url(#overlayLeaf)" className={styles.leaves}>
        <path d="M140 351 C105 319 85 286 91 263 C122 264 151 287 169 321 C162 293 167 269 184 250 C202 276 198 308 180 338 C205 311 229 298 251 305 C238 334 201 356 158 362 Z" />
        <path d="M360 349 C395 318 415 284 409 261 C378 263 348 286 331 320 C338 292 333 268 316 249 C298 275 302 307 320 337 C295 310 271 297 249 304 C262 333 299 355 342 360 Z" />
        <path d="M162 248 C133 218 119 190 126 171 C150 173 174 193 187 222 C182 198 187 177 202 161 C217 182 214 208 199 234 C220 212 239 202 258 207 C248 233 218 251 181 255 Z" />
        <path d="M338 246 C367 217 381 189 374 169 C350 172 326 192 313 221 C318 197 313 176 298 160 C283 181 286 207 301 233 C280 211 261 201 242 206 C252 232 282 250 319 253 Z" />
        <path d="M195 169 C175 144 168 123 175 108 C194 112 210 127 218 149 C217 130 223 114 236 104 C246 122 241 142 228 161 C245 147 260 141 274 148 C261 166 237 177 211 176 Z" />
        <path d="M305 168 C325 143 332 122 325 107 C306 111 290 126 282 148 C283 129 277 113 264 103 C254 121 259 141 272 160 C255 146 240 140 226 147 C239 165 263 176 289 175 Z" />
      </g>
      <g className={styles.flower}>
        <ellipse cx="250" cy="116" rx="34" ry="57" />
        <ellipse cx="232" cy="135" rx="22" ry="35" />
        <ellipse cx="269" cy="135" rx="22" ry="35" />
      </g>
      <rect className={styles.media} x="163" y="520" width="174" height="30" rx="14" />
      <path className={styles.root} d="M250 545 C235 575 213 597 203 642" />
      <path className={styles.root} d="M250 545 C265 577 289 603 300 644" />
      <path className={styles.rootFine} d="M227 586 C199 596 180 614 169 640" />
      <path className={styles.rootFine} d="M275 590 C302 604 321 619 333 644" />
      {mode === "environment" ? (
        <g className={styles.flowArrows}>
          <path d="M250 80 C250 112 250 128 250 154" />
          <path d="M250 536 C250 490 250 451 250 420" />
          <path d="M214 337 C186 324 164 312 144 292" />
          <path d="M287 337 C315 324 336 311 357 291" />
        </g>
      ) : null}
    </svg>
  );
}

export function AtlasVisualOverlays() {
  const [mode, setMode] = useState<OverlayMode>("environment");
  const [environmentId, setEnvironmentId] = useState("vpd");
  const [diagnosticId, setDiagnosticId] = useState("new_growth");

  const selectedEnvironment = useMemo(
    () => overlays.environment.factors.find((factor) => factor.id === environmentId) ?? overlays.environment.factors[0],
    [environmentId],
  );
  const selectedDiagnostic = useMemo(
    () => overlays.diagnostics.zones.find((zone) => zone.id === diagnosticId) ?? overlays.diagnostics.zones[0],
    [diagnosticId],
  );

  const points = mode === "environment" ? overlays.environment.factors : overlays.diagnostics.zones;

  return (
    <section className={styles.overlayShell} aria-labelledby="atlas-overlays-title">
      <header className={styles.heading}>
        <div>
          <p>Interactive lenses</p>
          <h2 id="atlas-overlays-title">Read the same plant through different systems</h2>
        </div>
        <div className={styles.tabs}>
          <button type="button" className={mode === "environment" ? styles.active : ""} onClick={() => setMode("environment")}>Environment flow</button>
          <button type="button" className={mode === "diagnostics" ? styles.active : ""} onClick={() => setMode("diagnostics")}>Symptom location</button>
        </div>
      </header>

      <div className={styles.workspace}>
        <div className={styles.diagram}>
          <div className={styles.diagramTitle}>
            <strong>{mode === "environment" ? overlays.environment.title : overlays.diagnostics.title}</strong>
            <span>{mode === "environment" ? overlays.environment.principle : overlays.diagnostics.principle}</span>
          </div>
          <PlantDiagram mode={mode} />

          {mode === "environment"
            ? overlays.environment.factors.map((factor) => {
                const position = environmentPositions[factor.id];
                return (
                  <button
                    type="button"
                    key={factor.id}
                    className={`${styles.point} ${factor.id === selectedEnvironment.id ? styles.pointActive : ""}`}
                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                    onClick={() => setEnvironmentId(factor.id)}
                  >
                    <i />
                    <span>{factor.label}</span>
                  </button>
                );
              })
            : overlays.diagnostics.zones.map((zone) => {
                const position = diagnosticPositions[zone.id];
                return (
                  <button
                    type="button"
                    key={zone.id}
                    className={`${styles.point} ${styles.diagnosticPoint} ${zone.id === selectedDiagnostic.id ? styles.pointActive : ""}`}
                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                    onClick={() => setDiagnosticId(zone.id)}
                  >
                    <i />
                    <span>{zone.label}</span>
                  </button>
                );
              })}
        </div>

        <aside className={styles.detail}>
          {mode === "environment" ? (
            <>
              <p className={styles.eyebrow}>Environment factor</p>
              <h3>{selectedEnvironment.label}</h3>
              <span className={styles.zoneBadge}>{selectedEnvironment.zone} zone</span>
              <p>{selectedEnvironment.summary}</p>
              <div className={styles.connections}>
                <strong>Connect this measurement to</strong>
                {selectedEnvironment.connectsTo.map((item) => <span key={item}>{item.replaceAll("_", " ")}</span>)}
              </div>
              <div className={styles.rule}>
                <strong>Interpretation rule</strong>
                <p>Do not optimize this variable in isolation. Check the plant response and the connected variables before changing the environment.</p>
              </div>
            </>
          ) : (
            <>
              <p className={styles.eyebrow}>Diagnostic location</p>
              <h3>{selectedDiagnostic.label}</h3>
              <span className={styles.zoneBadge}>location: {selectedDiagnostic.position}</span>
              <p>Use this location as evidence before ranking possible causes.</p>
              <div className={styles.questions}>
                <strong>Ask first</strong>
                {selectedDiagnostic.questions.map((question, index) => (
                  <span key={question}><b>{index + 1}</b>{question}</span>
                ))}
              </div>
              <div className={styles.rule}>
                <strong>Diagnostic rule</strong>
                <p>Location narrows the differential, but it does not prove a nutrient deficiency, toxicity, pest, disease, or environmental cause by itself.</p>
              </div>
            </>
          )}
        </aside>
      </div>

      <div className={styles.index} aria-label="Overlay index">
        {points.map((point) => (
          <span key={point.id}>{point.label}</span>
        ))}
      </div>
    </section>
  );
}
