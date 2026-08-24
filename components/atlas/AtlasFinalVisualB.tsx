"use client";

import { useState } from "react";
import styles from "./AtlasConceptVisual.module.css";

type Point = { id: string; label: string; detail: string };
type Spec = { title: string; subtitle: string; points: Point[] };

const specs: Record<string, Spec> = {
  "atlas-microscope-workflow-v1": {
    title: "Microscope workflow",
    subtitle: "Standardize tissue, optics, lighting and records before comparing trichome observations",
    points: [
      { id: "sample", label: "Choose tissue", detail: "Record the exact tissue sampled, such as a representative flower bract, and avoid mixing tissue types without noting the difference." },
      { id: "stabilize", label: "Stabilize the view", detail: "Keep the sample and microscope steady so motion does not create blur or false changes in apparent gland shape." },
      { id: "light", label: "Control lighting", detail: "Use consistent illumination and white balance because glare and color cast can change apparent clarity and amber tone." },
      { id: "focus", label: "Focus consistently", detail: "Compare gland heads at a similar focal plane and magnification rather than judging out-of-focus highlights." },
      { id: "record", label: "Record & repeat", detail: "Save representative images with date, tissue, canopy location and magnification so change over time can be compared." },
    ],
  },
  "atlas-preflowers-v1": {
    title: "Male vs female preflowers",
    subtitle: "Compare developing reproductive structures at nodes across more than one developmental stage",
    points: [
      { id: "node", label: "Inspect the node", detail: "Early reproductive structures arise near nodes, so inspect the axil rather than relying on overall plant shape." },
      { id: "female", label: "Pistillate preflower", detail: "Female structures develop a bract associated with a pistillate flower; paired stigmas often become visible as development proceeds." },
      { id: "male", label: "Staminate preflower", detail: "Male structures develop staminate primordia that enlarge into pollen-bearing flowers, often before anthers are exposed." },
      { id: "stage", label: "Developmental stage", detail: "Very early structures can be ambiguous; compare several nodes and allow enough development before making a confident classification." },
      { id: "compare", label: "Use multiple views", detail: "Side and close-up views help distinguish attachment, shape and emerging reproductive tissue more reliably than one image." },
    ],
  },
  "atlas-mixed-sex-v1": {
    title: "Mixed-sex expression",
    subtitle: "Record staminate or anther structures appearing on a plant with otherwise pistillate flowers",
    points: [
      { id: "female", label: "Pistillate baseline", detail: "Begin with the normal pistillate flower structures present on the plant so unusual reproductive tissue is compared against a clear baseline." },
      { id: "anther", label: "Exposed anther", detail: "Anthers can sometimes appear within pistillate flower clusters and may be visually distinct from stigmas and bracts." },
      { id: "sac", label: "Staminate structure", detail: "Some plants can develop more complete staminate flowers or pollen sacs in addition to pistillate structures." },
      { id: "sites", label: "Inspect multiple sites", detail: "Record location, number and developmental timing across the plant rather than assuming one structure represents the whole plant." },
      { id: "cause", label: "Observation ≠ cause", detail: "Mixed-sex expression can involve genetic and environmental factors; the structure itself does not prove why it occurred." },
    ],
  },
  "atlas-controlled-pollination-v1": {
    title: "Controlled pollination workflow",
    subtitle: "Isolation, labeling and records keep intentional crosses traceable",
    points: [
      { id: "donor", label: "Identify donor", detail: "Keep donor identity explicit and separate from other pollen sources so parentage remains traceable." },
      { id: "isolate", label: "Control exposure", detail: "Separate target pollination work from unintended pollen movement and clearly define which flower sites are intended targets." },
      { id: "target", label: "Label target sites", detail: "Mark the selected branch or flower sites at the time of pollination so later seed development can be linked to the intended cross." },
      { id: "record", label: "Record the cross", detail: "Record parent identities, date, target location and observations in a breeding log rather than relying on memory." },
      { id: "verify", label: "Verify later", detail: "Follow seed development and preserve labels through harvest and seed handling; intentional exposure does not guarantee every ovule was fertilized." },
    ],
  },
  "atlas-temp-rh-v1": {
    title: "Temperature & humidity",
    subtitle: "Relative humidity changes meaning with temperature because vapor pressure is temperature-dependent",
    points: [
      { id: "temperature", label: "Air temperature", detail: "Warmer air has a higher saturation vapor pressure, so temperature changes the vapor-pressure context even if relative humidity is unchanged." },
      { id: "rh", label: "Relative humidity", detail: "RH expresses actual vapor pressure as a percentage of saturation at the measured air temperature; it is not an absolute measure of water vapor." },
      { id: "same", label: "Same RH, different air", detail: "Two spaces at the same RH but different temperatures contain different vapor pressures and create different leaf-air relationships." },
      { id: "leaf", label: "Leaf temperature", detail: "Leaf temperature can differ from air temperature, so accurate plant-demand interpretation improves when leaf temperature is considered." },
      { id: "system", label: "Use together", detail: "Interpret temperature, RH, VPD, airflow, light and plant water status as interacting measurements rather than independent targets." },
    ],
  },
  "atlas-boundary-layer-v1": {
    title: "Airflow & boundary layer",
    subtitle: "Air movement changes the still-air layer around leaves and therefore heat and vapor exchange",
    points: [
      { id: "leaf", label: "Leaf surface", detail: "A leaf exchanges heat, water vapor and gases with the surrounding air across its surface and stomatal pores." },
      { id: "boundary", label: "Boundary layer", detail: "A relatively still layer of air forms next to the leaf surface and adds resistance to heat and vapor transfer." },
      { id: "low", label: "Low air movement", detail: "With little air movement, the boundary layer can be thicker and local leaf conditions can diverge more from room-air measurements." },
      { id: "airflow", label: "More air movement", detail: "Moderate air movement generally thins the boundary layer and increases exchange, but excessive mechanical force can damage tissue or increase stress." },
      { id: "distribution", label: "Canopy distribution", detail: "Air movement should be evaluated throughout the canopy because sheltered interior zones can behave differently from exposed leaves." },
    ],
  },
  "atlas-pattern-description-v1": {
    title: "Pattern description",
    subtitle: "Use spatial vocabulary before converting a visible pattern into a diagnosis",
    points: [
      { id: "uniform", label: "Uniform", detail: "A relatively even change across a leaf or plant region should be distinguished from patterns that follow veins, margins or isolated lesions." },
      { id: "interveinal", label: "Interveinal", detail: "Describe whether tissue between veins changes while the veins remain comparatively different; do not assign a nutrient from this feature alone." },
      { id: "marginal", label: "Marginal or tip-focused", detail: "Record whether discoloration or necrosis begins at leaf margins, serrations or tips and whether it advances inward." },
      { id: "spotted", label: "Spotted or localized", detail: "Record lesion size, shape, edge, surface, distribution and whether spots cross veins or cluster around damage sites." },
      { id: "shape", label: "Twisted, wilted or asymmetric", detail: "Posture and shape changes should be described separately from color because water status, growth disruption, pests and physical factors can overlap." },
    ],
  },
};

