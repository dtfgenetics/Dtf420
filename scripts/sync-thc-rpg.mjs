import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_REPOSITORY = "dtfgenetics/Thc-rpg";
const SOURCE_COMMIT = "de6c26d9073d9154bbcade43b64768cf6a7ba2a0";
const TARGET_ROOT = path.join(process.cwd(), "public", "thc-rpg");

const manifest = {
  "index.html": "c79015dc2abc367d19f6b76c956a3061de4026b6",
  "src/autosave.js": "e20a1dc01bfe032d2fa4346b42ca735d5116a5a2",
  "src/data/game-data.json": "5180765a9114b6dc8b6fc915c9eb756bb427b5f4",
  "src/game/CampaignChapters.js": "b3a6db52b4bf0f846720cf7302d810365cc4426d",
  "src/game/Environment.js": "72052bf7db27adebf4a2d260ae2e68732cdd7ace",
  "src/game/Equipment.js": "ff243aff24404ffcd570c658c42a9a096e5cedca",
  "src/game/Game.js": "7bb670ed56b09c8bf8c63f4aefa33898c9c8d3fc",
  "src/game/GrowJournal.js": "602faa478950842d44ef423f62f36ca1707a5511",
  "src/game/Inventory.js": "be65e430a95a196cb50a59c17148ebabd8c69fd2",
  "src/game/KeeperCuttings.js": "df5557e919b5a17dee9a26e0463ee092cfce58f3",
  "src/game/Phenotype.js": "76e12427d29a2abe9c47c3cfbc688d55c10a934f",
  "src/game/Plant.js": "851ca6151fc736ffa1c5b86cef69b095167c3189",
  "src/game/SaveStore.js": "f75ac3d2e78e912b83e18e7aadb6e18e8759e37a",
  "src/grow-journal-ui.js": "429cd72d58d78ef8768730f12bbc44ce0c56167a",
  "src/grow-journal-v1.css": "0acdc35be00cbb2466ee016203d175ac45d429a0",
  "src/main.js": "3163e020ec7dd0a560530e1d0c2c6de1828361b7",
  "src/progression-feedback.js": "a9642ce6e2d64a1615ce387b582e4f963369b1d3",
  "src/styles.css": "f31c93a21cbcf3e7cba3f093b6f18198eed3b101"
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

function resolveRuntimeReference(fromRelativePath, reference) {
  const fromDirectory = path.dirname(path.join(TARGET_ROOT, fromRelativePath));
  const target = path.resolve(fromDirectory, reference);
  const relative = path.relative(TARGET_ROOT, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`THC RPG local reference escapes runtime root: ${fromRelativePath} -> ${reference}`);
  }
  return target;
}

async function verifyRuntimeReferences() {
  const html = await fs.readFile(path.join(TARGET_ROOT, "index.html"), "utf8");
  const refs = [...html.matchAll(/(?:src|href)=["'](\.\/[^"'#?]+)["']/g)].map((match) => match[1]);
  if (refs.length === 0) throw new Error("THC RPG index.html contains no local runtime references");

  for (const ref of refs) {
    await fs.access(resolveRuntimeReference("index.html", ref));
  }

  const modulePaths = Object.keys(manifest).filter((relativePath) => relativePath.endsWith(".js"));
  for (const relativePath of modulePaths) {
    const source = await fs.readFile(path.join(TARGET_ROOT, relativePath), "utf8");
    const imports = [
      ...source.matchAll(/(?:import|export)\s+(?:[^"'()]+?\s+from\s+)?["'](\.\.?\/[^"']+)["']/g),
    ].map((match) => match[1]);

    for (const reference of imports) {
      await fs.access(resolveRuntimeReference(relativePath, reference));
    }
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
