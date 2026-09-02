const ENTITY_TARGETS = {
  seed_germination: [2.05, -2.15, 0.15],
  root_system: [0, -1.95, 0],
  stem_vascular: [0, 0.15, 0],
  nodes_branching: [-0.35, 0.85, 0],
  leaves: [-1.25, 1.25, 0],
  flowers: [0.05, 2.55, 0],
  trichomes_resin: [0.85, 2.45, 0],
  sex_pollen_seed: [1.45, 0.62, 0],
  environment_overlay: [0, 0.55, 0],
  diagnostic_overlay: [0, 0.65, 0],
};

const LAYER_COPY = {
  overview: "Overview · drag to orbit · pinch or wheel to zoom · tap a plant structure to inspect it.",
  anatomy: "Anatomy · the stem becomes translucent to reveal a simplified vascular teaching cutaway.",
  physiology: "Physiology · cyan particles represent conceptual xylem water movement; amber particles represent source-to-sink assimilate pathways.",
  micro: "Micro · tissue-level teaching structures are emphasized. They are schematic, not scale-accurate microscopy.",
  environment: "Environment · light and leaf-atmosphere interaction markers show where external conditions meet plant surfaces.",
  diagnostics: "Diagnostics · amber markers identify observation locations only; they do not assert a diagnosis.",
};

