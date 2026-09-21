import type { Metadata } from "next";
import Link from "next/link";
import sourceRegistry from "@/data/terpenes/source-registry.json";
import { tpsGenes, getTpsEvidence } from "@/lib/terpenes/genetics";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "./page.module.css";

export const metadata: Metadata = buildEducationMetadata({
  title: "Cannabis Terpene Synthase Genetics",
  description:
    "Explore source-verified Cannabis sativa terpene synthases, their functional assay products, substrates, strain origins, and evidence links.",
  path: "/learn/terpenes/genetics",
});

const primarySource = sourceRegistry.sources.find((source) => source.id === "BOOTH-2017-TPS");

export default function TerpeneGeneticsPage() {
  const majorProductCount = tpsGenes.reduce((sum, gene) => sum + gene.majorProducts.length, 0);
  const multiproductCount = tpsGenes.filter((gene) => gene.majorProducts.length > 1 || gene.minorProducts.length > 0).length;

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div>
          <Link className={styles.back} href="/learn/terpenes">← THC Terpene Atlas</Link>
          <p className="eyebrow">Genetics · functional enzyme evidence</p>
          <h1>Cannabis Terpene Synthases</h1>
          <p className={styles.lede}>
            Follow experimentally characterized CsTPS enzymes from gene ID to substrate and product profile.
            Multiproduct enzymes stay multiproduct, and a functional enzyme assay is not treated as a guarantee
            of terpene concentration in a living plant.
          </p>
        </div>
        <aside className={styles.heroStats}>
          <div><strong>{tpsGenes.length}</strong><span>source-verified genes</span></div>
          <div><strong>{majorProductCount}</strong><span>evidence-linked major products</span></div>
          <div><strong>{multiproductCount}</strong><span>multiproduct records</span></div>
        </aside>
      </header>

      <section className={styles.guardrail}>
        <div>
          <p className="eyebrow">Interpretation rule</p>
          <h2>Enzyme capability is not the same thing as plant abundance.</h2>
        </div>
        <p>
          Functional assays establish that an enzyme can generate identified products under the tested conditions.
          Final flower chemistry also depends on genotype, gene expression, tissue, development, substrate supply,
          environment, and post-harvest handling. Use these records as mechanistic evidence, not deterministic
          strain predictions.
        </p>
      </section>

      <section className={styles.geneGrid} aria-label="Functionally characterized cannabis terpene synthases">
        {tpsGenes.map((gene) => (
          <article className={styles.geneCard} key={gene.id}>
            <div className={styles.geneTop}>
              <div>
                <span>{gene.subfamily ?? "TPS subfamily not assigned in this dataset"}</span>
                <h2>{gene.id}</h2>
              </div>
              <div className={styles.origin}>
                <small>Origin</small>
                <strong>{gene.strainOrigin}</strong>
              </div>
            </div>

            <dl className={styles.facts}>
              <div><dt>Primary substrate</dt><dd>{gene.primarySubstrate}</dd></div>
              <div><dt>Tested substrates</dt><dd>{gene.testedSubstrates.join(", ")}</dd></div>
              <div><dt>Source location</dt><dd>{gene.sourceLocator}</dd></div>
            </dl>

            <section className={styles.products}>
              <h3>Major functional products</h3>
              <div>
                {gene.majorProducts.map((product) => {
                  const evidence = product.evidenceId ? getTpsEvidence(product.evidenceId) : null;
                  return (
                    <div className={styles.product} key={gene.id + "-" + product.slug}>
                      <strong>{product.label}</strong>
                      <small>{evidence?.reviewStatus === "source-verified" ? "Source verified" : "Evidence linked"}</small>
                    </div>
                  );
                })}
              </div>
            </section>

            {gene.minorProducts.length ? (
              <section className={styles.minor}>
                <h3>Additional products reported</h3>
                <div>
                  {gene.minorProducts.map((product) => (
                    <span key={gene.id + "-" + product.slug}>
                      {product.label}{product.status === "tentative" ? " · tentative ID" : ""}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        ))}
      </section>

      <section className={styles.sourceBlock}>
        <div>
          <p className="eyebrow">Primary functional source</p>
          <h2>{primarySource?.name ?? "Booth et al. 2017"}</h2>
          <p>
            The genetics records on this page are tied to the evidence ledger and the functional characterization
            source. The page intentionally separates primary enzyme-function evidence from later correlation,
            cultivar, and biological-effect claims.
          </p>
        </div>
        {primarySource && "sourceUrl" in primarySource ? (
          <a href={String(primarySource.sourceUrl)} target="_blank" rel="noreferrer">
            Open primary study ↗
          </a>
        ) : null}
      </section>
    </main>
  );
}
