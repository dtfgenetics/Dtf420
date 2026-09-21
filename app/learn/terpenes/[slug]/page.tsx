import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { terpeneSeedCompounds } from "@/lib/terpenes/data";
import { getFamilyLabel, getTerpeneBySlug } from "@/lib/terpenes/queries";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "./page.module.css";

export function generateStaticParams() {
  return terpeneSeedCompounds.map((compound) => ({ slug: compound.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const compound = getTerpeneBySlug(slug);
  if (!compound) return {};

  return buildEducationMetadata({
    title: `${compound.name} Terpene Record`,
    description: `Explore ${compound.name}: classification, chemistry, aroma language, biosynthetic context, cannabis occurrence, genetics, cultivar interpretation, and evidence guardrails.`,
    path: `/learn/terpenes/${compound.slug}`,
  });
}

export default async function TerpeneRecordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const compound = getTerpeneBySlug(slug);
  if (!compound) notFound();

  const family = getFamilyLabel(compound.terpeneClass);

  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <div>
          <Link href="/learn/terpenes">← THC Terpene Atlas</Link>
          <p className="eyebrow">{family} · {compound.formula}</p>
          <h1>{compound.name}</h1>
          <p>
            {compound.structureFamily} · {compound.functionalClass} · {compound.biosyntheticPrecursor}
          </p>
        </div>
        <div className={styles.status}>
          <span>Occurrence</span>
          <strong>{compound.cannabisOccurrence.replace("-", " ")}</strong>
          <small>
            “Not mapped” means this curated dataset has not established a cannabis occurrence record;
            it does not mean universal absence.
          </small>
        </div>
      </header>

      <div className={styles.grid}>
        <main className={styles.main}>
          <section className={styles.identity}>
            <div className="section-heading">
              <p className="eyebrow">Chemical identity</p>
              <h2>Know exactly which molecule the record describes.</h2>
            </div>
            <dl>
              <div><dt>Formula</dt><dd>{compound.formula}</dd></div>
              <div><dt>Molecular weight</dt><dd>{compound.molecularWeight ? `${compound.molecularWeight} g/mol` : "Pending source import"}</dd></div>
              <div><dt>CAS number</dt><dd>{compound.casNumber ?? "Pending source import"}</dd></div>
              <div><dt>PubChem CID</dt><dd>{compound.pubchemCid ?? "Pending source import"}</dd></div>
              <div><dt>Terpene family</dt><dd>{family}</dd></div>
              <div><dt>Structure family</dt><dd>{compound.structureFamily}</dd></div>
              <div><dt>Functional chemistry</dt><dd>{compound.functionalClass}</dd></div>
              <div><dt>Primary precursor context</dt><dd>{compound.biosyntheticPrecursor}</dd></div>
            </dl>
          </section>

          <section>
            <div className="section-heading">
              <p className="eyebrow">Aroma and sensory language</p>
              <h2>Descriptors are observations, not one-compound diagnoses.</h2>
            </div>
            {compound.aromaDescriptors.length ? (
              <div className={styles.chips}>
                {compound.aromaDescriptors.map((descriptor) => <span key={descriptor}>{descriptor}</span>)}
              </div>
            ) : (
              <p className={styles.body}>No aroma descriptors are assigned in this seed record.</p>
            )}
            <p className={styles.body}>{compound.viewNotes.aroma}</p>
          </section>

          <section className={styles.split}>
            <div>
              <p className="eyebrow">Cannabis occurrence</p>
              <h2>Chemistry before strain-name assumptions.</h2>
              <p>{compound.cannabisContext}</p>
            </div>
            <div>
              <p className="eyebrow">Cultivar interpretation</p>
              <h2>Use distributions, not fixed strain numbers.</h2>
              <p>{compound.cultivarContext}</p>
            </div>
          </section>

          <section className={styles.split}>
            <div>
              <p className="eyebrow">Biosynthesis</p>
              <h2>Place the molecule in its pathway.</h2>
              <p>{compound.viewNotes.biosynthesis}</p>
            </div>
            <div>
              <p className="eyebrow">Genetics</p>
              <h2>Genes contribute; they do not act alone.</h2>
              <p>{compound.geneticsContext}</p>
            </div>
          </section>

          <section>
            <div className="section-heading">
              <p className="eyebrow">Natural occurrence</p>
              <h2>Terpenes are plant chemistry, not cannabis-only chemistry.</h2>
            </div>
            <div className={styles.chips}>
              {compound.naturalSources.map((source) => <span key={source}>{source}</span>)}
            </div>
          </section>

          <section className={styles.guardrail}>
            <p className="eyebrow">Research guardrail</p>
            <h2>Separate measured chemistry from effect claims.</h2>
            <p>{compound.researchGuardrail}</p>
          </section>
        </main>

        <aside className={styles.aside}>
          <section>
            <span>Aliases</span>
            <div className={styles.aliases}>
              {compound.aliases.map((alias) => <code key={alias}>{alias}</code>)}
            </div>
          </section>

          <section>
            <span>Source IDs in this seed record</span>
            <div className={styles.aliases}>
              {compound.sourceIds.map((sourceId) => <code key={sourceId}>{sourceId}</code>)}
            </div>
          </section>

          {compound.pubchemCid ? (
            <a
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.pubchemCid}`}
              target="_blank"
              rel="noreferrer"
            >
              Open PubChem record ↗
            </a>
          ) : null}

          <Link href="/learn/sources">Open THC evidence sources →</Link>
        </aside>
      </div>
    </article>
  );
}