function active(selected: string, id: string) {
  return selected === id ? styles.emphasis : undefined;
}

function MicroscopeWorkflow({ selected }: { selected: string }) {
  const steps = ["sample", "stabilize", "light", "focus", "record"];
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Standardized microscope workflow">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      {steps.map((id, index) => {
        const x = 75 + index * 140;
        return (
          <g key={id} className={active(selected, id)}>
            <circle cx={x} cy="190" r="48" fill="#19382b" stroke="#76aa84" strokeWidth="4" />
            {id === "sample" ? <path d={`M${x - 25} 195 q25 -55 50 0 q-25 35 -50 0z`} fill="#568b51" /> : null}
            {id === "stabilize" ? <><line x1={x - 25} y1="170" x2={x + 25} y2="210" stroke="#c9d9c3" strokeWidth="7" /><path d={`M${x - 35} 225 H${x + 35}`} stroke="#d2b96e" strokeWidth="5" /></> : null}
            {id === "light" ? <>{[-20, 0, 20].map((offset) => <path key={offset} d={`M${x + offset} 135 V180`} stroke="#ecd26d" strokeWidth="5" />)}</> : null}
            {id === "focus" ? <><circle cx={x} cy="190" r="25" fill="none" stroke="#b9d9df" strokeWidth="5" /><path d={`M${x + 18} 208 l28 28`} stroke="#b9d9df" strokeWidth="6" /></> : null}
            {id === "record" ? <><rect x={x - 28} y="160" width="56" height="62" rx="7" fill="#d6dfcf" /><path d={`M${x - 15} 177 H${x + 15} M${x - 15} 190 H${x + 15} M${x - 15} 203 H${x + 5}`} stroke="#31553d" strokeWidth="4" /></> : null}
            <text x={x - 34} y="280" fill="#b9d9c0" fontSize="11">{id}</text>
            {index < steps.length - 1 ? <path d={`M${x + 50} 190 H${x + 88}`} stroke="#759b7e" strokeWidth="4" /> : null}
          </g>
        );
      })}
    </svg>
  );
}

