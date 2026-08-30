import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Weedopolis: Strain City Edition | DTF Games",
  description:
    "Play Weedopolis: Strain City Edition, the DTF Genetics cannabis-themed property-trading board game.",
};

export default function WeedopolisPage() {
  return (
    <section className="shell page-section">
      <div className="game-page-heading">
        <div>
          <p className="eyebrow">DTF Games · Board Game</p>
          <h1>Weedopolis</h1>
          <p className="lede">
            Build your strain portfolio, collect Bud Bucks, upgrade properties with Grow Tents and Dispensaries, and stay out of Trim Jail.
          </p>
        </div>
        <Link className="button" href="/games">All games</Link>
      </div>

      <div
        style={{
          width: "100%",
          minHeight: "900px",
          overflow: "hidden",
          border: "1px solid rgba(183, 226, 93, 0.16)",
          borderRadius: "24px",
          background: "#06120d",
        }}
      >
        <iframe
          title="Weedopolis: Strain City Edition"
          src="/weedopolis/index.html"
          style={{ width: "100%", height: "clamp(900px, 110vh, 1400px)", border: 0, display: "block" }}
          allow="clipboard-write"
        />
      </div>
    </section>
  );
}
