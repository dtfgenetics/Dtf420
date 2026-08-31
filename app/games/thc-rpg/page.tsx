import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "THC RPG: The First Seed | DTF Games",
  description:
    "Play THC RPG: The First Seed, a DTF Genetics browser role-playing game about genetics, phenotype variation, room simulation, equipment progression, and quest-driven cultivation strategy.",
  alternates: {
    canonical: "/games/thc-rpg",
  },
};

export default function ThcRpgPage() {
  return (
    <section className="shell page-section">
      <div className="game-page-heading">
        <div>
          <p className="eyebrow">DTF Games · Cultivation RPG</p>
          <h1>THC RPG</h1>
          <p className="lede">
            Start with Blue Mango, learn the room systems, upgrade your equipment, grow Blue Bubblegum, and hunt for a high-quality Mango Bubbles phenotype across a three-chapter progression loop.
          </p>
        </div>
        <Link className="button" href="/games">All games</Link>
      </div>

      <div
        style={{
          width: "100%",
          overflow: "hidden",
          border: "1px solid rgba(183, 226, 93, 0.18)",
          borderRadius: "24px",
          background: "#0a0a1a",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.28)",
        }}
      >
        <iframe
          title="THC RPG: The First Seed"
          src="/thc-rpg/index.html"
          style={{
            display: "block",
            width: "100%",
            height: "clamp(680px, 82vh, 920px)",
            border: 0,
            background: "#0a0a1a",
          }}
          loading="eager"
          allowFullScreen
        />
      </div>
    </section>
  );
}
