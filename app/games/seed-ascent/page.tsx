import Link from "next/link";

export const metadata = {
  title: "Seed Man: Seed Ascent | DTF Games",
  description: "Run Seed Man through six grow worlds and unlock Fire, Electric, and Ice phenotype powers across 12 platforming stages.",
  alternates: {
    canonical: "/games/seed-ascent",
  },
};

export default function SeedAscentPage() {
  return (
    <section className="shell page-section">
      <div className="game-page-heading">
        <div>
          <p className="eyebrow">DTF Games · Retro platformer</p>
          <h1>Seed Man: Seed Ascent</h1>
          <p className="lede">
            Run through 12 side-scrolling stages across six grow worlds. Defeat powered enemies and minor bosses to transform Seed Man, then launch fireballs, call lightning, or freeze pests before the phenotype timer expires.
          </p>
        </div>
        <Link className="button" href="/games">All games</Link>
      </div>

      <div
        style={{
          overflow: "hidden",
          borderRadius: "24px",
          border: "1px solid rgba(86, 142, 94, 0.45)",
          background: "#071108",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.28)",
        }}
      >
        <iframe
          title="Seed Man: Seed Ascent browser game"
          src="/seed-ascent.html"
          style={{
            display: "block",
            width: "100%",
            height: "clamp(600px, 76vw, 860px)",
            border: 0,
            background: "#071108",
          }}
          loading="eager"
          allowFullScreen
        />
      </div>
    </section>
  );
}
