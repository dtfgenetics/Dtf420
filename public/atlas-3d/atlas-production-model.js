const ENTITY_TARGETS = {
  seed_germination: [2.05, -2.15, 0.15],
  root_system: [0, -1.9, 0],
  stem_vascular: [0, 0.15, 0],
  nodes_branching: [-0.35, 0.85, 0],
  leaves: [-1.25, 1.25, 0],
  flowers: [0.05, 2.45, 0],
  trichomes_resin: [0.85, 2.35, 0],
  sex_pollen_seed: [1.35, 0.62, 0],
  environment_overlay: [0, 0.55, 0],
  diagnostic_overlay: [0, 0.65, 0],
};

const LAYER_COPY = {
  overview: "Overview · photorealistic model · drag to orbit · pinch or wheel to zoom · tap named plant structures to inspect them.",
  anatomy: "Anatomy · named anatomical meshes are emphasized when the production asset provides them.",
  physiology: "Physiology · use the lesson overlays and inspector to connect whole-plant form with transport and source-to-sink concepts.",
  micro: "Micro · the whole-plant model stays contextual while tissue-level content opens in the Atlas inspector.",
  environment: "Environment · use the whole-plant form with light, air, temperature, humidity, water, and root-zone overlays.",
  diagnostics: "Diagnostics · observation targets support inspection only; the 3D model does not assert a diagnosis.",
};

const DEFAULT_SEMANTIC_MESHES = {
  root_system: "root_system",
  stem_main: "stem_vascular",
  nodes: "nodes_branching",
  fan_leaves: "leaves",
  flowers: "flowers",
  trichomes: "trichomes_resin",
  reproductive: "sex_pollen_seed",
};

function post(type, payload = {}) {
  window.parent.postMessage({ type, ...payload }, window.location.origin);
}

async function loadManifest() {
  const response = await fetch("./models/model-manifest.json", { cache: "no-store" });
  if (!response.ok) return null;
  const manifest = await response.json();
  if (!manifest || typeof manifest !== "object") return null;
  return manifest;
}

function normalizedModelPath(value) {
  if (typeof value !== "string") return null;
  const path = value.trim();
  if (!path.startsWith("./") || !path.toLowerCase().endsWith(".glb") || path.includes("..")) return null;
  return path;
}

function normalizedMaxDpr(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0.75 || parsed > 2) return fallback;
  return parsed;
}

function selectModelVariant(manifest) {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const deviceMemory = Number(navigator.deviceMemory || 0);
  const compactViewport = window.matchMedia("(max-width: 760px)").matches;
  const constrainedDevice = connection?.saveData === true || (deviceMemory > 0 && deviceMemory <= 4);
  const requestedTier = compactViewport || constrainedDevice ? "mobile" : "desktop";
  const variants = manifest?.variants && typeof manifest.variants === "object" ? manifest.variants : null;
  const selected = variants?.[requestedTier] || variants?.desktop || variants?.mobile || null;
  const modelPath = normalizedModelPath(selected?.model || manifest?.model);
  const defaultDpr = requestedTier === "mobile" ? 1.15 : 1.5;
  return {
    requestedTier,
    tier: selected ? (variants?.[requestedTier] === selected ? requestedTier : variants?.desktop === selected ? "desktop" : "mobile") : "legacy",
    modelPath,
    maxDpr: normalizedMaxDpr(selected?.maxDpr, defaultDpr),
  };
}

function resolveEntityId(name, semanticMeshes) {
  const normalized = String(name || "").trim().toLowerCase();
  if (!normalized) return null;
  for (const [meshName, entityId] of Object.entries(semanticMeshes)) {
    const token = meshName.toLowerCase();
    if (normalized === token || normalized.includes(token)) return entityId;
  }
  return null;
}

function cloneMaterial(material) {
  if (!material || typeof material.clone !== "function") return material;
  const cloned = material.clone();
  cloned.userData = {
    ...cloned.userData,
    atlasBaseEmissive: cloned.emissive?.clone?.() ?? null,
    atlasBaseEmissiveIntensity: typeof cloned.emissiveIntensity === "number" ? cloned.emissiveIntensity : 0,
    atlasBaseOpacity: typeof cloned.opacity === "number" ? cloned.opacity : 1,
    atlasBaseTransparent: Boolean(cloned.transparent),
  };
  return cloned;
}

function configureModelMaterials(model, entityMaterials, pickables, semanticMeshes) {
  model.traverse((object) => {
    if (!object?.isMesh) return;
    object.castShadow = false;
    object.receiveShadow = false;
    if (Array.isArray(object.material)) object.material = object.material.map(cloneMaterial);
    else object.material = cloneMaterial(object.material);

    const entityId = resolveEntityId(object.name, semanticMeshes);
    if (!entityId) return;
    object.userData.entityId = entityId;
    pickables.push(object);
    if (!entityMaterials.has(entityId)) entityMaterials.set(entityId, new Set());
    const set = entityMaterials.get(entityId);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (material) set.add(material);
    });
  });
}

