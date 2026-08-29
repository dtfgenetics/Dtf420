import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Games",
  description:
    "DTF Genetics browser games, playable releases, migration status, rules, and community testing information.",
};

const migrationStandards = [
  ["Playable status", "Only show a Play action when the route and runtime are actually available in this application."],
  ["Rules and controls", "Every migrated game needs clear setup, controls, turn flow, win conditions, and player-count information."],
  ["Device support", "State whether the current build is mobile-friendly, desktop-first, multiplayer, or dependent on a larger screen."],
  ["Version history", "Keep meaningful gameplay changes and fixes visible so testers know what changed between builds."],
  ["Testing feedback", "Provide a consistent path for bug reports and gameplay feedback instead of relying on scattered chat messages."],
  ["Development separation", "Keep concepts and incomplete ports visibly separate from public playable releases so visitors do not hit broken experiences."],
];

export default function GamesPage() {
  return (
    <section className="shell page-section">
      <p className="eyebrow">DTF Genetics · Original browser games</p>
      <h1>Games</h1>
      <p className="lede">
        The DTF game hub is being migrated into one shared application. Public releases are kept separate from ports that are still being rebuilt so a visitor never has to guess whether a Play button actually works.
      </p>

      <div className="game-card">
        <div>
          <p className="status-pill">Playable in this app</p>
          <h2>Burn Buds</h2>
          <p>
            Burn Buds is currently the migrated Phaser game in this repository and serves as the first production runtime on the shared DTF game foundation.
          </p>
        </div>
        <Link className="button button--primary" href="/games/burn-buds">Play Burn Buds</Link>
      </div>

      <section className="section" aria-labelledby="game-migration-standard">
        <div className="section-heading">
          <p className="eyebrow">Migration standard</p>
          <h2 id="game-migration-standard">Each game needs more than a launch button.</h2>
          <p className="lede">
            As the rest of the DTF game library is moved into this application, every title will use the same public documentation and testing standard.
          </p>
        </div>

        <div className="card-grid">
          {migrationStandards.map(([title, description]) => (
            <article className="feature-card" key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
