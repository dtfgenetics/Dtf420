import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith("--"));
const candidateId = positional[0];
const desktopPath = positional[1];
const mobileArg = args.find((arg) => arg.startsWith("--mobile="));
const outputArg = args.find((arg) => arg.startsWith("--out="));
const requireSemantics = args.includes("--require-semantics");

if (!candidateId || !desktopPath) {
  throw new Error(
    "Usage: node scripts/stage-atlas-model-candidate.mjs <candidate-id> <desktop.glb> [--mobile=<mobile.glb>] [--out=<report.json>] [--require-semantics]",
  );
}

const root = process.cwd();
const registryPath = path.join(root, "content", "atlas-model-candidates.json");
const registry = JSON.parse(await readFile(registryPath, "utf8"));
const candidate = (registry.candidates || []).find((entry) => entry.id === candidateId);
if (!candidate) throw new Error(`Unknown Atlas model candidate: ${candidateId}`);

const rights = candidate.rights || {};
const rightsFailures = [];
if (rights.publicWebsiteUseApproved !== true) rightsFailures.push("public website use is not approved");
if (rights.modificationApproved !== true) rightsFailures.push("modification is not approved");
if (rights.redistributionApproved !== true) rightsFailures.push("redistribution is not approved");
if (!rights.licenseLabel) rightsFailures.push("license label is missing");

function inspect(filePath, tier) {
  const inspectArgs = ["scripts/inspect-atlas-glb.mjs", filePath, `--tier=${tier}`];
  if (requireSemantics) inspectArgs.push("--require-semantics");
  const run = spawnSync(process.execPath, inspectArgs, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });

  const stdout = String(run.stdout || "").trim();
  let report;
  try {
    report = JSON.parse(stdout);
  } catch {
    throw new Error(`Atlas GLB inspector did not return JSON for ${tier}: ${String(run.stderr || stdout || "unknown error").trim()}`);
  }

  return {
    ...report,
    inspectorExitCode: run.status ?? 1,
  };
}

const desktopReport = inspect(desktopPath, "desktop");
const mobilePath = mobileArg ? mobileArg.slice("--mobile=".length) : null;
const mobileReport = mobilePath ? inspect(mobilePath, "mobile") : null;

const failures = [...rightsFailures];
if (desktopReport.result !== "pass") failures.push("desktop GLB failed the Atlas browser budget/format gate");
if (mobileReport && mobileReport.result !== "pass") failures.push("mobile GLB failed the Atlas browser budget/format gate");

if (!mobileReport) {
  const mobileBudget = registry.performanceBudget?.mobile;
  if (!mobileBudget) {
    failures.push("mobile performance budget is missing from the candidate registry");
  } else {
    if (desktopReport.counts?.triangles > mobileBudget.maxTriangles) failures.push("desktop GLB cannot be reused on mobile because its triangle count exceeds the mobile budget");
    if (desktopReport.fileBytes > mobileBudget.maxGlbBytes) failures.push("desktop GLB cannot be reused on mobile because its file size exceeds the mobile budget");
    if (desktopReport.maxTextureEdge !== null && desktopReport.maxTextureEdge > mobileBudget.maxTextureEdge) failures.push("desktop GLB cannot be reused on mobile because its texture edge exceeds the mobile budget");
  }
}

const report = {
  schemaVersion: 1,
  candidateId,
  candidateTitle: candidate.title || candidateId,
  source: candidate.source || null,
  rights: {
    state: rights.state || null,
    licenseLabel: rights.licenseLabel || null,
    licenseVersion: rights.licenseVersion || null,
    attributionRequired: rights.attributionRequired ?? null,
    attributionText: rights.attributionText || null,
    publicWebsiteUseApproved: rights.publicWebsiteUseApproved === true,
    modificationApproved: rights.modificationApproved === true,
    redistributionApproved: rights.redistributionApproved === true,
  },
  desktop: desktopReport,
  mobile: mobileReport,
  mobileStrategy: mobileReport ? "dedicated-mobile-glb" : "reuse-desktop-if-within-mobile-budget",
  requireSemantics,
  failures,
  result: failures.length ? "blocked" : "intake-pass",
  nextGate: failures.length
    ? "Resolve every listed intake failure before botanical or photorealism review."
    : "Proceed to botanical plausibility, specimen-identity, semantic mapping, and photorealism evidence review. Do not publish from intake-pass alone.",
};

const json = `${JSON.stringify(report, null, 2)}\n`;
if (outputArg) {
  const outputPath = path.resolve(root, outputArg.slice("--out=".length));
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, json, "utf8");
}

console.log(json.trimEnd());
if (failures.length) process.exitCode = 1;
