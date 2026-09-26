import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Burn Buds | DTF Games",
  description: "Burn Buds multiplayer strategy game release status and Game Hub navigation.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function BurnBudsPage() {
  return (
    <main
      className="shell page-section"
      style={{
        minHeight: "70svh",
        display: "grid",
        placeItems: "center",
        paddingBlock: "clamp(3rem, 10vw, 8rem)",
      }}
    >
      <section
        aria-labelledby="burn-buds-title"
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
        <h1 id="burn-buds-title">Burn Buds is being prepared for release.</h1>
        <p className="lede">
          The multiplayer build is not currently mounted at its intended production route.
          Instead of sending players to a missing page, this screen keeps them inside the
          Game Hub until the canonical build is available.
        </p>
        <Link className="button" href="/games/">
          Back to Game Hub
        </Link>
      </section>
    </main>
  );
}
