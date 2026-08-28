"use client";

import { useMemo, useState } from "react";
import styles from "./AtlasAdvancedConceptVisual.module.css";

type ConceptStep = {
  label: string;
  detail: string;
};

type ConceptConfig = {
  eyebrow: string;
  title: string;
  steps: ConceptStep[];
  measure: string;
  rule: string;
};

const concepts: Record<string, ConceptConfig> = {
  "atlas-seed-germination-reserve-mobilization-v0": {
    eyebrow: "Seed metabolism",
    title: "Stored reserve → mobilization → seedling establishment",
    steps: [
      { label: "Stored reserves", detail: "The dry seed contains stored carbon, lipid, protein, and mineral resources packaged with the embryo." },
      { label: "Metabolism restarts", detail: "Hydration reactivates enzyme systems and cellular metabolism, allowing stored compounds to be mobilized and used." },
      { label: "Early growth", detail: "The embryo and emerging seedling use those reserves while roots, cotyledons, and expanding leaves establish new resource capture." },
    ],
    measure: "Track hydration, time to radicle emergence, cotyledon opening, and the transition into sustained new growth.",
    rule: "Reserve mobilization supports establishment; it does not mean the seedling is independent of oxygen, water, temperature, or later photosynthesis.",
  },
  "atlas-root-system-root-zone-oxygen-diffusion-v0": {
    eyebrow: "Root-zone gas exchange",
    title: "Pore space controls how quickly oxygen can be replaced",
    steps: [
      { label: "Air-filled pores", detail: "Connected air spaces allow comparatively rapid diffusion between the atmosphere and the root zone." },
      { label: "Water-filled pores", detail: "Persistent saturation replaces much of that gas pathway with water, where oxygen diffusion is far slower." },
      { label: "Respiration demand", detail: "Roots and microbes continue consuming oxygen, so supply can fall behind demand when replenishment is restricted." },
    ],
    measure: "Record substrate moisture, irrigation timing, root-zone temperature, drainage behavior, root appearance, and plant demand together.",
    rule: "A wet root zone is not automatically hypoxic, but persistent saturation increases the risk that oxygen supply cannot keep pace with respiration.",
  },
  "atlas-stem-vascular-source-sink-integration-v0": {
    eyebrow: "Whole-plant allocation",
    title: "Sources export; sinks compete for current assimilate",
    steps: [
      { label: "Source tissues", detail: "Mature photosynthetic leaves can export sugars after meeting their own metabolic needs." },
      { label: "Phloem transport", detail: "Assimilates move through a regulated pressure-flow network rather than a fixed one-way pipe to one organ." },
      { label: "Changing sinks", detail: "Growing shoots, roots, flowers, seeds, and storage tissues can become stronger or weaker sinks as development changes." },
    ],
    measure: "Compare leaf area, active shoot growth, root growth, flowering stage, seed development, and recent pruning or damage.",
    rule: "Source and sink are functional roles, not permanent organ labels. The balance changes with development and plant condition.",
  },
  "atlas-nodes-branching-branch-angle-and-mechanical-support-v0": {
    eyebrow: "Canopy mechanics",
    title: "Branch strength depends on geometry, load, and tissue condition",
    steps: [
      { label: "Attachment", detail: "Branch diameter, union geometry, tissue continuity, and angle set the structural starting point." },
      { label: "Leverage & load", detail: "Longer branches and heavier distal mass increase bending moment, especially during movement or rapid floral loading." },
      { label: "Support strategy", detail: "Ties, screens, stakes, branch selection, and load distribution can reduce stress without changing the biology of the union itself." },
    ],
    measure: "Record branch angle, diameter, length, supported mass, attachment condition, movement, and any external support.",
    rule: "No single branch angle is a universal strength threshold. Mechanical risk emerges from interacting geometry and load.",
  },
  "atlas-leaves-leaf-temperature-and-energy-balance-v0": {
    eyebrow: "Leaf energy balance",
    title: "Radiation, convection, and evaporation set leaf temperature",
    steps: [
      { label: "Energy input", detail: "Leaves absorb shortwave and longwave radiation; absorbed energy can raise tissue temperature." },
      { label: "Heat exchange", detail: "Air movement and the temperature difference between leaf and air drive convective heat exchange around the boundary layer." },
      { label: "Evaporative cooling", detail: "Transpiration consumes energy and can cool the leaf when water supply and stomatal conductance permit it." },
    ],
    measure: "Pair leaf temperature with air temperature, PPFD, RH, airflow, irrigation status, and stomatal or plant-water context.",
    rule: "Air temperature is useful context, but the leaf surface can be warmer or cooler than the room depending on its energy balance.",
  },
  "atlas-flowers-photoperiod-sensing-and-floral-transition-v0": {
    eyebrow: "Reproductive transition",
    title: "Photoperiod signal precedes the full visible flower phenotype",
    steps: [
      { label: "Light/dark cue", detail: "The plant interprets photoperiod through light-sensitive signaling systems and developmental state." },
      { label: "Shoot-apex transition", detail: "Meristem organization and growth patterns begin changing before every floral structure is externally obvious." },
      { label: "Visible development", detail: "Preflowers, inflorescence architecture, bracts, stigmas, and floral mass appear progressively after transition begins." },
    ],
    measure: "Record day length or light schedule, dark-period integrity, developmental age, node changes, internode response, and visible floral milestones.",
    rule: "The date of a schedule change is not identical to the date of visible flower initiation; signaling and morphology unfold over time.",
  },
  "atlas-trichomes-resin-secretory-disk-and-storage-cavity-v0": {
    eyebrow: "Gland-head anatomy",
    title: "Secretory disk cells feed a subcuticular storage space",
    steps: [
      { label: "Secretory disk", detail: "Specialized cells in the gland head synthesize and secrete compounds into the apical region of the trichome." },
      { label: "Cuticle separates", detail: "Secreted material accumulates beneath the cuticle, which expands away from the secretory surface." },
      { label: "Storage cavity", detail: "The enlarged subcuticular space forms the visible resin-bearing gland head sampled under magnification." },
    ],
    measure: "Standardize tissue type, magnification, focus plane, lighting, gland integrity, and sample position before comparing heads.",
    rule: "A trichome head is an anatomical secretory structure, not a standalone maturity meter. Sampling and optical conditions still matter.",
  },
  "atlas-sex-pollen-seed-fertilization-and-seed-filling-v0": {
    eyebrow: "Reproductive sequence",
    title: "Pollen contact is the beginning, not the end, of seed formation",
    steps: [
      { label: "Pollen reception", detail: "Compatible pollen reaches receptive stigmatic tissue and begins the reproductive pathway toward the ovule." },
      { label: "Fertilization", detail: "Successful gamete fusion initiates embryo and associated seed-development processes." },
      { label: "Seed filling", detail: "Embryo growth, reserve accumulation, coat maturation, dehydration, and physical seed changes progress over time." },
    ],
    measure: "Track pollination date, target branch, pollen source, flower stage, seed enlargement, coat appearance, and harvest maturity separately.",
    rule: "Pollen exposure does not guarantee a mature viable seed. Compatibility, fertilization, development, and maturation are distinct checkpoints.",
  },
  "atlas-environment-overlay-leaf-temperature-vs-air-temperature-v0": {
    eyebrow: "Plant-level vapor pressure",
    title: "Leaf temperature changes the vapor-pressure gradient at the surface",
    steps: [
      { label: "Measure room air", detail: "Air temperature and relative humidity describe the surrounding atmospheric condition." },
      { label: "Measure leaf surface", detail: "Radiation, airflow, and transpiration can make the actual leaf temperature diverge from room air temperature." },
      { label: "Interpret gradient", detail: "Saturation vapor pressure at the leaf depends on leaf temperature, changing the vapor-pressure difference driving water loss." },
    ],
    measure: "Pair calibrated air temperature/RH with representative leaf-temperature measurements, PPFD, airflow, and plant-water context.",
    rule: "Do not assume leaf temperature equals air temperature when using vapor-pressure concepts to interpret plant demand.",
  },
  "atlas-diagnostic-overlay-genotype-environment-context-v0": {
    eyebrow: "Phenotype reasoning",
    title: "Observed phenotype = genotype × environment × development",
    steps: [
      { label: "Establish baseline", detail: "Compare the plant with healthy examples of the same genotype and developmental stage whenever possible." },
      { label: "Check repeatability", detail: "Ask whether the trait repeats consistently across clones, siblings, branches, stages, or environments." },
      { label: "Build differential", detail: "Use progression, measurements, recent actions, pests/pathogens, root-zone context, and genotype-specific traits to rank explanations." },
    ],
    measure: "Record genotype identity, plant age/stage, environmental history, affected fraction, symptom progression, and comparison plants.",
    rule: "A repeatable cultivar trait can resemble stress, and a real stress can interact with genotype. Use comparison evidence instead of universal visual labels.",
  },
};

