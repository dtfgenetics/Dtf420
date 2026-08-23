import Link from "next/link";

export const metadata = {
  title: "Games",
};

export default function GamesPage() {
  return (
    <section className="shell page-section">
      <p className="eyebrow">DTF Games</p>
      <h1>Game platform</h1>
      <p className="lede">
        Burn Buds is the first implementation used to validate the shared game runtime. Additional games are added only after the foundation passes build and browser verification.
      </p>

      <div className="game-card">
        <div>
          <p className="status-pill">Engine validation</p>
          <h2>Burn Buds</h2>
          <p>The first build proves Next.js routing, client-only Phaser startup, responsive canvas scaling, and safe game teardown.</p>
        </div>
        <Link className="button button--primary" href="/games/burn-buds">Launch test</Link>
      </div>
    </section>
  );
}