function Preflowers({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Male and female cannabis preflower comparison">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <line x1="360" y1="40" x2="360" y2="380" stroke="#355142" strokeWidth="2" />
      <g className={active(selected, "female")}>
        <line x1="185" y1="350" x2="185" y2="95" stroke="#678b5e" strokeWidth="18" />
        <path d="M185 225 Q115 190 82 145 M185 225 Q255 190 288 145" stroke="#678b5e" strokeWidth="12" fill="none" />
        <ellipse cx="215" cy="205" rx="22" ry="35" fill="#7c9a60" stroke="#aabd7c" strokeWidth="3" />
        <path d="M212 175 Q190 135 180 120 M220 176 Q245 138 255 122" stroke="#eceff0" strokeWidth="5" fill="none" />
      </g>
      <g className={active(selected, "male")}>
        <line x1="535" y1="350" x2="535" y2="95" stroke="#678b5e" strokeWidth="18" />
        <path d="M535 225 Q465 190 432 145 M535 225 Q605 190 638 145" stroke="#678b5e" strokeWidth="12" fill="none" />
        {[0, 1, 2].map((i) => <ellipse key={i} cx={565 + i * 22} cy={190 + i * 18} rx="18" ry="24" fill="#9cab68" stroke="#c0ca82" strokeWidth="3" />)}
      </g>
      <g className={active(selected, "node")}><circle cx="185" cy="225" r="20" fill="#d3b869" /><circle cx="535" cy="225" r="20" fill="#d3b869" /></g>
      <g className={active(selected, "stage")}><path d="M75 365 H290 M425 365 H645" stroke="#d7bd6f" strokeWidth="4" strokeDasharray="8 8" /></g>
      <g className={active(selected, "compare")}><text x="105" y="405" fill="#c8e0ce" fontSize="14">pistillate context</text><text x="465" y="405" fill="#c8e0ce" fontSize="14">staminate context</text></g>
    </svg>
  );
}

function MixedSex({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Mixed-sex reproductive structure reference">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <line x1="350" y1="360" x2="350" y2="90" stroke="#66885b" strokeWidth="17" />
      <g className={active(selected, "female")}>
        {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={350 + (i % 2 ? 30 : -30)} cy={250 - i * 42} rx="36" ry="48" fill="#6c8051" stroke="#a9b87a" strokeWidth="3" />)}
        <path d="M330 125 q-30 -48 -45 -55 M370 125 q30 -48 45 -55" stroke="#edf0f0" strokeWidth="6" fill="none" />
      </g>
      <g className={active(selected, "anther")}><path d="M405 188 q18 -30 36 0 q-18 38 -36 0z" fill="#e2c75c" /><path d="M431 158 q17 -25 31 4 q-19 31 -31 -4z" fill="#e2c75c" /></g>
      <g className={active(selected, "sac")}><ellipse cx="280" cy="280" rx="24" ry="32" fill="#a7ae63" /><ellipse cx="252" cy="300" rx="22" ry="29" fill="#a7ae63" /></g>
      <g className={active(selected, "sites")}><circle cx="410" cy="190" r="43" fill="none" stroke="#d7b86b" strokeWidth="4" /><circle cx="265" cy="288" r="48" fill="none" stroke="#d7b86b" strokeWidth="4" /></g>
      <g className={active(selected, "cause")}><rect x="485" y="275" width="185" height="68" rx="14" fill="#3d3422" /><text x="510" y="306" fill="#e5d5a3" fontSize="13">record structure first</text><text x="515" y="328" fill="#e5d5a3" fontSize="13">do not infer cause</text></g>
    </svg>
  );
}