function createSemanticProxyHotspots(THREE, scene, modelBounds, entityMaterials, pickables, semanticHotspots) {
  const proxies = [];
  if (!semanticHotspots || typeof semanticHotspots !== "object" || Array.isArray(semanticHotspots)) return proxies;

  const size = modelBounds.getSize(new THREE.Vector3());
  const center = modelBounds.getCenter(new THREE.Vector3());
  for (const [entityId, rawEntries] of Object.entries(semanticHotspots)) {
    if (entityMaterials.has(entityId)) continue;
    const entries = Array.isArray(rawEntries) ? rawEntries : [rawEntries];
    for (const entry of entries) {
      const position = entry?.position;
      const radiusFraction = Number(entry?.radius);
      if (!Array.isArray(position) || position.length !== 3 || !position.every((value) => Number.isFinite(Number(value)))) continue;
      if (!Number.isFinite(radiusFraction) || radiusFraction <= 0) continue;

      const [normalizedX, normalizedY, normalizedZ] = position.map(Number);
      const radius = Math.max(0.06, Math.min(size.y * 0.2, size.y * radiusFraction));
      const geometry = new THREE.SphereGeometry(radius, 12, 8);
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
      });
      material.colorWrite = false;
      const proxy = new THREE.Mesh(geometry, material);
      proxy.position.set(
        center.x + normalizedX * (size.x / 2),
        modelBounds.min.y + normalizedY * size.y,
        center.z + normalizedZ * (size.z / 2),
      );
      proxy.userData.entityId = entityId;
      proxy.userData.atlasSemanticProxy = true;
      proxy.renderOrder = -100;
      scene.add(proxy);
      pickables.push(proxy);
      proxies.push(proxy);
    }
  }
  return proxies;
}

function restoreMaterial(material) {
  if (!material) return;
  const baseEmissive = material.userData?.atlasBaseEmissive;
  if (material.emissive && baseEmissive) material.emissive.copy(baseEmissive);
  if (typeof material.emissiveIntensity === "number") material.emissiveIntensity = material.userData?.atlasBaseEmissiveIntensity ?? 0;
  if (typeof material.opacity === "number") material.opacity = material.userData?.atlasBaseOpacity ?? 1;
  material.transparent = material.userData?.atlasBaseTransparent ?? material.transparent;
  material.needsUpdate = true;
}

