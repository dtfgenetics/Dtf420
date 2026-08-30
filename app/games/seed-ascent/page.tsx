import Link from "next/link";

export const metadata = {
  title: "Seed Ascent | DTF Games",
  description: "Run through 12 stages across six cannabis-themed grow worlds, stomp pests, collect trichomes, find power-ups, and defeat the final boss in Seed Ascent.",
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
          <h1>Seed Ascent</h1>
          <p className="lede">
            Run through 12 side-scrolling stages across six grow worlds. Build momentum, double jump across gaps, stomp pests, collect trichomes, hit checkpoints, find power-ups, and defeat the final garden boss.
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
