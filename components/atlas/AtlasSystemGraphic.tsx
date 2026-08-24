import styles from "./AtlasSystemGraphic.module.css";

function SeedGraphic() {
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label="Seed and germination visual">
      <ellipse className={styles.seed} cx="240" cy="163" rx="91" ry="123" transform="rotate(-14 240 163)" />
      <path className={styles.seedSeam} d="M203 61 C247 104 278 165 280 258" />
      <path className={styles.rootHeavy} d="M260 257 C267 287 289 307 278 347" />
      <path className={styles.rootFine} d="M280 312 C303 323 317 335 320 350" />
      <path className={styles.embryo} d="M217 131 C236 105 260 99 279 112 C265 143 245 153 217 131 Z" />
      <circle className={styles.callout} cx="280" cy="257" r="8" />
      <circle className={styles.callout} cx="217" cy="131" r="8" />
    </svg>
  );
}

function RootGraphic() {
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label="Root system visual">
      <rect className={styles.mediaBand} x="70" y="42" width="380" height="42" rx="20" />
      <path className={styles.rootHeavy} d="M260 68 C250 128 224 184 196 346" />
      <path className={styles.rootHeavy} d="M260 68 C271 135 298 205 325 347" />
      <path className={styles.rootHeavy} d="M260 71 C260 150 261 245 260 350" />
      <path className={styles.rootMid} d="M240 136 C191 155 149 194 114 249" />
      <path className={styles.rootMid} d="M280 152 C332 174 377 215 405 273" />
      <path className={styles.rootMid} d="M217 221 C169 239 136 273 114 319" />
      <path className={styles.rootMid} d="M304 235 C352 255 382 290 402 331" />
      <path className={styles.rootFine} d="M153 196 C126 197 106 210 91 228 M177 244 C150 260 140 283 134 311 M349 224 C378 224 399 238 417 260 M337 277 C369 295 378 319 381 342" />
      <g className={styles.rootHairs}>
        <path d="M255 280 l-20 9 M264 286 l22 11 M250 302 l-23 15 M270 309 l24 13 M248 326 l-22 16 M273 330 l20 16" />
      </g>
    </svg>
  );
}

function StemGraphic() {
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label="Stem and vascular cross-section visual">
      <circle className={styles.stemOuter} cx="190" cy="180" r="125" />
      <circle className={styles.stemCortex} cx="190" cy="180" r="98" />
      <circle className={styles.stemVascular} cx="190" cy="180" r="70" />
      <circle className={styles.stemPith} cx="190" cy="180" r="39" />
      <g className={styles.vascularDots}>
        <circle cx="190" cy="92" r="10" /><circle cx="248" cy="112" r="10" /><circle cx="274" cy="180" r="10" /><circle cx="247" cy="246" r="10" /><circle cx="190" cy="269" r="10" /><circle cx="133" cy="246" r="10" /><circle cx="108" cy="180" r="10" /><circle cx="133" cy="113" r="10" />
      </g>
      <path className={styles.flowUp} d="M365 286 C365 229 365 164 365 72" />
      <path className={styles.flowDown} d="M420 76 C420 138 420 204 420 286" />
      <text className={styles.diagramText} x="344" y="326">xylem</text>
      <text className={styles.diagramText} x="400" y="326">phloem</text>
    </svg>
  );
}

function NodeGraphic() {
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label="Nodes and branching visual">
      <path className={styles.stemLine} d="M260 333 C259 253 260 166 260 30" />
      <path className={styles.branchLine} d="M260 257 C216 233 169 210 111 198" />
      <path className={styles.branchLine} d="M260 257 C306 232 354 209 411 195" />
      <path className={styles.branchLine} d="M260 164 C224 143 191 121 156 93" />
      <path className={styles.branchLine} d="M260 164 C296 141 332 118 366 91" />
      <g className={styles.nodeDots}><circle cx="260" cy="257" r="13" /><circle cx="260" cy="164" r="13" /></g>
      <g className={styles.axillaryBuds}><ellipse cx="238" cy="242" rx="11" ry="19" transform="rotate(-37 238 242)" /><ellipse cx="283" cy="241" rx="11" ry="19" transform="rotate(37 283 241)" /><ellipse cx="240" cy="149" rx="10" ry="17" transform="rotate(-35 240 149)" /><ellipse cx="282" cy="148" rx="10" ry="17" transform="rotate(35 282 148)" /></g>
      <path className={styles.apexArrow} d="M260 74 L260 26 M247 42 L260 25 L273 42" />
    </svg>
  );
}

