import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_REPOSITORY = "dtfgenetics/Thc-rpg";
const SOURCE_COMMIT = "c0f317fafb93496ff84a3493b78bef84760cb82a";
const TARGET_ROOT = path.join(process.cwd(), "public", "thc-rpg");

const manifest = {
  "index.html": "5b62e512d5e2ac69e58e687e4511a7ece4f8868e",
  "src/autosave.js": "e20a1dc01bfe032d2fa4346b42ca735d5116a5a2",
  "src/data/game-data.json": "5180765a9114b6dc8b6fc915c9eb756bb427b5f4",
  "src/game/Environment.js": "72052bf7db27adebf4a2d260ae2e68732cdd7ace",
  "src/game/Equipment.js": "ff243aff24404ffcd570c658c42a9a096e5cedca",
  "src/game/Game.js": "b44fc6f1b1059a0b8a8122527c7e3528c0bc2f88",
  "src/game/Inventory.js": "4b0fe9ea4b782d3b58fa1fe5f44de411ca326f26",
  "src/game/Phenotype.js": "76e12427d29a2abe9c47c3cfbc688d55c10a934f",
  "src/game/Plant.js": "851ca6151fc736ffa1c5b86cef69b095167c3189",
  "src/game/SaveStore.js": "f75ac3d2e78e912b83e18e7aadb6e18e8759e37a",
  "src/main.js": "bee4e4075b02a4f947c00877cc9cb905bb45198c",
  "src/progression-feedback.js": "a9642ce6e2d64a1615ce387b582e4f963369b1d3",
  "src/styles.css": "c2cc3ec3f851915cbba3eaeb2f9fabd4ab75e448"
};

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash("sha1").update(header).update(buffer).digest("hex");
}

async function readIfValid(targetPath, expectedSha) {
  try {
    const bytes = await fs.readFile(targetPath);
    return gitBlobSha(bytes) === expectedSha;
  } catch {
    return false;
  }
}

async function fetchPinnedFile(relativePath, expectedSha) {
  const encodedPath = relativePath.split("/").map(encodeURIComponent).join("/");
  const url = `https://raw.githubusercontent.com/${SOURCE_REPOSITORY}/${SOURCE_COMMIT}/${encodedPath}`;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`THC RPG sync failed for ${relativePath}: HTTP ${response.status}`);

  const bytes = Buffer.from(await response.arrayBuffer());
  const actualSha = gitBlobSha(bytes);
  if (actualSha !== expectedSha) {
    throw new Error(`THC RPG integrity mismatch for ${relativePath}: expected ${expectedSha}, got ${actualSha}`);
  }
  return bytes;
}

async function syncFile(relativePath, expectedSha) {
  const targetPath = path.join(TARGET_ROOT, ...relativePath.split("/"));
  if (await readIfValid(targetPath, expectedSha)) return "cached";

  const bytes = await fetchPinnedFile(relativePath, expectedSha);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, bytes);
  return "synced";
}

async function verifyRuntimeReferences() {
  const html = await fs.readFile(path.join(TARGET_ROOT, "index.html"), "utf8");
  const refs = [...html.matchAll(/(?:src|href)=["'](\.\/[^"'#?]+)["']/g)].map((match) => match[1]);
  if (refs.length === 0) throw new Error("THC RPG index.html contains no local runtime references");

  for (const ref of refs) {
    const target = path.resolve(TARGET_ROOT, ref.slice(2));
    const relative = path.relative(TARGET_ROOT, target);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`THC RPG local reference escapes runtime root: ${ref}`);
    }
    await fs.access(target);
  }
}

let synced = 0;
let cached = 0;
for (const [relativePath, expectedSha] of Object.entries(manifest)) {
  const result = await syncFile(relativePath, expectedSha);
  if (result === "synced") synced += 1;
  else cached += 1;
}

await verifyRuntimeReferences();
console.log(`THC RPG runtime ready from ${SOURCE_REPOSITORY}@${SOURCE_COMMIT} (${synced} synced, ${cached} cached, ${Object.keys(manifest).length} verified).`);