export function AtlasAdvancedConceptVisual({ assetId }: { assetId: string }) {
  const config = concepts[assetId];
  const [selected, setSelected] = useState(0);
  const active = useMemo(() => config?.steps[selected] ?? config?.steps[0], [config, selected]);

  if (!config || !active) return null;

  return (
    <div className={styles.visual}>
      <header className={styles.header}>
        <div>
          <small>{config.eyebrow}</small>
          <h2>{config.title}</h2>
        </div>
        <span>Interactive concept map</span>
      </header>

      <div className={styles.flow} role="tablist" aria-label={config.title}>
        {config.steps.map((step, index) => (
          <div className={styles.flowItem} key={step.label}>
            <button
              type="button"
              role="tab"
              aria-selected={selected === index}
              className={selected === index ? styles.active : ""}
              onClick={() => setSelected(index)}
            >
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>{step.label}</span>
            </button>
            {index < config.steps.length - 1 ? <i aria-hidden="true">→</i> : null}
          </div>
        ))}
      </div>

      <section className={styles.detail} role="tabpanel">
        <small>Selected stage</small>
        <h3>{active.label}</h3>
        <p>{active.detail}</p>
      </section>

      <div className={styles.contextGrid}>
        <article>
          <small>Measure or record</small>
          <p>{config.measure}</p>
        </article>
        <article>
          <small>Interpretation rule</small>
          <p>{config.rule}</p>
        </article>
      </div>
    </div>
  );
}
