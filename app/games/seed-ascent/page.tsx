import Link from "next/link";

export const metadata = {
  title: "Seed Ascent | DTF Games",
  description: "Climb an endless canopy, collect gems, stomp pests, and chase a new high score in Seed Ascent.",
};

export default function SeedAscentPage() {
  return (
    <section className="shell page-section">
      <div className="game-page-heading">
        <div>
          <p className="eyebrow">DTF Games · Platformer</p>
          <h1>Seed Ascent</h1>
          <p className="lede">
            Climb an endless canopy, collect gems, stomp pests, use the double jump, and push for a new best score.
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
            minHeight: "960px",
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
