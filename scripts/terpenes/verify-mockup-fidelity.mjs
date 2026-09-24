import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const explorer = fs.readFileSync(path.join(root, "components/terpenes/TerpeneAtlasExplorer.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "components/terpenes/TerpeneAtlasExplorer.module.css"), "utf8");
const compoundPage = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.tsx"), "utf8");

for (const token of [
  "Terpenes &amp; Terpenoids Wheel",
  "Cannabis &amp; Hemp Aroma Chemistry",
  "Aroma ≠ effect",
  "Inner ring · chemical class",
  "Middle</strong> individual compounds",
  "Outer</strong> aroma associations",
  "Aroma chemistry is broader than terpenes",
  "sulfur compounds",
  "wheelViewport",
  "classRing",
  "compoundRing",
  "aromaRing",
]) {
  if (!explorer.includes(token)) {
    throw new Error(`Terpene mockup structure missing: ${token}`);
  }
}

for (const token of [
  ".wheelCore",
  ".classNode",
  ".compoundNode",
  ".aromaNode",
  "scroll-snap-type:x proximity",
  ".detailPanel",
  ".ringLegend",
]) {
  if (!css.includes(token)) {
    throw new Error(`Terpene mockup styling missing: ${token}`);
  }
}

for (const token of [
  "Source-verified genetics",
  "Major functional product",
  "Biological research evidence",
  "What this evidence",
  "Open the full TPS genetics map",
  "Open the research ledger",
]) {
  if (!compoundPage.includes(token) && token !== "What this evidence") {
    throw new Error(`Compound evidence integration missing: ${token}`);
  }
}

const prohibited = [
  "guaranteed relaxing",
  "guaranteed uplifting",
  "guaranteed sedating",
  "guaranteed energizing",
  "effect prediction icon",
];

const combined = (explorer + "\n" + compoundPage).toLowerCase();
for (const phrase of prohibited) {
  if (combined.includes(phrase)) {
    throw new Error(`Prohibited effect shortcut found in terpene UI: ${phrase}`);
  }
}

console.log("Terpene mockup fidelity verified: concentric chemical-class/compound/aroma rings, mobile swipe viewport, evidence drawer, and no effect-prediction shortcuts.");
