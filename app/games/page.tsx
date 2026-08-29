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
        Cannabis-themed browser games built for quick sessions, party play, and community competition.
      </p>

      <div className="game-card">
        <div>
          <p className="status-pill">Playable · Party game</p>
          <h2>Bud or Bluff</h2>
          <p>Hear an absurd strain name and decide: BUD if it is real, BLUFF if it is fake. Includes multiplayer scoring, difficulty filters, turn timers, streaks, and a balanced real-vs-fake deck.</p>
        </div>
        <Link className="button button--primary" href="/games/bud-or-bluff">Play now</Link>
      </div>

      <div className="game-card">
        <div>
          <p className="status-pill">Engine validation</p>
          <h2>Burn Buds</h2>
          <p>The first build proves Next.js routing, client-only Phaser startup, responsive canvas scaling, and safe game teardown.</p>
        </div>
        <Link className="button" href="/games/burn-buds">Launch test</Link>
      </div>
    </section>
  );
}
