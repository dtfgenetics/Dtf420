import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const genesData = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/tps-genes.json"), "utf8"));
const ledger = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/evidence-ledger.json"), "utf8"));
const registry = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/source-registry.json"), "utf8"));

const sourceIds = new Set(registry.sources.map((source) => source.id));
if (!sourceIds.has("BOOTH-2017-TPS")) throw new Error("BOOTH-2017-TPS source is not registered");

const evidenceById = new Map();
for (const record of ledger.records) {
  if (evidenceById.has(record.id)) throw new Error(`Duplicate evidence id: ${record.id}`);
  evidenceById.set(record.id, record);
}

const geneIds = new Set();
let majorProducts = 0;
for (const gene of genesData.genes ?? []) {
  if (geneIds.has(gene.id)) throw new Error(`Duplicate TPS gene id: ${gene.id}`);
  geneIds.add(gene.id);

  if (!gene.strainOrigin || !gene.primarySubstrate || !gene.sourceLocator) {
    throw new Error(`TPS gene missing provenance fields: ${gene.id}`);
  }

  for (const product of gene.majorProducts ?? []) {
    majorProducts += 1;
    if (!product.evidenceId) throw new Error(`Major product lacks evidence id: ${gene.id} / ${product.slug}`);
    const evidence = evidenceById.get(product.evidenceId);
    if (!evidence) throw new Error(`Missing major-product evidence: ${product.evidenceId}`);
    if (evidence.geneId !== gene.id) throw new Error(`Evidence gene mismatch for ${product.evidenceId}`);
    if (evidence.compoundSlug !== product.slug) throw new Error(`Evidence compound mismatch for ${product.evidenceId}`);
    if (evidence.claimType !== "terpene-synthase-function" || evidence.studyType !== "enzyme-functional") {
      throw new Error(`Major-product evidence is not functional TPS evidence: ${product.evidenceId}`);
    }
    if (!["source-verified", "editorial-reviewed"].includes(evidence.reviewStatus)) {
      throw new Error(`Major-product evidence is not reviewed enough for genetics UI: ${product.evidenceId}`);
    }
  }

  for (const product of gene.minorProducts ?? []) {
    if (product.status === "tentative" && !/tentative/i.test(product.label) && product.slug !== "isoterpinolene") {
      throw new Error(`Tentative TPS product needs explicit handling: ${gene.id} / ${product.slug}`);
    }
  }
}

for (const required of ["CsTPS1FN","CsTPS2FN","CsTPS3FN","CsTPS5FN","CsTPS6FN","CsTPS9FN","CsTPS13PK","CsTPS33PK"]) {
  if (!geneIds.has(required)) throw new Error(`Required source-verified TPS gene missing: ${required}`);
}

const tps9 = genesData.genes.find((gene) => gene.id === "CsTPS9FN");
const tps9Slugs = new Set(tps9.majorProducts.map((product) => product.slug));
if (!tps9Slugs.has("beta-caryophyllene") || !tps9Slugs.has("alpha-humulene")) {
  throw new Error("CsTPS9FN must retain both major sesquiterpene products");
}

console.log(`TPS genetics verified: ${geneIds.size} genes, ${majorProducts} evidence-linked major products.`);
