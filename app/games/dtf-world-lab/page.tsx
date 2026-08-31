import Link from "next/link";

export const metadata = {
  title: "DTF World Lab | DTF Games",
  description: "Explore the first dtfseeds.com 3D-world technology preview with third-person movement, camera controls, collisions, touch input, and an interactive objective.",
  alternates: {
    canonical: "/games/dtf-world-lab",
  },
};

export default function DtfWorldLabPage() {
  return (
    <section className="shell page-section">
      <div className="game-page-heading">
        <div>
          <p className="eyebrow">DTF Games · 3D technology preview</p>
          <h1>DTF World Lab</h1>
          <p className="lede">
            Walk into our first explorable 3D slice for dtfseeds.com. This development build is proving third-person movement, camera control, collisions, interaction, touch controls, and browser performance before we scale into larger worlds.
          </p>
        </div>
        <Link className="button" href="/games">All games</Link>
      </div>

      <div
        style={{
          overflow: "hidden",
          borderRadius: "24px",
          border: "1px solid rgba(86, 142, 94, 0.45)",
          background: "#050d08",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.3)",
        }}
      >
        <iframe
          title="DTF World Lab 3D technology preview"
          src="/dtf-world-lab/index.html"
          style={{
            display: "block",
            width: "100%",
            height: "clamp(580px, 72vw, 860px)",
            border: 0,
            background: "#050d08",
          }}
          loading="eager"
          allowFullScreen
        />
      </div>

      <p style={{ marginTop: "14px", color: "var(--muted)", fontSize: "13px", lineHeight: 1.6 }}>
        Development preview: this is a systems vertical slice, not a finished game or final art direction. Desktop uses WASD, Shift, Space, E, and drag-to-look. Touch devices receive on-screen movement, look, jump, and interaction controls.
      </p>
    </section>
  );
}