function LeafGraphic() {
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label="Cannabis fan leaf anatomy visual">
      <g className={styles.fanLeaf}>
        <path d="M258 312 C237 247 213 179 190 67 C225 78 249 122 258 190 C267 122 291 78 326 67 C303 179 279 247 258 312 Z" />
        <path d="M254 292 C208 247 163 197 111 103 C150 103 201 142 238 214 C214 135 209 82 237 43 C263 92 267 151 258 217 C266 151 272 92 299 43 C327 82 321 135 297 214 C334 142 385 103 424 103 C372 197 327 247 262 292 Z" />
        <path d="M245 301 C202 283 149 253 83 183 C121 173 175 199 231 252 C190 195 174 149 191 116 C225 143 244 193 254 250 C264 193 283 143 317 116 C334 149 318 195 277 252 C333 199 387 173 425 183 C359 253 306 283 263 301 Z" />
      </g>
      <path className={styles.petiole} d="M258 310 C258 327 258 338 258 354" />
      <path className={styles.vein} d="M258 304 L258 82 M258 246 L163 158 M258 246 L353 158 M258 271 L119 207 M258 271 L397 207" />
    </svg>
  );
}

function FlowerGraphic() {
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label="Cannabis flower anatomy visual">
      <g className={styles.flowerMass}>
        <ellipse cx="258" cy="174" rx="78" ry="135" />
        <ellipse cx="196" cy="225" rx="49" ry="76" />
        <ellipse cx="324" cy="223" rx="49" ry="76" />
        <ellipse cx="225" cy="111" rx="43" ry="68" />
        <ellipse cx="296" cy="109" rx="43" ry="68" />
      </g>
      <g className={styles.bracts}>
        <path d="M229 193 C213 166 215 145 235 129 C252 151 249 176 229 193 Z" /><path d="M279 210 C264 180 270 158 290 143 C305 167 301 191 279 210 Z" /><path d="M235 258 C219 232 223 210 243 196 C258 220 254 244 235 258 Z" />
      </g>
      <g className={styles.pistilLines}>
        <path d="M226 139 C198 112 180 112 164 91 M289 147 C315 116 337 116 354 92 M239 207 C208 184 190 188 169 171 M279 222 C309 196 332 202 353 181 M246 89 C224 60 220 45 225 29 M276 91 C298 61 301 45 296 28" />
      </g>
      <g className={styles.sparkles}><circle cx="218" cy="170" r="4" /><circle cx="280" cy="174" r="4" /><circle cx="251" cy="129" r="4" /><circle cx="312" cy="217" r="4" /><circle cx="207" cy="233" r="4" /></g>
    </svg>
  );
}

function TrichomeGraphic() {
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label="Glandular trichome types visual">
      <g className={styles.trichomeTall} transform="translate(80 20)"><path d="M85 278 C85 213 87 151 90 90" /><circle cx="90" cy="74" r="47" /><circle className={styles.innerGland} cx="90" cy="74" r="33" /></g>
      <g className={styles.trichomeMedium} transform="translate(215 65)"><path d="M65 230 C65 188 66 146 68 113" /><circle cx="68" cy="94" r="34" /><circle className={styles.innerGland} cx="68" cy="94" r="23" /></g>
      <g className={styles.trichomeSmall} transform="translate(345 120)"><path d="M55 170 C55 145 56 124 57 105" /><circle cx="57" cy="91" r="22" /></g>
      <text className={styles.diagramText} x="102" y="338">capitate-stalked</text><text className={styles.diagramText} x="248" y="338">capitate-sessile</text><text className={styles.diagramText} x="402" y="338">bulbous</text>
    </svg>
  );
}

function SexGraphic() {
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label="Male and female cannabis reproductive structures visual">
      <path className={styles.branchLine} d="M120 320 C128 232 134 158 140 48 M380 320 C373 232 367 158 360 48" />
      <path className={styles.branchLine} d="M137 151 L69 107 M143 151 L205 105 M363 151 L298 105 M357 151 L421 108" />
      <g className={styles.maleSacs}><ellipse cx="103" cy="126" rx="21" ry="27" /><ellipse cx="86" cy="153" rx="20" ry="26" /><ellipse cx="119" cy="161" rx="19" ry="25" /><ellipse cx="175" cy="124" rx="21" ry="27" /><ellipse cx="191" cy="151" rx="19" ry="25" /></g>
      <g className={styles.femaleBract}><path d="M334 157 C318 132 320 110 340 94 C359 117 356 141 334 157 Z" /><path d="M385 158 C369 132 373 110 393 94 C411 117 407 140 385 158 Z" /></g>
      <g className={styles.pistilLines}><path d="M338 103 C322 76 310 70 296 61 M344 105 C357 78 368 72 380 62 M391 103 C376 77 365 70 353 62 M397 105 C409 79 420 73 433 65" /></g>
      <text className={styles.diagramText} x="108" y="348">staminate</text><text className={styles.diagramText} x="344" y="348">pistillate</text>
    </svg>
  );
}