function ControlledPollination({ selected }: { selected: string }) {
  const steps = ["donor", "isolate", "target", "record", "verify"];
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Controlled pollination record workflow">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      {steps.map((id, index) => {
        const x = 75 + index * 140;
        return (
          <g key={id} className={active(selected, id)}>
            <rect x={x - 50} y="105" width="104" height="170" rx="16" fill="#183528" stroke="#6b9677" strokeWidth="3" />
            {id === "donor" ? <><circle cx={x} cy="165" r="32" fill="#899c59" />{[-18, 0, 18].map((offset) => <circle key={offset} cx={x + offset} cy="210" r="8" fill="#e3ca63" />)}</> : null}
            {id === "isolate" ? <><rect x={x - 31} y="137" width="62" height="90" rx="12" fill="none" stroke="#d2b76d" strokeWidth="5" /><path d={`M${x - 40} 128 l80 110`} stroke="#d2b76d" strokeWidth="4" /></> : null}
            {id === "target" ? <><path d={`M${x} 230 V145`} stroke="#668b5d" strokeWidth="10" /><circle cx={x} cy="155" r="34" fill="#718656" /><path d={`M${x - 12} 130 q-20 -30 -30 -38 M${x + 12} 130 q20 -30 30 -38`} stroke="#eef1ef" strokeWidth="5" /></> : null}
            {id === "record" ? <><rect x={x - 30} y="135" width="60" height="95" rx="8" fill="#d7dfd1" /><path d={`M${x - 18} 158 H${x + 18} M${x - 18} 177 H${x + 18} M${x - 18} 196 H${x + 8}`} stroke="#365840" strokeWidth="4" /></> : null}
            {id === "verify" ? <><ellipse cx={x} cy="180" rx="38" ry="50" fill="#97805f" stroke="#d0bc91" strokeWidth="4" /><path d={`M${x - 20} 245 l15 15 32 -42`} stroke="#9ed0a8" strokeWidth="6" fill="none" /></> : null}
            <text x={x - 33} y="310" fill="#bfdac5" fontSize="11">{id}</text>
            {index < steps.length - 1 ? <path d={`M${x + 55} 190 H${x + 84}`} stroke="#7ea28a" strokeWidth="4" /> : null}
          </g>
        );
      })}
    </svg>
  );
}

function TempRh({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Temperature and relative humidity interaction">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <g className={active(selected, "temperature")}><path d="M100 320 V90" stroke="#d47761" strokeWidth="18" /><circle cx="100" cy="330" r="34" fill="#d47761" /><path d="M100 110 H150 M100 170 H140 M100 230 H150" stroke="#efb09f" strokeWidth="4" /></g>
      <g className={active(selected, "rh")}><path d="M255 105 C220 155 205 185 205 220 a50 50 0 0 0 100 0 c0 -35 -15 -65 -50 -115z" fill="#5ca8c6" /><text x="230" y="235" fill="#e3f4f9" fontSize="18">RH</text></g>
      <g className={active(selected, "same")}><rect x="350" y="90" width="130" height="100" rx="16" fill="#203e30" /><rect x="520" y="90" width="130" height="100" rx="16" fill="#3e3228" /><text x="378" y="130" fill="#d5e8da" fontSize="14">60% RH</text><text x="545" y="130" fill="#eadbc5" fontSize="14">60% RH</text><text x="378" y="160" fill="#9ecbaa" fontSize="13">cooler air</text><text x="545" y="160" fill="#d9b58e" fontSize="13">warmer air</text><path d="M414 205 v70 M585 205 v115" stroke="#7ab8d0" strokeWidth="7" /></g>
      <g className={active(selected, "leaf")}><path d="M350 325 q105 -55 210 0 q-105 75 -210 0z" fill="#46804a" /><circle cx="455" cy="325" r="23" fill="#d9bd66" /></g>
      <g className={active(selected, "system")}><path d="M70 365 H655" stroke="#8ab497" strokeWidth="4" strokeDasharray="9 7" /><text x="230" y="397" fill="#b7d8bf" fontSize="13">temperature + RH + leaf temperature + airflow + light</text></g>
    </svg>
  );
}

