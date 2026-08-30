import Link from "next/link";

export const metadata = {
  title: "Seed Ascent | DTF Games",
  description: "Run through six cannabis-themed side-scrolling worlds, stomp pests, collect trichomes, find power-ups, and master a double jump in Seed Ascent.",
};

export default function SeedAscentPage() {
  return (
    <section className="shell page-section">
      <div className="game-page-heading">
        <div>
          <p className="eyebrow">DTF Games · Retro platformer</p>
          <h1>Seed Ascent</h1>
          <p className="lede">
            Run through six side-scrolling grow worlds, stomp pests, collect trichomes, hit checkpoints, find power-ups, and use a responsive double jump to reach each grow gate.
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
          title="Seed Ascent browser game"
          src="/seed-ascent.html"
          style={{
            display: "block",
            width: "100%",
            height: "clamp(540px, 70vw, 820px)",
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