export async function startProductionAtlasRuntime(THREE, OrbitControls, GLTFLoader) {
  const root = document.getElementById("atlas-root");
  const status = document.getElementById("runtime-status");
  const legend = document.getElementById("runtime-legend");
  if (!root || !status || !legend) return false;

  let manifest;
  try {
    manifest = await loadManifest();
  } catch {
    document.documentElement.dataset.atlasModelState = "procedural";
    return false;
  }

  if (manifest?.available !== true) {
    document.documentElement.dataset.atlasModelState = "procedural";
    post("atlas:model-state", { state: "procedural", reason: "production-model-not-released" });
    return false;
  }

  const modelVariant = selectModelVariant(manifest);
  const modelPath = modelVariant.modelPath;
  if (!modelPath) {
    document.documentElement.dataset.atlasModelState = "procedural";
    post("atlas:model-state", { state: "procedural", reason: "invalid-model-manifest" });
    return false;
  }

  document.documentElement.dataset.atlasModelTier = modelVariant.tier;
  status.hidden = false;
  status.textContent = `Loading photorealistic plant model (${modelVariant.tier})…`;

  const loader = new GLTFLoader();
  let gltf;
  try {
    gltf = await loader.loadAsync(modelPath, (event) => {
      if (!event?.total) return;
      const percent = Math.min(100, Math.max(1, Math.round((event.loaded / event.total) * 100)));
      status.textContent = `Loading photorealistic plant model (${modelVariant.tier})… ${percent}%`;
    });
  } catch (error) {
    document.documentElement.dataset.atlasModelState = "procedural";
    status.textContent = "Production plant model unavailable. Loading the teaching specimen…";
    post("atlas:model-state", {
      state: "procedural",
      reason: "production-model-load-failed",
      modelTier: modelVariant.tier,
      message: error instanceof Error ? error.message : String(error),
    });
    return false;
  }

  const model = gltf?.scene;
  if (!model) return false;

  const originalBounds = new THREE.Box3().setFromObject(model);
  const originalSize = originalBounds.getSize(new THREE.Vector3());
  if (!Number.isFinite(originalSize.y) || originalSize.y <= 0.0001) {
    post("atlas:model-state", { state: "procedural", reason: "invalid-model-bounds" });
    return false;
  }

  const targetHeight = Number.isFinite(Number(manifest.targetHeight)) ? Number(manifest.targetHeight) : 5.2;
  const scale = targetHeight / originalSize.y;
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);

  const scaledBounds = new THREE.Box3().setFromObject(model);
  const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());
  const bottomY = -2.62;
  model.position.x -= scaledCenter.x;
  model.position.z -= scaledCenter.z;
  model.position.y += bottomY - scaledBounds.min.y;
  model.updateMatrixWorld(true);
  const finalBounds = new THREE.Box3().setFromObject(model);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08100b);
  scene.fog = new THREE.FogExp2(0x08100b, 0.045);
  scene.add(model);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 60);
  camera.position.set(0, 0.8, 7.9);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, modelVariant.maxDpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = Number.isFinite(Number(manifest.exposure)) ? Number(manifest.exposure) : 1.05;
  root.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = false;
  controls.minDistance = 3.2;
  controls.maxDistance = 11;
  controls.target.set(0, 0.5, 0);

  scene.add(new THREE.HemisphereLight(0xcbd9bd, 0x0d140f, 1.55));
  const key = new THREE.DirectionalLight(0xf4eed8, 2.9);
  key.position.set(4.8, 7.8, 5.5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x8cac78, 1.15);
  fill.position.set(-4.5, 2.7, 3.5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x6e8d63, 1.4);
  rim.position.set(-5.5, 4.2, -4.5);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.9, 64),
    new THREE.MeshStandardMaterial({ color: 0x101912, roughness: 1, metalness: 0 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.68;
  scene.add(floor);

  const grid = new THREE.GridHelper(8, 24, 0x41523b, 0x1f2a21);
  grid.position.y = -2.675;
  grid.material.transparent = true;
  grid.material.opacity = 0.12;
  scene.add(grid);

  const semanticMeshes = { ...DEFAULT_SEMANTIC_MESHES, ...(manifest.semanticMeshes || {}) };
  const entityMaterials = new Map();
  const pickables = [];
  configureModelMaterials(model, entityMaterials, pickables, semanticMeshes);
  const semanticProxies = createSemanticProxyHotspots(
    THREE,
    scene,
    finalBounds,
    entityMaterials,
    pickables,
    manifest.semanticHotspots,
  );
  document.documentElement.dataset.atlasSemanticProxyCount = String(semanticProxies.length);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cameraGoal = new THREE.Vector3();
  const targetGoal = new THREE.Vector3();
  let pointerDown = null;
  let activeEntityId = "trichomes_resin";
  let activeLayer = "overview";
  let flyFrames = 0;
  let paused = false;
  let disposed = false;
  let raf = 0;

  function restoreAllMaterials() {
    entityMaterials.forEach((set) => set.forEach(restoreMaterial));
  }

  function highlightEntity(id, reset = true) {
    if (reset) restoreAllMaterials();
    const set = entityMaterials.get(id);
    if (!set) return;
    set.forEach((material) => {
      if (material.emissive) material.emissive.setHex(0x2d491a);
      if (typeof material.emissiveIntensity === "number") material.emissiveIntensity = 0.55;
      material.needsUpdate = true;
    });
  }

  function updateLayerVisibility(layer) {
    activeLayer = LAYER_COPY[layer] ? layer : "overview";
    restoreAllMaterials();
    if (activeLayer === "anatomy" || activeLayer === "micro") {
      entityMaterials.forEach((set, id) => {
        if (id === activeEntityId) return;
        set.forEach((material) => {
          if (typeof material.opacity === "number") material.opacity = 0.48;
          material.transparent = true;
          material.needsUpdate = true;
        });
      });
    }
    highlightEntity(activeEntityId, false);
    legend.textContent = LAYER_COPY[activeLayer];
  }

  function focusEntity(id, cameraPreset = { yaw: 0, pitch: 0, zoom: 1 }) {
    activeEntityId = id;
    updateLayerVisibility(activeLayer);
    const target = new THREE.Vector3(...(ENTITY_TARGETS[id] || [0, 0.55, 0]));
    const yaw = THREE.MathUtils.degToRad(cameraPreset?.yaw || 0);
    const elevation = THREE.MathUtils.degToRad(-(cameraPreset?.pitch || 0));
    const distance = THREE.MathUtils.clamp(7.2 / Math.max(cameraPreset?.zoom || 1, 0.8), 3.15, 8.8);
    const horizontal = Math.cos(elevation) * distance;
    targetGoal.copy(target);
    cameraGoal.set(
      target.x + Math.sin(yaw) * horizontal,
      target.y + Math.sin(elevation) * distance,
      target.z + Math.cos(yaw) * horizontal,
    );
    if (reducedMotion) {
      camera.position.copy(cameraGoal);
      controls.target.copy(targetGoal);
      controls.update();
      flyFrames = 0;
    } else {
      flyFrames = 42;
    }
  }

  function applyCommand(command) {
    const target = controls.target.clone();
    const offset = camera.position.clone().sub(target);
    if (command === "rotate-left" || command === "rotate-right") {
      const angle = THREE.MathUtils.degToRad(command === "rotate-left" ? -18 : 18);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      camera.position.copy(target.clone().add(offset));
      controls.update();
      flyFrames = 0;
    } else if (command === "zoom-in" || command === "zoom-out") {
      offset.multiplyScalar(command === "zoom-in" ? 0.88 : 1.13);
      const distance = THREE.MathUtils.clamp(offset.length(), controls.minDistance, controls.maxDistance);
      camera.position.copy(target.clone().add(offset.setLength(distance)));
      controls.update();
      flyFrames = 0;
    } else if (command === "reset") {
      focusEntity(activeEntityId, { yaw: 0, pitch: 0, zoom: 1 });
    }
  }

  function receiveMessage(event) {
    if (event.origin !== window.location.origin || event.source !== window.parent) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "atlas:set-state") {
      key.intensity = data.lightOn === false ? 1.3 : 2.9;
      rim.intensity = data.lightOn === false ? 0.75 : 1.4;
      updateLayerVisibility(data.layer || "overview");
      focusEntity(data.selectedId || activeEntityId, data.camera || undefined);
    }
    if (data.type === "atlas:command") applyCommand(data.command);
  }
  window.addEventListener("message", receiveMessage);

  renderer.domElement.addEventListener("pointerdown", (event) => {
    pointerDown = { x: event.clientX, y: event.clientY };
  });
  renderer.domElement.addEventListener("pointerup", (event) => {
    if (!pointerDown) return;
    const movement = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    pointerDown = null;
    if (movement > 6 || pickables.length === 0) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickables, true).find((item) => item.object?.userData?.entityId);
    if (hit?.object?.userData?.entityId) post("atlas:select", { id: hit.object.userData.entityId });
  });
  controls.addEventListener("start", () => { flyFrames = 0; });

  function resize() {
    if (disposed) return;
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  resize();

  function onVisibilityChange() { paused = document.hidden; }
  document.addEventListener("visibilitychange", onVisibilityChange);

  function onContextLost(event) {
    event.preventDefault();
    status.hidden = false;
    status.textContent = "3D context lost. The accessible Atlas navigation remains available.";
    post("atlas:runtime-error", { message: "WebGL context lost" });
  }
  renderer.domElement.addEventListener("webglcontextlost", onContextLost, false);

  const clock = new THREE.Clock();
  function animate() {
    if (disposed) return;
    raf = requestAnimationFrame(animate);
    if (paused) return;
    clock.getDelta();
    if (flyFrames > 0) {
      camera.position.lerp(cameraGoal, 0.12);
      controls.target.lerp(targetGoal, 0.12);
      flyFrames -= 1;
      if (flyFrames === 0) {
        camera.position.copy(cameraGoal);
        controls.target.copy(targetGoal);
      }
    }
    controls.update();
    renderer.render(scene, camera);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("message", receiveMessage);
    renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
    controls.dispose();
    semanticProxies.forEach((proxy) => {
      scene.remove(proxy);
      proxy.geometry?.dispose?.();
      proxy.material?.dispose?.();
    });
    model.traverse((object) => {
      if (!object?.isMesh) return;
      object.geometry?.dispose?.();
      const mats = Array.isArray(object.material) ? object.material : [object.material];
      mats.forEach((material) => {
        if (!material) return;
        Object.values(material).forEach((value) => value?.isTexture && value.dispose?.());
        material.dispose?.();
      });
    });
    renderer.dispose();
  }
  window.addEventListener("pagehide", dispose, { once: true });

  updateLayerVisibility("overview");
  focusEntity("trichomes_resin", { yaw: 26, pitch: -14, zoom: 2.15 });
  status.hidden = true;
  document.documentElement.dataset.atlasModelState = "production";
  document.documentElement.dataset.atlasModelVersion = String(manifest.modelVersion || "unversioned");
  document.documentElement.dataset.atlasModelTier = modelVariant.tier;
  post("atlas:model-state", {
    state: "production",
    modelVersion: String(manifest.modelVersion || "unversioned"),
    modelTier: modelVariant.tier,
    semanticPickables: pickables.length,
    semanticProxyPickables: semanticProxies.length,
  });
  animate();
  return true;
}
