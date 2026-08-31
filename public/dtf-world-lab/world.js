const WORLD_VERSION = "0.1.0";
const PLAYER_RADIUS = 0.58;
const WORLD_LIMIT = 37.5;
const WALK_SPEED = 4.2;
const RUN_SPEED = 7.2;
const JUMP_SPEED = 7.1;
const GRAVITY = -19;

function getRequiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required World Lab element: #${id}`);
  return element;
}

export async function startWorldLab(THREE) {
  if (!THREE?.WebGLRenderer) throw new Error("Three.js WebGLRenderer is unavailable.");

  const viewport = getRequiredElement("viewport");
  const loading = getRequiredElement("loading");
  const hud = getRequiredElement("hud");
  const objectiveTitle = getRequiredElement("objective-title");
  const objectiveCopy = getRequiredElement("objective-copy");
  const prompt = getRequiredElement("prompt");
  const completeCard = getRequiredElement("complete-card");
  const restartButton = getRequiredElement("restart-button");
  const jumpButton = getRequiredElement("jump-button");
  const interactButton = getRequiredElement("interact-button");
  const movePad = getRequiredElement("move-pad");
  const moveKnob = getRequiredElement("move-knob");
  const lookPad = getRequiredElement("look-pad");
  const fpsReadout = getRequiredElement("fps");
  const callsReadout = getRequiredElement("calls");
  const trianglesReadout = getRequiredElement("triangles");
  const resolutionReadout = getRequiredElement("resolution");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08140e);
  scene.fog = new THREE.Fog(0x08140e, 35, 82);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 130);
  camera.position.set(0, 5.5, 8.5);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch (error) {
    throw new Error(error instanceof Error ? `WebGL initialization failed: ${error.message}` : "WebGL initialization failed.");
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute("aria-label", "DTF World Lab 3D scene. Drag to rotate the camera.");
  viewport.appendChild(renderer.domElement);

  const hemisphere = new THREE.HemisphereLight(0xbfe7c8, 0x172113, 1.9);
  scene.add(hemisphere);

  const sun = new THREE.DirectionalLight(0xfff0c7, 3.1);
  sun.position.set(-18, 28, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -38;
  sun.shadow.camera.right = 38;
  sun.shadow.camera.top = 38;
  sun.shadow.camera.bottom = -38;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 85;
  sun.shadow.bias = -0.0002;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x7aa8ff, 0.55);
  fill.position.set(18, 10, -20);
  scene.add(fill);

  const colliders = [];
  const worldRoot = new THREE.Group();
  scene.add(worldRoot);

  const materials = {
    ground: new THREE.MeshStandardMaterial({ color: 0x17311f, roughness: 0.97, metalness: 0 }),
    path: new THREE.MeshStandardMaterial({ color: 0x405246, roughness: 0.9 }),
    curb: new THREE.MeshStandardMaterial({ color: 0x75806f, roughness: 0.82 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6e4d32, roughness: 0.95 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x4d8a43, roughness: 0.88 }),
    leafDark: new THREE.MeshStandardMaterial({ color: 0x2e6336, roughness: 0.9 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x9da89e, roughness: 0.58, metalness: 0.35 }),
    glass: new THREE.MeshStandardMaterial({
      color: 0xa9d6c0,
      roughness: 0.18,
      metalness: 0.03,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
    building: new THREE.MeshStandardMaterial({ color: 0x263a31, roughness: 0.86 }),
    accent: new THREE.MeshStandardMaterial({ color: 0xb9ec65, roughness: 0.52, emissive: 0x335b13, emissiveIntensity: 0.45 }),
    terminal: new THREE.MeshStandardMaterial({ color: 0x18201c, roughness: 0.42, metalness: 0.52 }),
    screen: new THREE.MeshStandardMaterial({ color: 0xbfee7c, roughness: 0.2, emissive: 0x75b22e, emissiveIntensity: 2.4 }),
    player: new THREE.MeshStandardMaterial({ color: 0x8b5d3f, roughness: 0.78 }),
    playerLight: new THREE.MeshStandardMaterial({ color: 0xd0a37f, roughness: 0.72 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf5f4df, roughness: 0.72 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x172018, roughness: 0.88 }),
  };

  function makeMesh(geometry, material, { position, rotation, scale, castShadow = true, receiveShadow = true } = {}) {
    const mesh = new THREE.Mesh(geometry, material);
    if (position) mesh.position.set(...position);
    if (rotation) mesh.rotation.set(...rotation);
    if (scale) mesh.scale.set(...scale);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    worldRoot.add(mesh);
    return mesh;
  }

  function addSolidBox({ x, y = 0, z, width, height, depth, material = materials.building, collision = true }) {
    const mesh = makeMesh(
      new THREE.BoxGeometry(width, height, depth),
      material,
      { position: [x, y + height / 2, z] },
    );
    if (collision) {
      colliders.push({
        minX: x - width / 2,
        maxX: x + width / 2,
        minZ: z - depth / 2,
        maxZ: z + depth / 2,
      });
    }
    return mesh;
  }

  const ground = makeMesh(
    new THREE.PlaneGeometry(80, 80),
    materials.ground,
    { rotation: [-Math.PI / 2, 0, 0], castShadow: false, receiveShadow: true },
  );
  ground.position.y = -0.035;

  function addPath(x, z, width, depth) {
    makeMesh(
      new THREE.BoxGeometry(width, 0.07, depth),
      materials.path,
      { position: [x, 0.01, z], castShadow: false },
    );
  }

  addPath(0, 8, 4.4, 26);
  addPath(0, -7, 4.4, 8);
  addPath(7, -10, 18, 4.4);
  addPath(15.5, -13, 4.4, 10);

  for (let z = 18; z >= -7; z -= 4.5) {
    makeMesh(
      new THREE.BoxGeometry(0.18, 0.035, 1.8),
      materials.accent,
      { position: [-1.75, 0.065, z], castShadow: false },
    );
    makeMesh(
      new THREE.BoxGeometry(0.18, 0.035, 1.8),
      materials.accent,
      { position: [1.75, 0.065, z], castShadow: false },
    );
  }

  function addTree(x, z, scale = 1) {
    makeMesh(
      new THREE.CylinderGeometry(0.24 * scale, 0.34 * scale, 2.6 * scale, 8),
      materials.wood,
      { position: [x, 1.3 * scale, z] },
    );
    makeMesh(
      new THREE.SphereGeometry(1.35 * scale, 12, 9),
      materials.leaf,
      { position: [x, 3.1 * scale, z], scale: [0.85, 1.05, 0.85] },
    );
    colliders.push({
      minX: x - 0.42 * scale,
      maxX: x + 0.42 * scale,
      minZ: z - 0.42 * scale,
      maxZ: z + 0.42 * scale,
    });
  }

  [
    [-8, 17, 1.1], [8, 16, 0.95], [-11, 8, 1.2], [10.5, 7, 1.0],
    [-10, -2, 0.9], [7.5, -2, 1.15], [-8, -15, 1.05], [28, -9, 1.2],
    [27, -22, 1.0], [8, -26, 1.25], [-18, -22, 1.1], [-24, 3, 1.15],
  ].forEach(([x, z, scale]) => addTree(x, z, scale));

  addSolidBox({ x: -18, z: 11, width: 10, height: 5, depth: 9, material: materials.building });
  addSolidBox({ x: -18, y: 5, z: 11, width: 7, height: 1.4, depth: 6, material: materials.leafDark, collision: false });
  addSolidBox({ x: 18, z: 13, width: 11, height: 4.2, depth: 8, material: materials.building });
  addSolidBox({ x: 18, y: 4.2, z: 13, width: 7, height: 1, depth: 5, material: materials.accent, collision: false });
  addSolidBox({ x: -23, z: -10, width: 8, height: 4, depth: 12, material: materials.building });

  function addGreenhouse() {
    const centerX = 16;
    const centerZ = -15;
    const width = 15;
    const depth = 16;
    const height = 5.2;
    const frameThickness = 0.22;

    makeMesh(
      new THREE.BoxGeometry(width, 0.12, depth),
      new THREE.MeshStandardMaterial({ color: 0x26382b, roughness: 0.9 }),
      { position: [centerX, 0.03, centerZ], castShadow: false },
    );

    const frameXs = [centerX - width / 2, centerX, centerX + width / 2];
    const frameZs = [centerZ - depth / 2, centerZ, centerZ + depth / 2];
    for (const x of frameXs) {
      for (const z of [centerZ - depth / 2, centerZ + depth / 2]) {
        addSolidBox({ x, z, width: frameThickness, height, depth: frameThickness, material: materials.frame, collision: false });
      }
    }
    for (const z of frameZs) {
      for (const x of [centerX - width / 2, centerX + width / 2]) {
        addSolidBox({ x, z, width: frameThickness, height, depth: frameThickness, material: materials.frame, collision: false });
      }
    }

    addSolidBox({ x: centerX - width / 2, z: centerZ, width: 0.24, height, depth, material: materials.glass });
    addSolidBox({ x: centerX + width / 2, z: centerZ, width: 0.24, height, depth, material: materials.glass });
    addSolidBox({ x: centerX, z: centerZ - depth / 2, width, height, depth: 0.24, material: materials.glass });

    const frontZ = centerZ + depth / 2;
    addSolidBox({ x: centerX - 5.3, z: frontZ, width: 4.4, height, depth: 0.24, material: materials.glass });
    addSolidBox({ x: centerX + 5.3, z: frontZ, width: 4.4, height, depth: 0.24, material: materials.glass });

    for (let x = centerX - 5.5; x <= centerX + 5.5; x += 5.5) {
      addSolidBox({ x, y: height - 0.18, z: centerZ, width: 0.18, height: 0.18, depth, material: materials.frame, collision: false });
    }

    const roofLeft = makeMesh(
      new THREE.BoxGeometry(width / 1.42, 0.18, depth),
      materials.glass,
      { position: [centerX - 2.65, height + 1.55, centerZ], rotation: [0, 0, -0.55], castShadow: false },
    );
    const roofRight = makeMesh(
      new THREE.BoxGeometry(width / 1.42, 0.18, depth),
      materials.glass,
      { position: [centerX + 2.65, height + 1.55, centerZ], rotation: [0, 0, 0.55], castShadow: false },
    );
    roofLeft.renderOrder = 1;
    roofRight.renderOrder = 1;

    for (const x of [12, 16, 20]) {
      for (const z of [-18.5, -14.5]) {
        addSolidBox({ x, z, width: 2.5, height: 0.72, depth: 1.3, material: materials.wood });
        for (let plant = -0.75; plant <= 0.75; plant += 0.75) {
          makeMesh(
            new THREE.CylinderGeometry(0.05, 0.07, 0.72, 6),
            materials.leafDark,
            { position: [x + plant, 1.02, z] },
          );
          makeMesh(
            new THREE.SphereGeometry(0.34, 8, 6),
            materials.leaf,
            { position: [x + plant, 1.43, z], scale: [0.8, 1.05, 0.8] },
          );
        }
      }
    }
  }

  addGreenhouse();

  const terminalPosition = new THREE.Vector3(16, 0, -10.6);
  addSolidBox({ x: terminalPosition.x, z: terminalPosition.z, width: 1.3, height: 1.2, depth: 0.9, material: materials.terminal });
  const terminalScreen = makeMesh(
    new THREE.BoxGeometry(0.92, 0.5, 0.06),
    materials.screen,
    { position: [terminalPosition.x, 1.28, terminalPosition.z + 0.46], rotation: [-0.22, 0, 0] },
  );

  const beacon = new THREE.PointLight(0xbfee7c, 7, 8, 2);
  beacon.position.set(terminalPosition.x, 2.3, terminalPosition.z);
  scene.add(beacon);

  const beaconRing = makeMesh(
    new THREE.TorusGeometry(1.5, 0.06, 8, 28),
    materials.accent,
    { position: [terminalPosition.x, 0.16, terminalPosition.z], rotation: [Math.PI / 2, 0, 0], castShadow: false },
  );

  function addDistrictMarker(x, z, labelSeed) {
    addSolidBox({ x, z, width: 0.18, height: 3.2, depth: 0.18, material: materials.frame });
    const sign = addSolidBox({ x, y: 2.25, z, width: 2.2, height: 0.72, depth: 0.15, material: materials.dark, collision: false });
    sign.rotation.y = labelSeed;
  }
  addDistrictMarker(-3.8, 11, 0.06);
  addDistrictMarker(5.2, -7.5, -0.12);

  const player = new THREE.Group();
  scene.add(player);

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 20, 14), materials.player);
  body.scale.set(0.82, 1.18, 0.68);
  body.position.y = 1.02;
  body.castShadow = true;
  body.receiveShadow = true;
  player.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), materials.playerLight);
  belly.scale.set(0.9, 1.35, 0.35);
  belly.position.set(0, 0.96, 0.59);
  belly.castShadow = true;
  player.add(belly);

  const eyeGeometry = new THREE.SphereGeometry(0.065, 10, 8);
  for (const x of [-0.17, 0.17]) {
    const eye = new THREE.Mesh(eyeGeometry, materials.dark);
    eye.position.set(x, 1.27, 0.65);
    player.add(eye);
  }

  const sproutStem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.45, 7), materials.leafDark);
  sproutStem.position.set(0, 1.9, 0);
  sproutStem.castShadow = true;
  player.add(sproutStem);

  for (const [x, rotation] of [[-0.18, -0.7], [0.18, 0.7]]) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 7), materials.leaf);
    leaf.scale.set(1.25, 0.42, 0.65);
    leaf.position.set(x, 2.08, 0);
    leaf.rotation.z = rotation;
    leaf.castShadow = true;
    player.add(leaf);
  }

  const playerPosition = new THREE.Vector3(0, 0, 21);
  const horizontalVelocity = new THREE.Vector3();
  let verticalVelocity = 0;
  let grounded = true;
  let objectiveStage = 0;
  let completed = false;

  const keys = new Set();
  const touchMove = new THREE.Vector2();
  let cameraYaw = Math.PI;
  let cameraPitch = 0.36;
  let cameraDistance = 6.8;
  let lookPointer = null;
  let lastLookX = 0;
  let lastLookY = 0;
  let movePointer = null;

  function clearInput() {
    keys.clear();
    touchMove.set(0, 0);
    moveKnob.style.transform = "translate(-50%, -50%)";
    movePointer = null;
    lookPointer = null;
  }

  function playerCollides(x, z) {
    if (x < -WORLD_LIMIT || x > WORLD_LIMIT || z < -WORLD_LIMIT || z > WORLD_LIMIT) return true;
    for (const collider of colliders) {
      if (
        x + PLAYER_RADIUS > collider.minX &&
        x - PLAYER_RADIUS < collider.maxX &&
        z + PLAYER_RADIUS > collider.minZ &&
        z - PLAYER_RADIUS < collider.maxZ
      ) return true;
    }
    return false;
  }

  function attemptMove(dx, dz) {
    const nextX = playerPosition.x + dx;
    if (!playerCollides(nextX, playerPosition.z)) playerPosition.x = nextX;
    const nextZ = playerPosition.z + dz;
    if (!playerCollides(playerPosition.x, nextZ)) playerPosition.z = nextZ;
  }

  function jump() {
    if (!grounded || completed) return;
    grounded = false;
    verticalVelocity = JUMP_SPEED;
  }

  function updateObjective() {
    if (objectiveStage === 0) {
      objectiveTitle.textContent = "Reach the research greenhouse";
      objectiveCopy.textContent = "Follow the illuminated path into the greenhouse district.";
    } else if (objectiveStage === 1) {
      objectiveTitle.textContent = "Activate the research beacon";
      objectiveCopy.textContent = "Approach the glowing terminal and press E or Interact.";
    } else {
      objectiveTitle.textContent = "Vertical slice complete";
      objectiveCopy.textContent = "The first dtfseeds.com 3D-world systems are connected.";
    }
  }

  function interact() {
    if (completed || objectiveStage !== 1) return;
    const distance = Math.hypot(playerPosition.x - terminalPosition.x, playerPosition.z - terminalPosition.z);
    if (distance > 2.45) return;

    objectiveStage = 2;
    completed = true;
    prompt.hidden = true;
    completeCard.hidden = false;
    materials.screen.emissiveIntensity = 4.5;
    beacon.intensity = 13;
    updateObjective();
  }

  function resetRun() {
    playerPosition.set(0, 0, 21);
    horizontalVelocity.set(0, 0, 0);
    verticalVelocity = 0;
    grounded = true;
    objectiveStage = 0;
    completed = false;
    completeCard.hidden = true;
    prompt.hidden = true;
    materials.screen.emissiveIntensity = 2.4;
    beacon.intensity = 7;
    cameraYaw = Math.PI;
    cameraPitch = 0.36;
    clearInput();
    updateObjective();
  }

  function isInsideGreenhouse() {
    return playerPosition.x > 8.7 && playerPosition.x < 23.3 && playerPosition.z > -22.7 && playerPosition.z < -7.4;
  }

  function updatePrompt() {
    if (objectiveStage !== 1 || completed) {
      prompt.hidden = true;
      return;
    }
    const distance = Math.hypot(playerPosition.x - terminalPosition.x, playerPosition.z - terminalPosition.z);
    prompt.hidden = distance > 2.45;
  }

  function handleKeyDown(event) {
    const code = event.code;
    if (["KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft", "ShiftRight", "Space", "KeyE"].includes(code)) {
      event.preventDefault();
    }
    if (code === "Space" && !event.repeat) jump();
    if (code === "KeyE" && !event.repeat) interact();
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
    if (lookPointer === null) return;
    const dx = x - lastLookX;
    const dy = y - lastLookY;
    lastLookX = x;
    lastLookY = y;
    cameraYaw -= dx * 0.006;
    cameraPitch = THREE.MathUtils.clamp(cameraPitch - dy * 0.0045, 0.12, 1.03);
  }

  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    renderer.domElement.setPointerCapture(event.pointerId);
    beginLook(event.pointerId, event.clientX, event.clientY);
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    if (event.pointerId !== lookPointer) return;
    updateLook(event.clientX, event.clientY);
  });

  renderer.domElement.addEventListener("pointerup", (event) => {
    if (event.pointerId === lookPointer) lookPointer = null;
  });

  renderer.domElement.addEventListener("pointercancel", (event) => {
    if (event.pointerId === lookPointer) lookPointer = null;
  });

  renderer.domElement.addEventListener("wheel", (event) => {
    cameraDistance = THREE.MathUtils.clamp(cameraDistance + Math.sign(event.deltaY) * 0.45, 4.5, 9.5);
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
  const releaseMovePad = (event) => {
    if (event.pointerId !== movePointer) return;
    movePointer = null;
    touchMove.set(0, 0);
    moveKnob.style.transform = "translate(-50%, -50%)";
  };
  movePad.addEventListener("pointerup", releaseMovePad);
  movePad.addEventListener("pointercancel", releaseMovePad);

  lookPad.addEventListener("pointerdown", (event) => {
    lookPad.setPointerCapture(event.pointerId);
    beginLook(event.pointerId, event.clientX, event.clientY);
  });
  lookPad.addEventListener("pointermove", (event) => {
    if (event.pointerId === lookPointer) updateLook(event.clientX, event.clientY);
  });
  const releaseLookPad = (event) => {
    if (event.pointerId === lookPointer) lookPointer = null;
  };
  lookPad.addEventListener("pointerup", releaseLookPad);
  lookPad.addEventListener("pointercancel", releaseLookPad);

  jumpButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    jump();
  });
  interactButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    interact();
  });
  restartButton.addEventListener("click", resetRun);

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", clearInput);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInput();
  });

  function resize() {
    const width = Math.max(1, viewport.clientWidth);
    const height = Math.max(1, viewport.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height, false);
    resolutionReadout.textContent = renderer.getPixelRatio().toFixed(2);
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

  function updatePlayer(dt) {
    if (completed) {
      horizontalVelocity.multiplyScalar(Math.max(0, 1 - dt * 7));
    }

    const keyboardX = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0);
    const keyboardY = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0);
    inputVector.set(
      THREE.MathUtils.clamp(keyboardX + touchMove.x, -1, 1),
      THREE.MathUtils.clamp(keyboardY + touchMove.y, -1, 1),
    );
    if (inputVector.lengthSq() > 1) inputVector.normalize();

    const canMove = !completed;
    const running = keys.has("ShiftLeft") || keys.has("ShiftRight") || touchMove.length() > 0.88;
    const speed = running ? RUN_SPEED : WALK_SPEED;

    forward.set(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    right.set(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
    desiredVelocity.set(0, 0, 0);
    if (canMove) {
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

    if (horizontalVelocity.lengthSq() > 0.1) {
      const targetAngle = Math.atan2(horizontalVelocity.x, horizontalVelocity.z);
      let delta = targetAngle - player.rotation.y;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      player.rotation.y += delta * Math.min(1, dt * 11);
    }

    player.position.copy(playerPosition);

    if (objectiveStage === 0 && isInsideGreenhouse()) {
      objectiveStage = 1;
      updateObjective();
    }
    updatePrompt();
  }

  function updateCamera(dt) {
    cameraTarget.set(playerPosition.x, playerPosition.y + 1.35, playerPosition.z);
    const horizontal = Math.cos(cameraPitch) * cameraDistance;
    desiredCamera.set(
      cameraTarget.x + Math.sin(cameraYaw) * horizontal,
      cameraTarget.y + Math.sin(cameraPitch) * cameraDistance + 0.65,
      cameraTarget.z + Math.cos(cameraYaw) * horizontal,
    );

    const cameraSmoothing = 1 - Math.exp(-8 * dt);
    camera.position.lerp(desiredCamera, cameraSmoothing);
    camera.lookAt(cameraTarget);
  }

  let frameHandle = 0;
  let lastTime = performance.now();
  let perfWindowStart = lastTime;
  let perfFrames = 0;
  let disposed = false;

  function updateDiagnostics(now) {
    perfFrames += 1;
    const elapsed = now - perfWindowStart;
    if (elapsed < 500) return;
    const fps = Math.round(perfFrames * 1000 / elapsed);
    fpsReadout.textContent = String(fps);
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

    const pulse = 1 + Math.sin(now * 0.0035) * 0.08;
    beaconRing.scale.setScalar(pulse);
    terminalScreen.material.emissiveIntensity = completed ? 4.5 : 2.1 + Math.sin(now * 0.004) * 0.55;

    renderer.render(scene, camera);
    updateDiagnostics(now);
    frameHandle = window.requestAnimationFrame(animate);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    window.cancelAnimationFrame(frameHandle);
    resizeObserver.disconnect();
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("blur", clearInput);

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

  updateObjective();
  updateCamera(1);
  renderer.render(scene, camera);

  window.__DTF_WORLD_LAB__ = {
    version: WORLD_VERSION,
    ready: true,
    getState() {
      return {
        objectiveStage,
        completed,
        grounded,
        player: {
          x: Number(playerPosition.x.toFixed(3)),
          y: Number(playerPosition.y.toFixed(3)),
          z: Number(playerPosition.z.toFixed(3)),
        },
        renderer: {
          calls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          pixelRatio: renderer.getPixelRatio(),
        },
      };
    },
    reset: resetRun,
  };

  loading.hidden = true;
  hud.hidden = false;
  renderer.domElement.focus({ preventScroll: true });
  lastTime = performance.now();
  perfWindowStart = lastTime;
  frameHandle = window.requestAnimationFrame(animate);
}