export function startAtlasRuntime(THREE, OrbitControls) {
  const root = document.getElementById("atlas-root");
  const status = document.getElementById("runtime-status");
  const legend = document.getElementById("runtime-legend");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08100b);
  scene.fog = new THREE.FogExp2(0x08100b, 0.055);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 50);
  camera.position.set(0, 0.8, 7.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  root.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = false;
  controls.minDistance = 3.2;
  controls.maxDistance = 11;
  controls.target.set(0, 0.65, 0);

  scene.add(new THREE.HemisphereLight(0xc7d8ba, 0x101812, 1.7));
  const key = new THREE.DirectionalLight(0xf3edcf, 2.7);
  key.position.set(4.5, 7.5, 5.5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7ea66a, 1.5);
  rim.position.set(-5.5, 3.5, -4);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.8, 64),
    new THREE.MeshStandardMaterial({ color: 0x111a12, roughness: 1, metalness: 0 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.72;
  scene.add(floor);

  const grid = new THREE.GridHelper(8, 24, 0x41523b, 0x1f2a21);
  grid.position.y = -2.715;
  grid.material.transparent = true;
  grid.material.opacity = 0.16;
  scene.add(grid);

  const plant = new THREE.Group();
  scene.add(plant);

  const anatomyGroup = new THREE.Group();
  const physiologyGroup = new THREE.Group();
  const microGroup = new THREE.Group();
  const environmentGroup = new THREE.Group();
  const diagnosticGroup = new THREE.Group();
  scene.add(anatomyGroup, physiologyGroup, microGroup, environmentGroup, diagnosticGroup);

  const entityObjects = new Map();
  const pickables = [];
  const materials = {};

  function makeMaterial(keyName, options) {
    const material = new THREE.MeshStandardMaterial(options);
    material.userData.baseEmissive = material.emissive.clone();
    material.userData.baseEmissiveIntensity = material.emissiveIntensity;
    materials[keyName] = material;
    return material;
  }

  const rootMat = makeMaterial("root_system", { color: 0x9a7c5d, roughness: 0.9, metalness: 0, emissive: 0x000000 });
  const stemMat = makeMaterial("stem_vascular", { color: 0x7f9b62, roughness: 0.82, metalness: 0, emissive: 0x000000, transparent: true, opacity: 1 });
  const nodeMat = makeMaterial("nodes_branching", { color: 0xb0c67b, roughness: 0.65, emissive: 0x000000 });
  const leafMat = makeMaterial("leaves", { color: 0x315d38, roughness: 0.86, emissive: 0x000000, side: THREE.DoubleSide });
  const flowerMat = makeMaterial("flowers", { color: 0x6f7d51, roughness: 0.72, emissive: 0x000000 });
  const trichomeMat = makeMaterial("trichomes_resin", { color: 0xdce2c6, roughness: 0.28, metalness: 0.04, emissive: 0x11170c, emissiveIntensity: 0.2 });
  const seedMat = makeMaterial("seed_germination", { color: 0x7f6747, roughness: 0.78, emissive: 0x000000 });
  const reproductiveMat = makeMaterial("sex_pollen_seed", { color: 0xc9b36c, roughness: 0.64, emissive: 0x000000 });

  function register(object, entityId, pick = true) {
    object.userData.entityId = entityId;
    if (!entityObjects.has(entityId)) entityObjects.set(entityId, []);
    entityObjects.get(entityId).push(object);
    if (pick) pickables.push(object);
    return object;
  }

  function cylinderBetween(a, b, radius, material, entityId, parent = plant) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const delta = end.clone().sub(start);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.92, delta.length(), 10), material);
    mesh.position.copy(start.clone().add(end).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
    parent.add(mesh);
    register(mesh, entityId);
    return mesh;
  }

  function sphere(position, radius, material, entityId, parent = plant, segments = 16) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, Math.max(8, Math.floor(segments * 0.65))), material);
    mesh.position.set(...position);
    parent.add(mesh);
    register(mesh, entityId);
    return mesh;
  }

  function ellipsoid(position, scale, material, entityId, parent = plant) {
    const mesh = sphere(position, 1, material, entityId, parent, 18);
    mesh.scale.set(...scale);
    return mesh;
  }

  function createFanLeaf(origin, side = 1, scale = 1, rotation = 0) {
    const group = new THREE.Group();
    group.position.set(...origin);
    group.rotation.y = rotation;
    group.rotation.z = side < 0 ? -0.06 : 0.06;
    plant.add(group);

    const petiole = cylinderBetween([0, 0, 0], [side * 0.62 * scale, 0.1 * scale, 0], 0.035 * scale, stemMat, "leaves", group);
    petiole.material = leafMat;

    const angles = [-0.78, -0.5, -0.26, 0, 0.26, 0.5, 0.78];
    angles.forEach((angle, index) => {
      const length = (index === 3 ? 1.05 : index === 2 || index === 4 ? 0.9 : index === 1 || index === 5 ? 0.72 : 0.58) * scale;
      const leaflet = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 6), leafMat);
      leaflet.scale.set(0.16 * scale, 0.035 * scale, length);
      leaflet.rotation.x = Math.PI / 2;
      leaflet.rotation.y = -angle * side;
      leaflet.position.set(side * (0.72 + Math.sin(angle) * 0.24) * scale, 0.1 + Math.cos(angle) * 0.14 * scale, Math.sin(angle) * 0.52 * scale);
      group.add(leaflet);
      register(leaflet, "leaves");
    });
    return group;
  }

  function createFlower(center, size = 1) {
    const group = new THREE.Group();
    group.position.set(...center);
    plant.add(group);
    const offsets = [
      [0, 0, 0], [-0.12, 0.15, 0.02], [0.13, 0.16, -0.03], [-0.08, -0.13, 0.08], [0.1, -0.12, -0.06],
      [0.02, 0.3, 0.04], [-0.18, 0.02, -0.05], [0.18, 0.03, 0.05],
    ];
    offsets.forEach((offset, i) => {
      const bud = new THREE.Mesh(new THREE.IcosahedronGeometry((i === 0 ? 0.26 : 0.2) * size, 1), flowerMat);
      bud.position.set(offset[0] * size, offset[1] * size, offset[2] * size);
      bud.scale.y = 1.25;
      group.add(bud);
      register(bud, "flowers");
    });
    return group;
  }

  const mainStemPoints = [[0, -2.05, 0], [0, -1.2, 0], [0.02, -0.3, 0], [0.01, 0.65, 0], [0.02, 1.55, 0], [0, 2.45, 0]];
  for (let i = 0; i < mainStemPoints.length - 1; i += 1) {
    cylinderBetween(mainStemPoints[i], mainStemPoints[i + 1], 0.105 - i * 0.008, stemMat, "stem_vascular");
  }

  const branchLevels = [
    { y: -0.55, span: 1.85, lift: 0.35 },
    { y: 0.2, span: 1.75, lift: 0.48 },
    { y: 0.92, span: 1.52, lift: 0.58 },
    { y: 1.55, span: 1.2, lift: 0.62 },
  ];

  branchLevels.forEach((level, levelIndex) => {
    [-1, 1].forEach((side) => {
      const start = [0, level.y, 0];
      const mid = [side * level.span * 0.56, level.y + level.lift * 0.48, 0.05 * side];
      const end = [side * level.span, level.y + level.lift, 0.08 * side];
      cylinderBetween(start, mid, 0.062 - levelIndex * 0.006, stemMat, "stem_vascular");
      cylinderBetween(mid, end, 0.045 - levelIndex * 0.004, stemMat, "stem_vascular");
      sphere([0, level.y, 0], 0.12, nodeMat, "nodes_branching");
      createFanLeaf([side * level.span * 0.72, level.y + level.lift * 0.56, 0.05 * side], side, 0.84 - levelIndex * 0.08, side < 0 ? -0.22 : 0.22);
      createFlower([side * level.span * 0.88, level.y + level.lift * 1.02, 0.07 * side], 0.72 - levelIndex * 0.05);
    });
  });

  createFanLeaf([-0.45, 1.72, 0], -1, 0.68, -0.28);
  createFanLeaf([0.45, 1.74, 0], 1, 0.68, 0.28);
  createFlower([0, 2.55, 0], 1.22);

  const rootEnds = [
    [-1.45, -2.62, 0.18], [1.5, -2.58, -0.12], [-0.85, -2.7, -0.72], [0.92, -2.68, 0.68],
    [-0.28, -2.7, -1.12], [0.32, -2.69, 1.08], [-1.72, -2.52, -0.5], [1.7, -2.5, 0.46],
  ];
  rootEnds.forEach((end, index) => {
    const mid = [end[0] * 0.48, -2.32 - (index % 2) * 0.08, end[2] * 0.35];
    cylinderBetween([0, -2.05, 0], mid, 0.06, rootMat, "root_system");
    cylinderBetween(mid, end, 0.035, rootMat, "root_system");
    const tip = [end[0] * 1.12, Math.max(-2.7, end[1] - 0.04), end[2] * 1.18];
    cylinderBetween(end, tip, 0.018, rootMat, "root_system");
  });

  const seed = ellipsoid([2.05, -2.13, 0.15], [0.32, 0.22, 0.2], seedMat, "seed_germination");
  seed.rotation.z = 0.48;

  const reproGroup = new THREE.Group();
  reproGroup.position.set(1.42, 0.62, 0.02);
  plant.add(reproGroup);
  sphere([0, 0.02, 0], 0.09, reproductiveMat, "sex_pollen_seed", reproGroup, 14);
  sphere([0.14, -0.06, 0.02], 0.075, reproductiveMat, "sex_pollen_seed", reproGroup, 14);
  cylinderBetween([-0.02, 0.07, 0], [-0.13, 0.34, 0.01], 0.012, reproductiveMat, "sex_pollen_seed", reproGroup);
  cylinderBetween([0.02, 0.08, 0], [0.14, 0.35, -0.01], 0.012, reproductiveMat, "sex_pollen_seed", reproGroup);

  const xylemMat = new THREE.MeshStandardMaterial({ color: 0x74c5df, emissive: 0x153c48, emissiveIntensity: 0.42, transparent: true, opacity: 0.92, roughness: 0.45 });
  const phloemMat = new THREE.MeshStandardMaterial({ color: 0xe5b95a, emissive: 0x4a2f09, emissiveIntensity: 0.38, transparent: true, opacity: 0.9, roughness: 0.5 });
  cylinderBetween([-0.025, -2.04, 0], [-0.025, 2.42, 0], 0.028, xylemMat, "stem_vascular", anatomyGroup);
  cylinderBetween([0.045, -2.02, 0.015], [0.045, 2.36, 0.015], 0.021, phloemMat, "stem_vascular", anatomyGroup);
  cylinderBetween([-0.058, -2.02, -0.01], [-0.058, 2.34, -0.01], 0.018, phloemMat, "stem_vascular", anatomyGroup);

  const rootCut = new THREE.Group();
  rootCut.position.set(-1.72, -1.78, 0.15);
  anatomyGroup.add(rootCut);
  const cortex = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.075, 12, 28), new THREE.MeshStandardMaterial({ color: 0xb99b73, transparent: true, opacity: 0.72, roughness: 0.8 }));
  cortex.rotation.y = Math.PI / 2;
  rootCut.add(cortex);
  const stele = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.16, 14), xylemMat);
  stele.rotation.z = Math.PI / 2;
  rootCut.add(stele);

  for (let i = 0; i < 26; i += 1) {
    const theta = (i / 26) * Math.PI * 2;
    const radius = 0.44 + (i % 3) * 0.05;
    const hair = cylinderBetween(
      [-1.4 + Math.cos(theta) * 0.12, -2.42 + Math.sin(theta) * 0.07, Math.sin(theta) * 0.12],
      [-1.4 + Math.cos(theta) * radius, -2.42 + Math.sin(theta) * 0.18, Math.sin(theta) * radius],
      0.006,
      new THREE.MeshStandardMaterial({ color: 0xd5c0a0, roughness: 0.75 }),
      "root_system",
      microGroup,
    );
    hair.userData.microOnly = true;
  }

  function createTrichome(position, scale = 1, parent = microGroup) {
    const stalkMat = trichomeMat;
    const stalk = cylinderBetween(position, [position[0], position[1] + 0.12 * scale, position[2]], 0.012 * scale, stalkMat, "trichomes_resin", parent);
    stalk.userData.microOnly = true;
    const head = sphere([position[0], position[1] + 0.15 * scale, position[2]], 0.045 * scale, trichomeMat, "trichomes_resin", parent, 12);
    head.userData.microOnly = true;
    return head;
  }

  for (let i = 0; i < 38; i += 1) {
    const theta = i * 2.399963;
    const ring = 0.18 + (i % 5) * 0.025;
    const y = 2.25 + (i % 7) * 0.075;
    createTrichome([Math.cos(theta) * ring, y, Math.sin(theta) * ring], 0.7 + (i % 3) * 0.13);
  }

  const magnified = new THREE.Group();
  magnified.position.set(1.55, 1.72, -0.15);
  microGroup.add(magnified);
  const magStem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.72, 16), trichomeMat);
  magnified.add(magStem);
  register(magStem, "trichomes_resin");
  const magHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), trichomeMat);
  magHead.position.y = 0.46;
  magnified.add(magHead);
  register(magHead, "trichomes_resin");

  const lightRayMat = new THREE.LineBasicMaterial({ color: 0xd9df83, transparent: true, opacity: 0.46 });
  [-1.4, -0.7, 0, 0.7, 1.4].forEach((x, i) => {
    const points = [new THREE.Vector3(x, 3.8, -0.2), new THREE.Vector3(x * 0.62, 1.3 + (i % 2) * 0.45, 0)];
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lightRayMat);
    environmentGroup.add(line);
  });
  const envHalo = new THREE.Mesh(
    new THREE.SphereGeometry(2.65, 28, 18),
    new THREE.MeshBasicMaterial({ color: 0x557b52, transparent: true, opacity: 0.055, side: THREE.BackSide, depthWrite: false }),
  );
  envHalo.position.y = 0.45;
  environmentGroup.add(envHalo);

  const diagnosticMat = new THREE.MeshBasicMaterial({ color: 0xe5a64c, transparent: true, opacity: 0.72, depthWrite: false });
  [[-1.4, 1.15, 0.42], [1.1, 0.25, -0.38], [-0.7, -0.25, 0.36]].forEach((position, index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18 + index * 0.02, 0.018, 10, 36), diagnosticMat);
    ring.position.set(...position);
    ring.lookAt(camera.position);
    diagnosticGroup.add(ring);
  });

  const flowSpheres = [];
  const flowCurves = [];
  const flowMeta = [];

  function addFlowCurve(points, color, count, label, speed = 0.08) {
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.86 });
    for (let i = 0; i < count; i += 1) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), material);
      physiologyGroup.add(mesh);
      flowSpheres.push(mesh);
      flowCurves.push(curve);
      flowMeta.push({ phase: i / count, speed, label });
    }
  }

  addFlowCurve([[0, -2.5, 0], [0, -1.1, 0], [0, 0.7, 0], [0, 2.35, 0]], 0x74c9e4, 9, "xylem", 0.09);
  addFlowCurve([[-1.5, 1.25, 0], [-0.6, 0.95, 0], [0, 0.45, 0], [0, -0.55, 0], [0, -2.25, 0]], 0xe7b85b, 6, "phloem", 0.055);
  addFlowCurve([[1.48, 0.35, 0], [0.55, 0.85, 0], [0.05, 1.5, 0], [0, 2.55, 0]], 0xe7b85b, 5, "phloem", 0.05);

  const transpirationMat = new THREE.MeshBasicMaterial({ color: 0xa8d8de, transparent: true, opacity: 0.5 });
  const transpiration = [];
  const transpirationSources = [[-1.55, 1.2, 0], [1.5, 0.48, 0], [-1.2, 0.2, 0.1], [1.05, 1.45, 0]];
  transpirationSources.forEach((source, sourceIndex) => {
    for (let i = 0; i < 3; i += 1) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), transpirationMat);
      physiologyGroup.add(mesh);
      transpiration.push({ mesh, source: new THREE.Vector3(...source), phase: (i + sourceIndex) / 6 });
    }
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDown = null;
  let activeEntityId = "trichomes_resin";
  let activeLayer = "overview";
  let lightOn = true;
  let flyFrames = 0;
  const cameraGoal = new THREE.Vector3();
  const targetGoal = new THREE.Vector3();

  function restoreHighlights() {
    Object.values(materials).forEach((material) => {
      material.emissive.copy(material.userData.baseEmissive);
      material.emissiveIntensity = material.userData.baseEmissiveIntensity;
    });
  }

  function highlightEntity(id) {
    restoreHighlights();
    const material = materials[id];
    if (material) {
      material.emissive.setHex(0x314a13);
      material.emissiveIntensity = id === "trichomes_resin" ? 0.85 : 0.7;
    }
  }

  function updateLayerVisibility(layer) {
    activeLayer = layer;
    anatomyGroup.visible = layer === "anatomy" || layer === "physiology" || layer === "micro";
    physiologyGroup.visible = layer === "physiology";
    microGroup.visible = layer === "micro";
    environmentGroup.visible = layer === "environment";
    diagnosticGroup.visible = layer === "diagnostics";
    stemMat.opacity = layer === "anatomy" || layer === "micro" ? 0.32 : layer === "physiology" ? 0.58 : 1;
    leafMat.opacity = layer === "micro" ? 0.34 : 1;
    leafMat.transparent = layer === "micro";
    flowerMat.opacity = layer === "micro" ? 0.42 : 1;
    flowerMat.transparent = layer === "micro";
    legend.textContent = LAYER_COPY[layer] || LAYER_COPY.overview;
  }

  function focusEntity(id, cameraPreset = { yaw: 0, pitch: 0, zoom: 1 }) {
    activeEntityId = id;
    highlightEntity(id);
    const target = new THREE.Vector3(...(ENTITY_TARGETS[id] || [0, 0.55, 0]));
    const yaw = THREE.MathUtils.degToRad(cameraPreset.yaw || 0);
    const elevation = THREE.MathUtils.degToRad(-(cameraPreset.pitch || 0));
    const distance = THREE.MathUtils.clamp(7.2 / Math.max(cameraPreset.zoom || 1, 0.8), 3.15, 8.8);
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

  function sendSelection(id) {
    window.parent.postMessage({ type: "atlas:select", id }, window.location.origin);
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
      const factor = command === "zoom-in" ? 0.88 : 1.13;
      offset.multiplyScalar(factor);
      const distance = THREE.MathUtils.clamp(offset.length(), controls.minDistance, controls.maxDistance);
      camera.position.copy(target.clone().add(offset.setLength(distance)));
      controls.update();
      flyFrames = 0;
    } else if (command === "reset") {
      focusEntity(activeEntityId, { yaw: 0, pitch: 0, zoom: 1 });
    }
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin || event.source !== window.parent) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "atlas:set-state") {
      updateLayerVisibility(data.layer || "overview");
      lightOn = data.lightOn !== false;
      key.intensity = lightOn ? 2.7 : 1.25;
      rim.intensity = lightOn ? 1.5 : 0.8;
      focusEntity(data.selectedId || activeEntityId, data.camera || undefined);
    }
    if (data.type === "atlas:command") applyCommand(data.command);
  });

  renderer.domElement.addEventListener("pointerdown", (event) => {
    pointerDown = { x: event.clientX, y: event.clientY };
  });

  renderer.domElement.addEventListener("pointerup", (event) => {
    if (!pointerDown) return;
    const movement = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    pointerDown = null;
    if (movement > 6) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables.filter((item) => item.visible !== false), true);
    const hit = hits.find((item) => item.object?.userData?.entityId);
    if (!hit) return;
    const id = hit.object.userData.entityId;
    if (id) sendSelection(id);
  });

  controls.addEventListener("start", () => { flyFrames = 0; });

  function resize() {
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  new ResizeObserver(resize).observe(root);
  resize();

  const clock = new THREE.Clock();
  let paused = false;
  document.addEventListener("visibilitychange", () => { paused = document.hidden; });

  function animate() {
    requestAnimationFrame(animate);
    if (paused) return;
    const dt = Math.min(clock.getDelta(), 0.05);

    if (flyFrames > 0) {
      camera.position.lerp(cameraGoal, 0.12);
      controls.target.lerp(targetGoal, 0.12);
      flyFrames -= 1;
      if (flyFrames === 0) {
        camera.position.copy(cameraGoal);
        controls.target.copy(targetGoal);
      }
    }

    if (physiologyGroup.visible) {
      const elapsed = clock.elapsedTime;
      flowSpheres.forEach((mesh, index) => {
        const meta = flowMeta[index];
        const t = reducedMotion ? meta.phase : (meta.phase + elapsed * meta.speed) % 1;
        mesh.position.copy(flowCurves[index].getPointAt(t));
      });
      transpiration.forEach((item) => {
        const t = reducedMotion ? item.phase % 1 : (item.phase + elapsed * 0.12) % 1;
        item.mesh.position.copy(item.source).add(new THREE.Vector3(0.08 * Math.sin(t * Math.PI * 2), t * 0.82, 0));
        item.mesh.material.opacity = 0.55 * (1 - t);
      });
    }

    if (microGroup.visible && !reducedMotion) {
      magnified.rotation.y += dt * 0.22;
    }
    diagnosticGroup.children.forEach((child) => child.lookAt(camera.position));

    controls.update();
    renderer.render(scene, camera);
  }

  updateLayerVisibility("overview");
  focusEntity("trichomes_resin", { yaw: 26, pitch: -14, zoom: 2.15 });
  animate();
  status.hidden = true;
  window.parent.postMessage({ type: "atlas:ready", renderer: "three", version: "0.185.1" }, window.location.origin);
}
