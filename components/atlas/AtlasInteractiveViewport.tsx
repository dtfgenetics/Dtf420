"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import atlasEntities from "@/content/atlas-entities.json";
import styles from "./AtlasInteractiveViewport.module.css";

export type AtlasLayer = "overview" | "anatomy" | "physiology" | "micro" | "environment" | "diagnostics";
type RuntimeState = "loading" | "ready" | "fallback";
type RuntimeCommand = "rotate-left" | "rotate-right" | "zoom-in" | "zoom-out" | "reset";
type Entity = (typeof atlasEntities)[number];

type AtlasInteractiveViewportProps = {
  selectedId: string;
  layer: AtlasLayer;
  onLayerChange: (layer: AtlasLayer) => void;
  onSelect: (id: string) => void;
  statusForEntity?: (id: string) => string;
  lightOn?: boolean;
};

const layerLabels: Array<{ id: AtlasLayer; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "anatomy", label: "Anatomy" },
  { id: "physiology", label: "Physiology" },
  { id: "micro", label: "Micro" },
  { id: "environment", label: "Environment" },
  { id: "diagnostics", label: "Diagnostics" },
];

function entityVisible(entity: Entity, layer: AtlasLayer) {
  return entity.layers.includes(layer);
}

function ReferencePlant() {
  return (
    <svg className={styles.plantArt} viewBox="0 0 620 840" role="img" aria-label="Cannabis plant reference model with exposed roots">
      <defs>
        <linearGradient id="atlasLeaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#294f31" />
          <stop offset="0.5" stopColor="#496d39" />
          <stop offset="1" stopColor="#182e20" />
        </linearGradient>
        <linearGradient id="atlasStem" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#779161" />
          <stop offset="0.45" stopColor="#a7b67a" />
          <stop offset="1" stopColor="#435a39" />
        </linearGradient>
        <linearGradient id="atlasRoot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b89d78" />
          <stop offset="1" stopColor="#72563d" />
        </linearGradient>
        <radialGradient id="atlasFlower">
          <stop offset="0" stopColor="#d1d7ad" />
          <stop offset="0.35" stopColor="#758356" />
          <stop offset="1" stopColor="#33422d" />
        </radialGradient>
      </defs>

      <g className={styles.rootMass}>
        <path d="M310 618 C290 655 252 684 205 741" />
        <path d="M310 618 C329 660 363 699 414 755" />
        <path d="M307 621 C306 676 300 734 294 805" />
        <path d="M289 661 C253 670 214 687 159 719" />
        <path d="M331 662 C370 673 407 691 465 723" />
        <path d="M268 694 C232 716 210 749 189 791" />
        <path d="M351 699 C389 724 409 754 432 799" />
        <path d="M298 711 C268 738 254 766 249 814" />
        <path d="M320 713 C346 744 356 773 360 818" />
        <path d="M239 714 C205 723 177 741 143 771" />
        <path d="M389 717 C425 729 449 746 486 778" />
      </g>

      <path className={styles.stem} d="M297 623 C296 535 300 448 302 350 C304 252 304 177 309 91 C314 179 315 252 317 350 C320 447 322 536 320 623 Z" fill="url(#atlasStem)" />

      <g className={styles.branches}>
        <path d="M309 522 C253 493 210 467 152 447" />
        <path d="M313 522 C370 493 414 465 473 444" />
        <path d="M308 444 C258 414 214 382 172 343" />
        <path d="M314 442 C365 409 406 378 451 338" />
        <path d="M309 365 C271 330 237 300 205 258" />
        <path d="M313 365 C351 330 383 299 418 257" />
        <path d="M310 290 C283 255 261 225 245 187" />
        <path d="M312 289 C340 253 360 222 377 185" />
      </g>

      <g className={styles.leaves} fill="url(#atlasLeaf)">
        <path d="M146 446 C93 414 61 376 53 342 C96 339 139 358 180 400 C157 361 151 326 164 292 C196 320 211 359 205 405 C230 365 260 343 293 344 C282 386 226 428 162 451 Z" />
        <path d="M478 443 C531 411 561 375 568 340 C526 338 484 357 444 397 C467 359 471 325 459 291 C426 318 411 356 418 402 C394 363 363 341 331 342 C343 384 398 425 462 448 Z" />
        <path d="M170 342 C126 313 103 280 101 250 C138 248 173 264 205 299 C189 265 188 234 203 208 C229 235 237 269 229 309 C252 277 277 260 304 262 C292 298 247 331 188 347 Z" />
        <path d="M451 338 C494 309 517 276 519 247 C483 245 448 261 416 295 C433 262 433 231 418 205 C392 232 383 266 391 306 C368 274 344 257 317 259 C328 295 373 328 433 343 Z" />
        <path d="M203 258 C170 232 155 205 159 181 C188 185 213 201 235 228 C227 202 232 178 249 160 C267 184 268 211 254 241 C275 218 295 208 316 214 C302 242 263 263 221 267 Z" />
        <path d="M418 257 C451 230 465 203 461 179 C433 182 407 199 386 225 C394 199 389 176 372 158 C354 181 353 208 367 238 C346 215 326 205 305 211 C319 239 357 261 400 265 Z" />
      </g>

      <g className={styles.flowers} fill="url(#atlasFlower)">
        <ellipse cx="311" cy="109" rx="48" ry="83" />
        <ellipse cx="284" cy="148" rx="32" ry="52" />
        <ellipse cx="340" cy="147" rx="32" ry="52" />
        <ellipse cx="254" cy="287" rx="25" ry="43" transform="rotate(-20 254 287)" />
        <ellipse cx="369" cy="286" rx="25" ry="43" transform="rotate(20 369 286)" />
        <ellipse cx="222" cy="398" rx="23" ry="39" transform="rotate(-28 222 398)" />
        <ellipse cx="401" cy="397" rx="23" ry="39" transform="rotate(28 401 397)" />
        <ellipse cx="265" cy="491" rx="21" ry="36" transform="rotate(-16 265 491)" />
        <ellipse cx="358" cy="490" rx="21" ry="36" transform="rotate(16 358 490)" />
      </g>

      <g className={styles.pistils}>
        <path d="M292 73 C279 48 267 43 253 38 M311 67 C308 39 315 29 322 19 M331 78 C347 52 362 49 376 45" />
        <path d="M245 267 C229 248 218 245 205 244 M374 267 C390 247 402 244 416 243" />
      </g>

      <g className={styles.nodes}>
        <circle cx="311" cy="522" r="7" />
        <circle cx="311" cy="443" r="7" />
        <circle cx="311" cy="365" r="7" />
        <circle cx="311" cy="290" r="6" />
      </g>

      <ellipse className={styles.soil} cx="310" cy="625" rx="196" ry="34" />
    </svg>
  );
}