function EnvironmentGraphic() {
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label="Whole-plant environment interactions visual">
      <circle className={styles.environmentOrbit} cx="260" cy="183" r="139" /><circle className={styles.environmentOrbitInner} cx="260" cy="183" r="100" />
      <path className={styles.stemLine} d="M260 290 C260 230 260 167 260 86" /><path className={styles.branchLine} d="M260 222 L180 187 M260 222 L340 187 M260 164 L205 127 M260 164 L315 127" />
      <g className={styles.miniLeaves}><ellipse cx="171" cy="182" rx="43" ry="19" transform="rotate(-18 171 182)" /><ellipse cx="349" cy="182" rx="43" ry="19" transform="rotate(18 349 182)" /><ellipse cx="197" cy="122" rx="35" ry="16" transform="rotate(-26 197 122)" /><ellipse cx="323" cy="122" rx="35" ry="16" transform="rotate(26 323 122)" /></g>
      <g className={styles.environmentNodes}><circle cx="260" cy="32" r="15" /><circle cx="73" cy="92" r="15" /><circle cx="447" cy="92" r="15" /><circle cx="70" cy="280" r="15" /><circle cx="448" cy="280" r="15" /><circle cx="260" cy="332" r="15" /></g>
      <text className={styles.diagramText} x="244" y="14">light</text><text className={styles.diagramText} x="39" y="72">air / VPD</text><text className={styles.diagramText} x="426" y="72">CO₂</text><text className={styles.diagramText} x="37" y="315">water</text><text className={styles.diagramText} x="420" y="315">pH / EC</text><text className={styles.diagramText} x="229" y="358">root oxygen</text>
    </svg>
  );
}

function DiagnosticGraphic() {
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label="Whole-plant diagnostic symptom location visual">
      <path className={styles.stemLine} d="M260 324 C260 253 260 175 260 54" /><path className={styles.branchLine} d="M260 258 L148 229 M260 258 L372 229 M260 184 L177 142 M260 184 L343 142 M260 116 L214 80 M260 116 L306 80" />
      <g className={styles.miniLeaves}><ellipse cx="137" cy="226" rx="53" ry="20" transform="rotate(-14 137 226)" /><ellipse cx="383" cy="226" rx="53" ry="20" transform="rotate(14 383 226)" /><ellipse cx="167" cy="138" rx="48" ry="18" transform="rotate(-23 167 138)" /><ellipse cx="353" cy="138" rx="48" ry="18" transform="rotate(23 353 138)" /><ellipse cx="207" cy="76" rx="35" ry="15" transform="rotate(-28 207 76)" /><ellipse cx="313" cy="76" rx="35" ry="15" transform="rotate(28 313 76)" /></g>
      <g className={styles.symptomDots}><circle cx="306" cy="77" r="12" /><circle cx="351" cy="138" r="12" /><circle cx="139" cy="226" r="12" /><circle cx="260" cy="54" r="12" /><circle cx="260" cy="318" r="12" /></g>
      <path className={styles.rootHeavy} d="M260 324 C245 342 237 349 229 359 M260 324 C275 342 284 349 292 359" />
    </svg>
  );
}

export function AtlasSystemGraphic({ systemId }: { systemId: string }) {
  const graphic = (() => {
    switch (systemId) {
      case "seed_germination": return <SeedGraphic />;
      case "root_system": return <RootGraphic />;
      case "stem_vascular": return <StemGraphic />;
      case "nodes_branching": return <NodeGraphic />;
      case "leaves": return <LeafGraphic />;
      case "flowers": return <FlowerGraphic />;
      case "trichomes_resin": return <TrichomeGraphic />;
      case "sex_pollen_seed": return <SexGraphic />;
      case "environment_overlay": return <EnvironmentGraphic />;
      case "diagnostic_overlay": return <DiagnosticGraphic />;
      default: return <LeafGraphic />;
    }
  })();

  return <div className={styles.graphicFrame}>{graphic}</div>;
}
