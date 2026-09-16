import type { Metadata } from "next";
import Link from "next/link";

const CANONICAL_BURN_BUDS_ROUTE = "/games/protect-the-plants/";

export const metadata: Metadata = {
  title: "Burn Buds | DTF Games",
  description: "Open the canonical Burn Buds 15 × 15 multiplayer hidden-fleet strategy game.",
  alternates: {
    canonical: CANONICAL_BURN_BUDS_ROUTE,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function BurnBudsAliasPage() {
  return (
    <main
      className="shell page-section"
      data-burn-buds-alias="canonical-multiplayer"
      style={{
        minHeight: "70svh",
        display: "grid",
        placeItems: "center",
        paddingBlock: "clamp(3rem, 10vw, 8rem)",
      }}
    >
      <meta httpEquiv="refresh" content={`0;url=${CANONICAL_BURN_BUDS_ROUTE}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(CANONICAL_BURN_BUDS_ROUTE)});`,
        }}
      />
      <section
        aria-labelledby="burn-buds-alias-title"
        style={{
          width: "min(680px, 100%)",
          padding: "clamp(1.25rem, 4vw, 2.2rem)",
          border: "1px solid rgba(183, 226, 93, 0.24)",
          borderRadius: "24px",
          background: "#071108",
          boxShadow: "0 24px 70px rgba(0,0,0,.3)",
          textAlign: "center",
        }}
      >
        <p className="eyebrow">DTF Games · Burn Buds</p>
        <h1 id="burn-buds-alias-title">Opening multiplayer Burn Buds…</h1>
        <p className="lede">
          Burn Buds now uses one canonical multiplayer game so room codes, reconnects,
          recovery links, rematches, and future updates stay compatible.
        </p>
        <Link className="button" href={CANONICAL_BURN_BUDS_ROUTE}>
          Continue to Burn Buds
        </Link>
      </section>
    </main>
  );
}