export function AtlasInteractiveViewport({ selectedId, layer, onLayerChange, onSelect, statusForEntity, lightOn = true }: AtlasInteractiveViewportProps) {
  const [rotation, setRotation] = useState(-4);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [runtimeState, setRuntimeState] = useState<RuntimeState>("loading");
  const pointer = useRef<{ id: number; x: number; rotation: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const visibleEntities = atlasEntities.filter((entity) => entityVisible(entity, layer));
  const selectedEntity = atlasEntities.find((entity) => entity.id === selectedId) ?? atlasEntities[0];

  const postState = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: "atlas:set-state", selectedId, layer, camera: selectedEntity.camera, lightOn },
      window.location.origin,
    );
  }, [layer, lightOn, selectedEntity.camera, selectedId]);

  const sendCommand = useCallback((command: RuntimeCommand) => {
    frameRef.current?.contentWindow?.postMessage({ type: "atlas:command", command }, window.location.origin);
  }, []);

  useEffect(() => {
    function receiveRuntimeMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      const data = event.data as { type?: string; id?: string } | null;
      if (!data || typeof data !== "object") return;
      if (data.type === "atlas:ready") {
        setRuntimeState("ready");
        postState();
      }
      if (data.type === "atlas:runtime-error") setRuntimeState("fallback");
      if (data.type === "atlas:select" && data.id && atlasEntities.some((entity) => entity.id === data.id)) onSelect(data.id);
    }
    window.addEventListener("message", receiveRuntimeMessage);
    return () => window.removeEventListener("message", receiveRuntimeMessage);
  }, [onSelect, postState]);

  useEffect(() => {
    if (runtimeState === "ready") postState();
  }, [postState, runtimeState]);

  const reset = useCallback(() => {
    setRotation(-4);
    setZoom(1);
    sendCommand("reset");
  }, [sendCommand]);

  const rotateBy = useCallback((degrees: number) => {
    setRotation((value) => value + degrees);
    sendCommand(degrees < 0 ? "rotate-left" : "rotate-right");
  }, [sendCommand]);

  function zoomIn() {
    setZoom((value) => Math.min(1.45, value + 0.1));
    sendCommand("zoom-in");
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (runtimeState === "ready" || (event.target as HTMLElement).closest("button, a, iframe")) return;
    pointer.current = { id: event.pointerId, x: event.clientX, rotation };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointer.current || pointer.current.id !== event.pointerId) return;
    const delta = event.clientX - pointer.current.x;
    setRotation(pointer.current.rotation + delta * 0.18);
  }

  function releasePointer(event: React.PointerEvent<HTMLDivElement>) {
    if (pointer.current?.id !== event.pointerId) return;
    pointer.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  async function toggleFullscreen() {
    if (!viewportRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await viewportRef.current.requestFullscreen();
  }

  return (
    <div
      ref={viewportRef}
      className={`${styles.viewport} ${dragging ? styles.dragging : ""} ${styles[`layer_${layer}`]}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
    >
      <div className={styles.environmentGlow} aria-hidden="true" />
      <div className={styles.gridFloor} aria-hidden="true" />

      <div className={styles.threeStage} data-runtime-state={runtimeState}>
        <iframe
          ref={frameRef}
          className={styles.threeFrame}
          src="/atlas-3d/index.html"
          title="Interactive 3D cannabis plant anatomy"
          onLoad={postState}
          allow="fullscreen"
        />
        <span className={styles.rendererStatus} aria-live="polite">
          {runtimeState === "ready" ? "Three.js live" : runtimeState === "fallback" ? "2D fallback" : "Loading 3D"}
        </span>
      </div>

      <div className={styles.viewerTools} aria-label="Plant viewer controls">
        <button type="button" onClick={() => rotateBy(-18)} aria-label="Rotate plant left">↺<span>Rotate</span></button>
        <button type="button" onClick={zoomIn} aria-label="Zoom in">＋<span>Zoom</span></button>
        <button type="button" onClick={reset} aria-label="Reset plant view">⟳<span>Reset</span></button>
        <button type="button" onClick={toggleFullscreen} aria-label="Toggle full screen">⛶<span>Full</span></button>
      </div>

      <div
        className={`${styles.plantModel} ${runtimeState === "ready" ? styles.plantModelHidden : ""}`}
        style={{ transform: `translateZ(0) rotateY(${rotation}deg) scale(${zoom})` }}
        aria-label="Accessible fallback plant model viewport"
        aria-hidden={runtimeState === "ready"}
      >
        <ReferencePlant />
      </div>

      {visibleEntities.map((entity) => {
        const active = selectedId === entity.id;
        return (
          <button
            key={entity.id}
            type="button"
            className={`${styles.hotspot} ${active ? styles.hotspotActive : ""}`}
            style={{ left: `${entity.hotspot.x}%`, top: `${entity.hotspot.y}%` }}
            onClick={() => onSelect(entity.id)}
            aria-pressed={active}
            aria-label={`${entity.label}. ${statusForEntity?.(entity.id) ?? entity.systemLabel}`}
          >
            <i aria-hidden="true" />
            <span aria-hidden="true"><strong>{entity.label}</strong><small>{statusForEntity?.(entity.id) ?? entity.systemLabel}</small></span>
          </button>
        );
      })}

      <div className={styles.layerPanel} aria-label="Plant visualization layers">
        <span>Layers</span>
        {layerLabels.map((item) => (
          <button key={item.id} type="button" className={layer === item.id ? styles.layerActive : ""} onClick={() => onLayerChange(item.id)} aria-pressed={layer === item.id}>
            <i aria-hidden="true">◉</i>{item.label}
          </button>
        ))}
      </div>

      <div className={styles.rotationHint} aria-hidden="true">
        <strong>↶ 360° ↷</strong>
        <span>{runtimeState === "ready" ? "Drag the 3D plant to orbit · tap structures to inspect" : "Drag to rotate · accessible fallback active"}</span>
      </div>
    </div>
  );
}