function BoundaryLayer({ selected }: { selected: string }) {
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Leaf airflow and boundary layer comparison">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      <g className={active(selected, "leaf")}><path d="M95 265 Q230 130 360 250 Q230 360 95 265z" fill="#47814a" /><path d="M420 265 Q550 130 675 250 Q550 360 420 265z" fill="#47814a" /></g>
      <g className={active(selected, "boundary")}><path d="M78 272 Q230 95 382 255 Q230 395 78 272z" fill="none" stroke="#7bb9c9" strokeWidth="16" opacity=".45" /></g>
      <g className={active(selected, "low")}><path d="M60 95 C120 75 165 90 205 80" stroke="#6f9aac" strokeWidth="5" fill="none" /><text x="105" y="60" fill="#a9ccd8" fontSize="14">low air movement</text></g>
      <g className={active(selected, "airflow")}>
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M400 ${90 + i * 35} H${610 + i * 10}`} stroke="#80c2d4" strokeWidth="6" />)}
        <path d="M400 248 Q550 115 690 245" fill="none" stroke="#8fc6d1" strokeWidth="6" opacity=".35" />
      </g>
      <g className={active(selected, "distribution")}><rect x="250" y="340" width="220" height="50" rx="13" fill="#1b3a2b" /><text x="278" y="371" fill="#c6e0cc" fontSize="13">check sheltered canopy zones</text></g>
    </svg>
  );
}

function PatternDescription({ selected }: { selected: string }) {
  const patterns = ["uniform", "interveinal", "marginal", "spotted", "shape"];
  return (
    <svg viewBox="0 0 720 420" role="img" aria-label="Diagnostic symptom pattern vocabulary">
      <rect width="720" height="420" rx="24" fill="#0d1c14" />
      {patterns.map((id, index) => {
        const x = 78 + index * 142;
        return (
          <g key={id} transform={`translate(${x - 75} 0)`} className={active(selected, id)}>
            <path d="M75 300 C30 235 38 130 75 82 C130 132 132 235 75 300z" fill={id === "uniform" ? "#acaa59" : "#4e864b"} stroke="#82ad69" strokeWidth="3" />
            <path d="M75 290 V100" stroke="#b6d08e" strokeWidth="5" />
            {id === "interveinal" ? <><path d="M45 165 Q75 140 105 165 M42 215 Q75 190 108 215" stroke="#d1c461" strokeWidth="15" opacity=".8" /><path d="M75 105 V290" stroke="#609057" strokeWidth="6" /></> : null}
            {id === "marginal" ? <path d="M48 125 Q18 185 45 265 M102 125 Q132 185 105 265" stroke="#a96d46" strokeWidth="12" fill="none" /> : null}
            {id === "spotted" ? [0, 1, 2, 3].map((i) => <circle key={i} cx={52 + (i % 2) * 45} cy={150 + i * 35} r={7 + i} fill="#a26d43" />) : null}
            {id === "shape" ? <path d="M38 145 Q75 185 112 145 M45 245 Q75 210 110 247" stroke="#d8c96c" strokeWidth="9" fill="none" /> : null}
            <text x="35" y="355" fill="#bbd9c2" fontSize="11">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Graphic({ assetId, selected }: { assetId: string; selected: string }) {
  if (assetId === "atlas-microscope-workflow-v1") return <MicroscopeWorkflow selected={selected} />;
  if (assetId === "atlas-preflowers-v1") return <Preflowers selected={selected} />;
  if (assetId === "atlas-mixed-sex-v1") return <MixedSex selected={selected} />;
  if (assetId === "atlas-controlled-pollination-v1") return <ControlledPollination selected={selected} />;
  if (assetId === "atlas-temp-rh-v1") return <TempRh selected={selected} />;
  if (assetId === "atlas-boundary-layer-v1") return <BoundaryLayer selected={selected} />;
  return <PatternDescription selected={selected} />;
}

export function AtlasFinalVisualB({ assetId }: { assetId: string }) {
  const spec = specs[assetId];
  const [selected, setSelected] = useState(spec?.points[0]?.id ?? "");
  if (!spec) return null;
  const point = spec.points.find((item) => item.id === selected) ?? spec.points[0];
  return (
    <div className={styles.shell}>
      <div className={styles.heading}><div><p>Interactive academic visual</p><h2>{spec.title}</h2><span>{spec.subtitle}</span></div></div>
      <div className={styles.graphic}><Graphic assetId={assetId} selected={selected} /></div>
      <div className={styles.controls} aria-label={`${spec.title} concepts`}>
        {spec.points.map((item) => <button key={item.id} type="button" className={item.id === selected ? styles.active : undefined} onClick={() => setSelected(item.id)}>{item.label}</button>)}
      </div>
      <div className={styles.detail}><strong>{point.label}</strong><p>{point.detail}</p></div>
    </div>
  );
}
