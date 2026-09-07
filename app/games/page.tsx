import type { Metadata } from "next";
import { GameLibrary } from "@/components/game/GameLibrary";
import { gameCatalog, playableGameCount, previewGameCount } from "@/lib/game-catalog";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Games",
  description: "Play DTF Genetics browser games and preview titles currently in development.",
};

const principles = [
  { number: "01", title: "Play first", copy: "Playable releases open into the game quickly, with the main action obvious and setup kept lightweight." },
  { number: "02", title: "Built for screens", copy: "Game UI is tested at desktop and phone widths so controls stay readable without burying the play area." },
  { number: "03", title: "Clear release status", copy: "Finished play routes and development previews are labeled differently so you always know what you are opening." },
] as const;

export default function GamesPage() {
  return (
    <section className={`shell ${styles.gamesPage}`}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">DTF Games</p>
          <h1>Pick a game. Get into it.</h1>
          <p className={styles.heroText}>
            Original cannabis-themed browser games built for quick rounds, party play, and community competition. Play finished releases now and help test the next builds as they take shape.
          </p>
        </div>
        <div className={styles.heroStats} aria-label="Game library status">
          <div className={styles.statChip}><strong>{playableGameCount}</strong><span>Playable now</span></div>
          <div className={styles.statChip}><strong>{previewGameCount}</strong><span>Preview builds</span></div>
          <div className={styles.statChip}><strong>{gameCatalog.length}</strong><span>Total games</span></div>
        </div>
      </header>

      <div className={styles.libraryHeading}>
        <div>
          <p className="eyebrow">Game library</p>
          <h2>Choose your table.</h2>
        </div>
        <p>Filter the catalog by release state or search by title, genre, and feature. Previews remain clearly separated from finished releases.</p>
      </div>

      <GameLibrary games={gameCatalog} />

      <section className={styles.principles} aria-labelledby="game-ui-principles">
        <div className={styles.principlesHeader}>
          <p className="eyebrow">DTF game standard</p>
          <h2 id="game-ui-principles">The interface should feel like part of the game.</h2>
          <p>Menus, status, controls, and results should support the playfield instead of turning each title into another website dashboard.</p>
        </div>
        <div className={styles.principleGrid}>
          {principles.map((principle) => (
            <article className={styles.principle} key={principle.number}>
              <strong>{principle.number}</strong>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
