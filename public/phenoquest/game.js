const GAME_VERSION = "0.1.0";
const PLAYER_RADIUS = 0.58;
const WALK_SPEED = 4.4;
const RUN_SPEED = 7.4;
const JUMP_SPEED = 7.2;
const GRAVITY = -19;
const WORLD_X_LIMIT = 25;
const WORLD_Z_MIN = -58;
const WORLD_Z_MAX = 18;

function required(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required PhenoQuest element: #${id}`);
  return element;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export async function startPhenoQuest(THREE) {
  if (!THREE?.WebGLRenderer) throw new Error("Three.js WebGLRenderer is unavailable.");

  const response = await fetch("./game-data.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load PhenoQuest data (${response.status}).`);
  const data = await response.json();
  if (!Array.isArray(data.phenos) || data.phenos.length < 6) throw new Error("PhenoQuest requires six canonical Pheno records.");

  const loading = required("loading");
  const hud = required("hud");
  const viewport = required("viewport");
  const objectiveTitle = required("objective-title");
  const objectiveCopy = required("objective-copy");
  const activeName = required("active-name");
  const levelReadout = required("level-readout");
  const archiveReadout = required("archive-readout");
  const zoneReadout = required("zone-readout");
  const prompt = required("prompt");
  const promptCopy = required("prompt-copy");
  const starterPanel = required("starter-panel");
  const starterGrid = required("starter-grid");
  const battlePanel = required("battle-panel");
  const battleKicker = required("battle-kicker");
  const battleTitle = required("battle-title");
  const battleTurn = required("battle-turn");
  const battlePlayerName = required("battle-player-name");
  const battleEnemyName = required("battle-enemy-name");
  const playerResolveBar = required("player-resolve-bar");
  const enemyResolveBar = required("enemy-resolve-bar");
  const playerResolveReadout = required("player-resolve");
  const enemyResolveReadout = required("enemy-resolve");
  const playerChargeReadout = required("player-charge");
  const enemyAffinity = required("enemy-affinity");
  const playerOrb = required("player-orb");
  const enemyOrb = required("enemy-orb");
  const battleMessage = required("battle-message");
  const battleActions = required("battle-actions");
  const signatureName = required("signature-name");
  const signatureButton = required("signature-button");
  const battleContinue = required("battle-continue");
  const logPanel = required("log-panel");
  const logGrid = required("log-grid");
  const logSummary = required("log-summary");
  const logButton = required("log-button");
  const logClose = required("log-close");
  const saveButton = required("save-button");
  const trialComplete = required("trial-complete");
  const completeContinue = required("complete-continue");
  const newRunButton = required("new-run-button");
  const movePad = required("move-pad");
  const moveKnob = required("move-knob");
  const lookPad = required("look-pad");
  const jumpButton = required("jump-button");
  const interactButton = required("interact-button");
  const fpsReadout = required("fps");
  const callsReadout = required("calls");
  const trianglesReadout = required("triangles");

  const phenoById = new Map(data.phenos.map((pheno) => [pheno.id, pheno]));
  const defaultSave = {
    version: 1,
    activeId: null,
    archived: [],
    defeatedEncounters: [],
    level: 1,
    xp: 0,
    gardenTrialComplete: false,
    position: { x: 0, y: 0, z: 13 },
  };
  const saved = safeParse(localStorage.getItem(data.saveKey) || "", defaultSave);
  const save = {
    ...defaultSave,
    ...saved,
    archived: Array.isArray(saved.archived) ? [...new Set(saved.archived.filter((id) => phenoById.has(id)))] : [],
    defeatedEncounters: Array.isArray(saved.defeatedEncounters) ? [...new Set(saved.defeatedEncounters)] : [],
    activeId: phenoById.has(saved.activeId) ? saved.activeId : null,
    position: saved.position && Number.isFinite(saved.position.x) && Number.isFinite(saved.position.z)
      ? { x: saved.position.x, y: Math.max(0, Number(saved.position.y) || 0), z: saved.position.z }
      : { ...defaultSave.position },
  };

  let saveToastTimer = 0;
  function persist(showFeedback = false) {
    save.position = {
      x: Number(playerPosition.x.toFixed(3)),
      y: Number(playerPosition.y.toFixed(3)),
      z: Number(playerPosition.z.toFixed(3)),
    };
    localStorage.setItem(data.saveKey, JSON.stringify(save));
    if (showFeedback) {
      saveButton.textContent = "Saved";
      window.clearTimeout(saveToastTimer);
      saveToastTimer = window.setTimeout(() => { saveButton.textContent = "Save"; }, 900);
    }
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x071108);
  scene.fog = new THREE.FogExp2(0x071108, 0.018);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 150);
  camera.position.set(0, 5.8, 20);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (error) {
    throw new Error(error instanceof Error ? `WebGL initialization failed: ${error.message}` : "WebGL initialization failed.");
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute("aria-label", "PhenoQuest 3D world. Use WASD to move, Space to jump, E to interact, and drag to rotate the camera.");
  viewport.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xd9f5d0, 0x11180f, 1.65));
  const sun = new THREE.DirectionalLight(0xfff0ca, 3.2);
  sun.position.set(-16, 27, 11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -34;
  sun.shadow.camera.right = 34;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -55;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 100;
  scene.add(sun);
  const fieldGlow = new THREE.DirectionalLight(0x89c7ff, 0.72);
  fieldGlow.position.set(18, 12, -42);
  scene.add(fieldGlow);

  const root = new THREE.Group();
  scene.add(root);
  const colliders = [];
  const interactables = [];

  const materials = {
    earth: new THREE.MeshStandardMaterial({ color: 0x18301e, roughness: 0.98 }),
    path: new THREE.MeshStandardMaterial({ color: 0x566750, roughness: 0.92 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6d4b31, roughness: 0.94 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x4f9b55, roughness: 0.88 }),
    leafDark: new THREE.MeshStandardMaterial({ color: 0x28623b, roughness: 0.9 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x77807a, roughness: 0.85 }),
    town: new THREE.MeshStandardMaterial({ color: 0x293a2d, roughness: 0.8 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xaedbc0, roughness: 0.18, transparent: true, opacity: 0.2, depthWrite: false }),
    glow: new THREE.MeshStandardMaterial({ color: 0xc7ef6f, emissive: 0x6e9c2e, emissiveIntensity: 2.4, roughness: 0.3 }),
    gate: new THREE.MeshStandardMaterial({ color: 0x4a3654, emissive: 0x351948, emissiveIntensity: 0.8, roughness: 0.55 }),
    player: new THREE.MeshStandardMaterial({ color: 0x9b6b47, roughness: 0.78 }),
    playerLight: new THREE.MeshStandardMaterial({ color: 0xd5aa82, roughness: 0.7 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf6f4df, roughness: 0.7 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x142018, roughness: 0.88 }),
  };

  function mesh(geometry, material, { position, rotation, scale, castShadow = true, receiveShadow = true, parent = root } = {}) {
    const object = new THREE.Mesh(geometry, material);
    if (position) object.position.set(...position);
    if (rotation) object.rotation.set(...rotation);
    if (scale) object.scale.set(...scale);
    object.castShadow = castShadow;
    object.receiveShadow = receiveShadow;
    parent.add(object);
    return object;
  }

  function addBox({ x, y = 0, z, width, height, depth, material = materials.town, collision = true }) {
    const object = mesh(new THREE.BoxGeometry(width, height, depth), material, { position: [x, y + height / 2, z] });
    if (collision) colliders.push({ minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2, enabled: true });
    return object;
  }

  mesh(new THREE.PlaneGeometry(58, 82), materials.earth, { position: [0, -0.04, -20], rotation: [-Math.PI / 2, 0, 0], castShadow: false });
  mesh(new THREE.BoxGeometry(5, 0.08, 72), materials.path, { position: [0, 0.01, -18], castShadow: false });
  mesh(new THREE.BoxGeometry(32, 0.07, 4.2), materials.path, { position: [0, 0.015, -14], castShadow: false });
  mesh(new THREE.BoxGeometry(34, 0.07, 4.2), materials.path, { position: [1, 0.015, -31], castShadow: false });

  function addTree(x, z, scale = 1) {
    mesh(new THREE.CylinderGeometry(0.25 * scale, 0.34 * scale, 2.6 * scale, 8), materials.wood, { position: [x, 1.3 * scale, z] });
    mesh(new THREE.SphereGeometry(1.25 * scale, 10, 8), materials.leaf, { position: [x, 3.05 * scale, z], scale: [0.86, 1.05, 0.86] });
    colliders.push({ minX: x - 0.45 * scale, maxX: x + 0.45 * scale, minZ: z - 0.45 * scale, maxZ: z + 0.45 * scale, enabled: true });
  }

  [
    [-9, 12, 1.0], [9, 11, 1.05], [-14, 3, 1.2], [14, 1, 1.0],
    [-19, -11, 1.15], [19, -12, 1.1], [-18, -27, 1.2], [18, -30, 1.0],
    [-11, -42, 1.25], [11, -43, 1.1], [-21, -49, 1.05], [20, -51, 1.2],
  ].forEach(([x, z, scale]) => addTree(x, z, scale));

  function addTownBuilding(x, z, width, depth, accent = false) {
    addBox({ x, z, width, height: 3.7, depth, material: materials.town });
    const roof = mesh(new THREE.ConeGeometry(Math.max(width, depth) * 0.64, 2.1, 4), accent ? materials.glow : materials.leafDark, { position: [x, 4.7, z], rotation: [0, Math.PI / 4, 0] });
    roof.scale.y = 0.62;
  }

  addTownBuilding(-8.5, 7.5, 6.4, 5.2, true);
  addTownBuilding(8.7, 6.7, 6, 5.4);
  addTownBuilding(-10.5, -1.5, 5.2, 5.4);
  addTownBuilding(10.8, -2.6, 5.6, 5.6);

  for (let z = -10; z >= -40; z -= 6) {
    for (const x of [-8, 8]) {
      for (let offset = -2; offset <= 2; offset += 2) {
        const leafMaterial = offset === 0 ? materials.leaf : materials.leafDark;
        mesh(new THREE.CylinderGeometry(0.045, 0.07, 0.85, 6), leafMaterial, { position: [x + offset, 0.43, z] });
        mesh(new THREE.SphereGeometry(0.38, 8, 6), leafMaterial, { position: [x + offset, 0.95, z], scale: [0.8, 1.08, 0.8] });
      }
    }
  }

  const starterPedestal = mesh(new THREE.CylinderGeometry(1.55, 1.8, 0.65, 16), materials.stone, { position: [0, 0.32, 9.5] });
  const starterGlow = mesh(new THREE.TorusGeometry(1.3, 0.08, 10, 30), materials.glow, { position: [0, 0.72, 9.5], rotation: [Math.PI / 2, 0, 0] });
  interactables.push({ id: "starter", position: new THREE.Vector3(0, 0, 9.5), radius: 2.5, label: "Choose a starter", type: "starter" });

  const encounterMarkers = new Map();
  for (const encounter of data.encounters) {
    const pheno = phenoById.get(encounter.phenoId);
    const position = new THREE.Vector3(...encounter.position);
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(pheno.color), emissive: new THREE.Color(pheno.color), emissiveIntensity: 1.5, roughness: 0.38 });
    const group = new THREE.Group();
    group.position.copy(position);
    root.add(group);
    mesh(new THREE.IcosahedronGeometry(0.72, 1), material, { position: [0, 1.1, 0], parent: group });
    const ring = mesh(new THREE.TorusGeometry(1.05, 0.07, 8, 24), material, { position: [0, 0.15, 0], rotation: [Math.PI / 2, 0, 0], castShadow: false, parent: group });
    ring.material.transparent = true;
    ring.material.opacity = 0.7;
    encounterMarkers.set(encounter.id, group);
    interactables.push({ id: encounter.id, encounter, pheno, position, radius: 2.2, label: `Stabilize ${pheno.name}`, type: "encounter" });
  }

  const gateCollider = { minX: -7, maxX: 7, minZ: data.progression.lockoutGateZ - 0.6, maxZ: data.progression.lockoutGateZ + 0.6, enabled: true };
  colliders.push(gateCollider);
  const gate = addBox({ x: 0, z: data.progression.lockoutGateZ, width: 14, height: 4.4, depth: 0.7, material: materials.gate, collision: false });
  const gateLight = new THREE.PointLight(0xa96ee8, 5, 18);
  gateLight.position.set(0, 3.2, data.progression.lockoutGateZ + 1.5);
  scene.add(gateLight);

  const trialPosition = new THREE.Vector3(...data.progression.gardenTrialPosition);
  const trialPlatform = mesh(new THREE.CylinderGeometry(5.2, 5.8, 0.45, 32), materials.stone, { position: [trialPosition.x, 0.2, trialPosition.z] });
  const trialRing = mesh(new THREE.TorusGeometry(4.1, 0.12, 10, 40), materials.glow, { position: [trialPosition.x, 0.48, trialPosition.z], rotation: [Math.PI / 2, 0, 0] });
  interactables.push({ id: "garden-trial", position: trialPosition, radius: 3.2, label: "Begin Garden Trial", type: "trial" });

  const player = new THREE.Group();
  scene.add(player);
  mesh(new THREE.SphereGeometry(0.52, 16, 12), materials.player, { position: [0, 1.62, 0], scale: [0.82, 1.08, 0.82], parent: player });
  mesh(new THREE.SphereGeometry(0.36, 14, 10), materials.playerLight, { position: [0, 2.34, 0], parent: player });
  for (const side of [-1, 1]) {
    mesh(new THREE.CapsuleGeometry(0.11, 0.62, 4, 8), materials.dark, { position: [side * 0.45, 1.47, 0], rotation: [0, 0, side * 0.18], parent: player });
    mesh(new THREE.CapsuleGeometry(0.12, 0.72, 4, 8), materials.dark, { position: [side * 0.2, 0.58, 0], parent: player });
  }
  mesh(new THREE.SphereGeometry(0.09, 8, 6), materials.dark, { position: [-0.13, 2.39, 0.31], parent: player });
  mesh(new THREE.SphereGeometry(0.09, 8, 6), materials.dark, { position: [0.13, 2.39, 0.31], parent: player });

  const playerPosition = new THREE.Vector3(save.position.x, save.position.y, save.position.z);
  const horizontalVelocity = new THREE.Vector3();
  let verticalVelocity = 0;
  let grounded = playerPosition.y <= 0.001;
  let cameraYaw = 0;
  let cameraPitch = 0.36;
  let cameraDistance = 7.2;
  let currentInteractable = null;
  let battle = null;
  let modalOpen = false;
  let disposed = false;
  let currentZone = "Seedling Town";

  const keys = new Set();
  const touchMove = new THREE.Vector2();
  let movePointer = null;
  let lookPointer = null;
  let lastLookX = 0;
  let lastLookY = 0;

  function archivedSet() {
    return new Set(save.archived);
  }

  function updateGate() {
    const unlocked = save.archived.length >= data.progression.samplesBeforeLockout;
    gateCollider.enabled = !unlocked;
    gate.visible = !unlocked;
    gateLight.visible = !unlocked;
  }

  function updateEncounterVisibility() {
    const defeated = new Set(save.defeatedEncounters);
    for (const encounter of data.encounters) {
      const marker = encounterMarkers.get(encounter.id);
      if (marker) marker.visible = !defeated.has(encounter.id);
    }
  }

  function activePheno() {
    return phenoById.get(save.activeId) || null;
  }

  function updateHUD() {
    const active = activePheno();
    activeName.textContent = active?.name || "—";
    levelReadout.textContent = String(save.level);
    archiveReadout.textContent = `${save.archived.length} / ${data.phenos.length}`;
    zoneReadout.textContent = currentZone;
    updateGate();
    updateEncounterVisibility();
    updateObjective();
  }

  function updateObjective() {
    if (!save.activeId) {
      objectiveTitle.textContent = "Choose a starter Pheno";
      objectiveCopy.textContent = "Approach the glowing Vault pedestal in Seedling Town and choose your first field partner.";
      return;
    }
    if (save.gardenTrialComplete) {
      if (save.archived.length < data.phenos.length) {
        objectiveTitle.textContent = "Complete the PhenoLog";
        objectiveCopy.textContent = `${data.phenos.length - save.archived.length} living sample${data.phenos.length - save.archived.length === 1 ? " remains" : "s remain"} in the Terp Fields.`;
      } else {
        objectiveTitle.textContent = "Living Seed Vault secured";
        objectiveCopy.textContent = "All six MVP Phenos are archived and the first Garden Trial is complete.";
      }
      return;
    }
    if (save.archived.length < data.progression.samplesBeforeLockout) {
      const remaining = data.progression.samplesBeforeLockout - save.archived.length;
      objectiveTitle.textContent = "Archive field samples";
      objectiveCopy.textContent = `Stabilize ${remaining} more sample${remaining === 1 ? "" : "s"} in the Terp Fields to break Team Lockout’s first barrier.`;
      return;
    }
    objectiveTitle.textContent = "Reach the Garden Trial";
    objectiveCopy.textContent = "Team Lockout’s barrier is down. Follow the southern path and challenge the Garden Trial.";
  }

  function renderStarterChoices() {
    starterGrid.replaceChildren();
    for (const id of data.starters) {
      const pheno = phenoById.get(id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "starter-option";
      button.innerHTML = `
        <span class="starter-emblem" style="display:block;background:${pheno.color}"></span>
        <span class="affinity">${pheno.affinity} affinity</span>
        <h3>${pheno.name}</h3>
        <p>${pheno.description}</p>
        <span class="stat-line"><span>Resolve</span><strong>${pheno.stats.resolve}</strong></span>
        <span class="stat-line"><span>Power / Guard</span><strong>${pheno.stats.power} / ${pheno.stats.guard}</strong></span>
        <span class="stat-line"><span>Speed / Focus</span><strong>${pheno.stats.speed} / ${pheno.stats.focus}</strong></span>
      `;
      button.addEventListener("click", () => chooseStarter(id));
      starterGrid.appendChild(button);
    }
  }

  function chooseStarter(id) {
    if (!data.starters.includes(id)) return;
    save.activeId = id;
    if (!save.archived.includes(id)) save.archived.push(id);
    starterPanel.hidden = true;
    modalOpen = false;
    clearInput();
    persist();
    updateHUD();
    renderLog();
    renderer.domElement.focus({ preventScroll: true });
  }

  function renderLog() {
    const archived = archivedSet();
    logSummary.textContent = `${save.archived.length} of ${data.phenos.length} Phenos archived. Garden Trial ${save.gardenTrialComplete ? "cleared" : "not yet cleared"}.`;
    logGrid.replaceChildren();
    for (const pheno of data.phenos) {
      const unlocked = archived.has(pheno.id);
      const article = document.createElement("article");
      article.className = `log-entry${unlocked ? "" : " locked"}`;
      article.style.setProperty("--entry-color", unlocked ? pheno.color : "#526054");
      article.innerHTML = unlocked
        ? `<div class="mini-emblem"></div><span class="affinity">${pheno.affinity}</span><h3>${pheno.name}</h3><p>${pheno.description}</p><p>Aroma record: ${pheno.aroma}. Signature: ${pheno.signature.name}.</p>`
        : `<div class="mini-emblem"></div><span class="affinity">Unarchived</span><h3>Unknown Pheno</h3><p>Locate and stabilize this living sample in the Terp Fields.</p>`;
      logGrid.appendChild(article);
    }
  }

  function openLog() {
    if (battle || !starterPanel.hidden || !trialComplete.hidden) return;
    renderLog();
    logPanel.hidden = false;
    modalOpen = true;
    clearInput();
  }

  function closeLog() {
    logPanel.hidden = true;
    modalOpen = false;
    renderer.domElement.focus({ preventScroll: true });
  }

  function playerCollides(x, z) {
    if (x - PLAYER_RADIUS < -WORLD_X_LIMIT || x + PLAYER_RADIUS > WORLD_X_LIMIT) return true;
    if (z - PLAYER_RADIUS < WORLD_Z_MIN || z + PLAYER_RADIUS > WORLD_Z_MAX) return true;
    return colliders.some((box) => box.enabled !== false && x + PLAYER_RADIUS > box.minX && x - PLAYER_RADIUS < box.maxX && z + PLAYER_RADIUS > box.minZ && z - PLAYER_RADIUS < box.maxZ);
  }

  function attemptMove(dx, dz) {
    const nextX = playerPosition.x + dx;
    if (!playerCollides(nextX, playerPosition.z)) playerPosition.x = nextX;
    const nextZ = playerPosition.z + dz;
    if (!playerCollides(playerPosition.x, nextZ)) playerPosition.z = nextZ;
  }

  function jump() {
    if (!grounded || modalOpen) return;
    grounded = false;
    verticalVelocity = JUMP_SPEED;
  }

  function nearestInteractable() {
    let nearest = null;
    let best = Infinity;
    for (const item of interactables) {
      if (item.type === "encounter" && save.defeatedEncounters.includes(item.id)) continue;
      if (item.type === "starter" && save.activeId) continue;
      if (item.type === "trial" && save.gardenTrialComplete) continue;
      const distance = Math.hypot(playerPosition.x - item.position.x, playerPosition.z - item.position.z);
      if (distance <= item.radius && distance < best) {
        nearest = item;
        best = distance;
      }
    }
    return nearest;
  }

  function interact() {
    if (modalOpen) return;
    const item = currentInteractable;
    if (!item) return;
    if (item.type === "starter") {
      starterPanel.hidden = false;
      modalOpen = true;
      clearInput();
      return;
    }
    if (item.type === "encounter") {
      if (!save.activeId) {
        objectiveTitle.textContent = "Choose a starter first";
        objectiveCopy.textContent = "Return to the glowing Vault pedestal in Seedling Town.";
        return;
      }
      startBattle(item.pheno, { kind: "encounter", encounterId: item.id });
      return;
    }
    if (item.type === "trial") {
      if (save.archived.length < data.progression.samplesBeforeLockout) return;
      const boss = phenoById.get(data.progression.gardenTrialBoss);
      startBattle(boss, { kind: "trial", encounterId: "garden-trial" });
    }
  }

  function createBattleState(enemy, source) {
    const active = activePheno();
    const levelScale = 1 + (save.level - 1) * 0.06;
    return {
      active,
      enemy,
      source,
      turn: 1,
      playerMax: Math.round(active.stats.resolve * levelScale),
      playerResolve: Math.round(active.stats.resolve * levelScale),
      enemyMax: source.kind === "trial" ? Math.round(enemy.stats.resolve * 1.3) : enemy.stats.resolve,
      enemyResolve: source.kind === "trial" ? Math.round(enemy.stats.resolve * 1.3) : enemy.stats.resolve,
      focus: 0,
      brace: false,
      finished: false,
      won: false,
    };
  }

  function startBattle(enemy, source) {
    battle = createBattleState(enemy, source);
    modalOpen = true;
    clearInput();
    battlePanel.hidden = false;
    battleContinue.hidden = true;
    battleActions.hidden = false;
    battleKicker.textContent = source.kind === "trial" ? "GARDEN TRIAL" : "RESOLVE TRIAL";
    battleTitle.textContent = source.kind === "trial" ? "Vault Warden Trial" : `Stabilize ${enemy.name}`;
    battlePlayerName.textContent = battle.active.name;
    battleEnemyName.textContent = enemy.name;
    enemyAffinity.textContent = `${enemy.affinity} affinity`;
    signatureName.textContent = battle.active.signature.name;
    playerOrb.style.setProperty("--orb-color", battle.active.color);
    enemyOrb.style.setProperty("--orb-color", enemy.color);
    battleMessage.textContent = source.kind === "trial" ? "The Vault Warden challenges your field discipline." : `${enemy.name} is unstable. Reduce its Resolve without losing your own.`;
    renderBattle();
  }

  function renderBattle() {
    if (!battle) return;
    battleTurn.textContent = `Turn ${battle.turn}`;
    playerResolveReadout.textContent = `${Math.max(0, battle.playerResolve)} / ${battle.playerMax}`;
    enemyResolveReadout.textContent = `${Math.max(0, battle.enemyResolve)} / ${battle.enemyMax}`;
    playerChargeReadout.textContent = String(battle.focus);
    playerResolveBar.style.width = `${clamp01(battle.playerResolve / battle.playerMax) * 100}%`;
    enemyResolveBar.style.width = `${clamp01(battle.enemyResolve / battle.enemyMax) * 100}%`;
    signatureButton.disabled = battle.focus < 2 || battle.finished;
    for (const button of battleActions.querySelectorAll("button")) {
      if (button !== signatureButton) button.disabled = battle.finished;
    }
  }

  function damage(basePower, attack, guard, varianceSeed) {
    const variance = 0.9 + ((varianceSeed * 37) % 17) / 100;
    return Math.max(6, Math.round((basePower + attack * 0.62 - guard * 0.28) * variance));
  }

  function enemyTurn() {
    if (!battle || battle.finished || battle.enemyResolve <= 0) return;
    const enemyPower = battle.enemy.stats.power + (battle.source.kind === "trial" ? 4 : 0);
    let hit = damage(15, enemyPower, battle.active.stats.guard, battle.turn + 3);
    if (battle.brace) hit = Math.max(1, Math.round(hit * 0.48));
    battle.brace = false;
    battle.playerResolve -= hit;
    if (battle.playerResolve <= 0) {
      battle.playerResolve = 0;
      finishBattle(false, `${battle.enemy.name} held the field. Recover and try the trial again.`);
      return;
    }
    battleMessage.textContent += ` ${battle.enemy.name} answers for ${hit} Resolve.`;
    battle.turn += 1;
    renderBattle();
  }

  function finishBattle(won, message) {
    if (!battle) return;
    battle.finished = true;
    battle.won = won;
    battleMessage.textContent = message;
    battleActions.hidden = true;
    battleContinue.hidden = false;
    if (won) {
      if (battle.source.kind === "encounter") {
        if (!save.defeatedEncounters.includes(battle.source.encounterId)) save.defeatedEncounters.push(battle.source.encounterId);
        if (!save.archived.includes(battle.enemy.id)) save.archived.push(battle.enemy.id);
        save.xp += 40;
      } else {
        save.gardenTrialComplete = true;
        save.xp += 100;
      }
      save.level = 1 + Math.floor(save.xp / 100);
      persist();
      updateHUD();
      renderLog();
    }
    renderBattle();
  }

  function useBattleAction(action) {
    if (!battle || battle.finished) return;
    const { active, enemy } = battle;
    if (action === "pulse") {
      const hit = damage(18, active.stats.power, enemy.stats.guard, battle.turn);
      battle.enemyResolve -= hit;
      battle.focus = Math.min(4, battle.focus + 1);
      battleMessage.textContent = `${active.name} used Pulse for ${hit} Resolve.`;
    } else if (action === "brace") {
      battle.brace = true;
      battle.focus = Math.min(4, battle.focus + 1);
      battleMessage.textContent = `${active.name} braces for the next response and gains Focus.`;
    } else if (action === "cultivate") {
      const heal = Math.max(8, Math.round(active.stats.focus * 0.8));
      battle.playerResolve = Math.min(battle.playerMax, battle.playerResolve + heal);
      battle.focus = Math.min(4, battle.focus + 1);
      battleMessage.textContent = `${active.name} cultivates composure and restores ${heal} Resolve.`;
    } else if (action === "signature") {
      if (battle.focus < 2) return;
      battle.focus -= 2;
      const hit = damage(active.signature.power, active.stats.power + active.stats.focus * 0.35, enemy.stats.guard, battle.turn + 9);
      battle.enemyResolve -= hit;
      if (active.signature.effect === "heal") battle.playerResolve = Math.min(battle.playerMax, battle.playerResolve + 12);
      if (active.signature.effect === "guard") battle.brace = true;
      battleMessage.textContent = `${active.name} used ${active.signature.name} for ${hit} Resolve.`;
    }

    if (battle.enemyResolve <= 0) {
      battle.enemyResolve = 0;
      const message = battle.source.kind === "trial"
        ? "Garden Trial cleared. The first Living Seed Vault route is secure."
        : `${enemy.name} stabilized. Its living record has been added to the PhenoLog.`;
      finishBattle(true, message);
      return;
    }
    renderBattle();
    window.setTimeout(enemyTurn, 260);
  }

  function closeBattle() {
    if (!battle?.finished) return;
    const completedTrial = battle.won && battle.source.kind === "trial";
    battlePanel.hidden = true;
    battle = null;
    modalOpen = false;
    clearInput();
    if (completedTrial) {
      trialComplete.hidden = false;
      modalOpen = true;
    } else {
      renderer.domElement.focus({ preventScroll: true });
    }
  }

  function resetSave() {
    localStorage.removeItem(data.saveKey);
    save.activeId = null;
    save.archived = [];
    save.defeatedEncounters = [];
    save.level = 1;
    save.xp = 0;
    save.gardenTrialComplete = false;
    playerPosition.set(0, 0, 13);
    horizontalVelocity.set(0, 0, 0);
    verticalVelocity = 0;
    grounded = true;
    cameraYaw = 0;
    trialComplete.hidden = true;
    starterPanel.hidden = true;
    modalOpen = false;
    persist();
    renderLog();
    updateHUD();
    renderer.domElement.focus({ preventScroll: true });
  }

  for (const button of battleActions.querySelectorAll("button[data-action]")) {
    button.addEventListener("click", () => useBattleAction(button.dataset.action));
  }
  battleContinue.addEventListener("click", closeBattle);
  logButton.addEventListener("click", openLog);
  logClose.addEventListener("click", closeLog);
  saveButton.addEventListener("click", () => persist(true));
  completeContinue.addEventListener("click", () => {
    trialComplete.hidden = true;
    modalOpen = false;
    renderer.domElement.focus({ preventScroll: true });
  });
  newRunButton.addEventListener("click", resetSave);

  function clearInput() {
    keys.clear();
    touchMove.set(0, 0);
    moveKnob.style.transform = "translate(-50%, -50%)";
  }

  function handleKeyDown(event) {
    const code = event.code;
    if (["KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft", "ShiftRight", "Space", "KeyE", "KeyL"].includes(code)) event.preventDefault();
    if (code === "Space" && !event.repeat) jump();
    if (code === "KeyE" && !event.repeat) interact();
    if (code === "KeyL" && !event.repeat) openLog();
    keys.add(code);
  }

  function handleKeyUp(event) {
    keys.delete(event.code);
  }

  function beginLook(pointerId, x, y) {
    lookPointer = pointerId;
    lastLookX = x;
    lastLookY = y;
  }

  function updateLook(x, y) {
    if (lookPointer === null || modalOpen) return;
    const dx = x - lastLookX;
    const dy = y - lastLookY;
    lastLookX = x;
    lastLookY = y;
    cameraYaw -= dx * 0.006;
    cameraPitch = THREE.MathUtils.clamp(cameraPitch - dy * 0.0045, 0.12, 1.02);
  }

  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    renderer.domElement.focus({ preventScroll: true });
    renderer.domElement.setPointerCapture(event.pointerId);
    beginLook(event.pointerId, event.clientX, event.clientY);
  });
  renderer.domElement.addEventListener("pointermove", (event) => {
    if (event.pointerId === lookPointer) updateLook(event.clientX, event.clientY);
  });
  renderer.domElement.addEventListener("pointerup", (event) => {
    if (event.pointerId === lookPointer) lookPointer = null;
  });
  renderer.domElement.addEventListener("pointercancel", (event) => {
    if (event.pointerId === lookPointer) lookPointer = null;
  });
  renderer.domElement.addEventListener("wheel", (event) => {
    cameraDistance = THREE.MathUtils.clamp(cameraDistance + Math.sign(event.deltaY) * 0.45, 4.8, 10);
  }, { passive: true });

  function updateMovePad(event) {
    const rect = movePad.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;
    const max = rect.width * 0.34;
    const length = Math.hypot(dx, dy);
    if (length > max) {
      dx = dx / length * max;
      dy = dy / length * max;
    }
    touchMove.set(dx / max, -dy / max);
    moveKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  movePad.addEventListener("pointerdown", (event) => {
    movePointer = event.pointerId;
    movePad.setPointerCapture(event.pointerId);
    updateMovePad(event);
  });
  movePad.addEventListener("pointermove", (event) => {
    if (event.pointerId === movePointer) updateMovePad(event);
  });
  const releaseMove = (event) => {
    if (event.pointerId !== movePointer) return;
    movePointer = null;
    touchMove.set(0, 0);
    moveKnob.style.transform = "translate(-50%, -50%)";
  };
  movePad.addEventListener("pointerup", releaseMove);
  movePad.addEventListener("pointercancel", releaseMove);

  lookPad.addEventListener("pointerdown", (event) => {
    lookPad.setPointerCapture(event.pointerId);
    beginLook(event.pointerId, event.clientX, event.clientY);
  });
  lookPad.addEventListener("pointermove", (event) => {
    if (event.pointerId === lookPointer) updateLook(event.clientX, event.clientY);
  });
  const releaseLook = (event) => {
    if (event.pointerId === lookPointer) lookPointer = null;
  };
  lookPad.addEventListener("pointerup", releaseLook);
  lookPad.addEventListener("pointercancel", releaseLook);
  jumpButton.addEventListener("pointerdown", (event) => { event.preventDefault(); jump(); });
  interactButton.addEventListener("pointerdown", (event) => { event.preventDefault(); interact(); });

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", clearInput);
  document.addEventListener("visibilitychange", () => { if (document.hidden) clearInput(); });

  function resize() {
    const width = Math.max(1, viewport.clientWidth);
    const height = Math.max(1, viewport.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.setSize(width, height, false);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  resize();

  const inputVector = new THREE.Vector2();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const desiredVelocity = new THREE.Vector3();
  const cameraTarget = new THREE.Vector3();
  const desiredCamera = new THREE.Vector3();

  function updateZone() {
    const next = playerPosition.z > -7 ? "Seedling Town" : playerPosition.z > data.progression.lockoutGateZ ? "Terp Fields" : "Vault Garden";
    if (next !== currentZone) {
      currentZone = next;
      zoneReadout.textContent = next;
    }
  }

  function updatePlayer(dt) {
    const keyboardX = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0);
    const keyboardY = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0);
    inputVector.set(THREE.MathUtils.clamp(keyboardX + touchMove.x, -1, 1), THREE.MathUtils.clamp(keyboardY + touchMove.y, -1, 1));
    if (inputVector.lengthSq() > 1) inputVector.normalize();

    const running = keys.has("ShiftLeft") || keys.has("ShiftRight") || touchMove.length() > 0.88;
    const speed = running ? RUN_SPEED : WALK_SPEED;
    forward.set(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    right.set(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
    desiredVelocity.set(0, 0, 0);
    if (!modalOpen) {
      desiredVelocity.addScaledVector(right, inputVector.x * speed);
      desiredVelocity.addScaledVector(forward, inputVector.y * speed);
    }
    const smoothing = 1 - Math.exp(-10 * dt);
    horizontalVelocity.lerp(desiredVelocity, smoothing);
    attemptMove(horizontalVelocity.x * dt, horizontalVelocity.z * dt);

    if (!grounded || verticalVelocity > 0) {
      verticalVelocity += GRAVITY * dt;
      playerPosition.y += verticalVelocity * dt;
      if (playerPosition.y <= 0) {
        playerPosition.y = 0;
        verticalVelocity = 0;
        grounded = true;
      }
    }

    if (horizontalVelocity.lengthSq() > 0.08) {
      const targetAngle = Math.atan2(horizontalVelocity.x, horizontalVelocity.z);
      let delta = targetAngle - player.rotation.y;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      player.rotation.y += delta * Math.min(1, dt * 11);
    }
    player.position.copy(playerPosition);
    updateZone();

    currentInteractable = modalOpen ? null : nearestInteractable();
    if (currentInteractable) {
      prompt.hidden = false;
      promptCopy.textContent = currentInteractable.label;
    } else {
      prompt.hidden = true;
    }
  }

  function updateCamera(dt) {
    cameraTarget.set(playerPosition.x, playerPosition.y + 1.45, playerPosition.z);
    const horizontal = Math.cos(cameraPitch) * cameraDistance;
    desiredCamera.set(
      cameraTarget.x + Math.sin(cameraYaw) * horizontal,
      cameraTarget.y + Math.sin(cameraPitch) * cameraDistance + 0.65,
      cameraTarget.z + Math.cos(cameraYaw) * horizontal,
    );
    camera.position.lerp(desiredCamera, 1 - Math.exp(-8 * dt));
    camera.lookAt(cameraTarget);
  }

  let frameHandle = 0;
  let lastTime = performance.now();
  let perfWindowStart = lastTime;
  let perfFrames = 0;

  function diagnostics(now) {
    perfFrames += 1;
    const elapsed = now - perfWindowStart;
    if (elapsed < 500) return;
    fpsReadout.textContent = String(Math.round(perfFrames * 1000 / elapsed));
    callsReadout.textContent = String(renderer.info.render.calls);
    trianglesReadout.textContent = renderer.info.render.triangles.toLocaleString();
    perfFrames = 0;
    perfWindowStart = now;
  }

  function animate(now) {
    if (disposed) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;
    updatePlayer(dt);
    updateCamera(dt);

    starterGlow.rotation.z += dt * 0.55;
    trialRing.rotation.z -= dt * 0.32;
    for (const [id, marker] of encounterMarkers) {
      if (!marker.visible) continue;
      marker.rotation.y += dt * (id.length % 2 ? 0.7 : -0.6);
      marker.position.y = Math.sin(now * 0.002 + id.length) * 0.12;
    }

    renderer.render(scene, camera);
    diagnostics(now);
    frameHandle = requestAnimationFrame(animate);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frameHandle);
    resizeObserver.disconnect();
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("blur", clearInput);
    window.clearTimeout(saveToastTimer);
    persist();
    scene.traverse((object) => {
      if (!object.isMesh) return;
      object.geometry?.dispose?.();
      const material = object.material;
      if (Array.isArray(material)) material.forEach((entry) => entry.dispose?.());
      else material?.dispose?.();
    });
    renderer.dispose();
    renderer.domElement.remove();
  }
  window.addEventListener("pagehide", dispose, { once: true });

  renderStarterChoices();
  renderLog();
  updateGate();
  updateEncounterVisibility();
  updateHUD();
  player.position.copy(playerPosition);
  updateCamera(1);
  renderer.render(scene, camera);

  window.__PHENOQUEST__ = {
    version: GAME_VERSION,
    ready: true,
    getState() {
      return {
        activeId: save.activeId,
        archived: [...save.archived],
        defeatedEncounters: [...save.defeatedEncounters],
        level: save.level,
        xp: save.xp,
        gardenTrialComplete: save.gardenTrialComplete,
        modalOpen,
        battle: battle ? { enemyId: battle.enemy.id, source: battle.source.kind, turn: battle.turn, finished: battle.finished, won: battle.won } : null,
        player: { x: Number(playerPosition.x.toFixed(3)), y: Number(playerPosition.y.toFixed(3)), z: Number(playerPosition.z.toFixed(3)) },
        renderer: { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, pixelRatio: renderer.getPixelRatio() },
      };
    },
    chooseStarter,
    openLog,
    resetSave,
  };

  loading.hidden = true;
  hud.hidden = false;
  renderer.domElement.focus({ preventScroll: true });
  lastTime = performance.now();
  perfWindowStart = lastTime;
  frameHandle = requestAnimationFrame(animate);
}
