import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Games",
  description: "Play DTF Genetics browser games and preview titles currently in development.",
};

const principles = [
  {
    number: "01",
    title: "Play first",
    copy: "Playable releases open into the game quickly, with the main action obvious and setup kept lightweight.",
  },
  {
    number: "02",
    title: "Built for screens",
    copy: "Game UI is tested at desktop and phone widths so controls stay readable without burying the play area.",
  },
  {
    number: "03",
    title: "Clear release status",
    copy: "Finished play routes and development previews are labeled differently so you always know what you are opening.",
  },
] as const;

export default function GamesPage() {
  return (
    <section className={`shell ${styles.gamesPage}`}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">DTF Games</p>
          <h1>Pick a game. Get into it.</h1>
          <p className={styles.heroText}>
            Original cannabis-themed browser games built for quick rounds, party play, and community competition. Play finished releases now and peek at the next builds as they take shape.
          </p>
        </div>

        <div className={styles.heroStats} aria-label="Game library status">
          <div className={styles.statChip}>
            <strong>3</strong>
            <span>Playable now</span>
          </div>
          <div className={styles.statChip}>
            <strong>5</strong>
            <span>Preview builds</span>
          </div>
          <div className={styles.statChip}>
            <strong>390px+</strong>
            <span>Responsive target</span>
          </div>
        </div>
      </header>

      <div className={styles.libraryHeading}>
        <div>
          <p className="eyebrow">Game library</p>
          <h2>Choose your table.</h2>
        </div>
        <p>Playable games get the primary launch treatment. Preview builds stay available for testing without being presented as finished releases.</p>
      </div>

      <div className={styles.libraryGrid}>
        <article className={styles.gameCard}>
          <div className={`${styles.poster} ${styles.budPoster}`}>
            <div className={styles.posterTop}>
              <span className={styles.status}>Playable now</span>
              <span className={styles.posterMeta}>Board game · 2–8 players</span>
            </div>
            <div className={styles.posterTitle}>
              <span>Build the strain city</span>
              <strong>Weedopolis</strong>
            </div>
          </div>

          <div className={styles.cardBody}>
            <h3>Own the strains. Build the city.</h3>
            <p>
              Roll two dice, buy strain properties, collect Bud Bucks, draw High Chance and Community Stash cards, build Grow Tents, upgrade to Dispensaries, and avoid Trim Jail.
            </p>
            <div className={styles.tagRow} aria-label="Weedopolis features">
              <span className={styles.tag}>2–8 local players</span>
              <span className={styles.tag}>40-space board</span>
              <span className={styles.tag}>Save + load</span>
              <span className={styles.tag}>Approved V1 board art</span>
            </div>
            <div className={styles.cardAction}>
              <Link className={styles.primaryAction} href="/games/weedopolis" aria-label="Play Weedopolis">Play Weedopolis</Link>
            </div>
          </div>
        </article>

        <article className={styles.gameCard}>
          <div className={`${styles.poster} ${styles.budPoster}`}>
            <div className={styles.posterTop}>
              <span className={styles.status}>Playable now</span>
              <span className={styles.posterMeta}>Party · 1–6 players</span>
            </div>
            <div className={styles.posterTitle}>
              <span>Real strain or fake name?</span>
              <strong>Bud or Bluff</strong>
            </div>
          </div>

          <div className={styles.cardBody}>
            <h3>Call the name before it calls you.</h3>
            <p>
              Decide whether each absurd strain name is documented or completely fabricated. Play solo or pass the device, build streaks, and chase the highest score.
            </p>
            <div className={styles.tagRow} aria-label="Bud or Bluff features">
              <span className={styles.tag}>Solo + party</span>
              <span className={styles.tag}>10–40 cards</span>
              <span className={styles.tag}>Optional timer</span>
              <span className={styles.tag}>Mobile friendly</span>
            </div>
            <div className={styles.cardAction}>
              <Link className={styles.primaryAction} href="/games/bud-or-bluff" aria-label="Play Bud or Bluff">Play Bud or Bluff</Link>
            </div>
          </div>
        </article>

        <article className={styles.gameCard}>
          <div className={`${styles.poster} ${styles.budPoster}`}>
            <div className={styles.posterTop}>
              <span className={styles.status}>Playable now</span>
              <span className={styles.posterMeta}>Retro platformer · 1 player</span>
            </div>
            <div className={styles.posterTitle}>
              <span>Run the grow worlds</span>
              <strong>Seed Ascent</strong>
            </div>
          </div>

          <div className={styles.cardBody}>
            <h3>Run, jump, stomp pests, grow stronger.</h3>
            <p>
              A cannabis-themed side-scrolling platform adventure with 12 stages across six grow worlds, running momentum, double jump, checkpoints, moving platforms, pest enemies, trichome collectibles, three power-up systems, and a final boss.
            </p>
            <div className={styles.tagRow} aria-label="Seed Ascent features">
              <span className={styles.tag}>12 side-scrolling stages</span>
              <span className={styles.tag}>Double jump + run</span>
              <span className={styles.tag}>Power-ups + checkpoints</span>
              <span className={styles.tag}>Final boss</span>
            </div>
            <div className={styles.cardAction}>
              <Link className={styles.primaryAction} href="/games/seed-ascent" aria-label="Play Seed Ascent">Play Seed Ascent</Link>
            </div>
          </div>
        </article>

        <article className={styles.gameCard}>
          <div className={`${styles.poster} ${styles.budPoster}`}>
            <div className={styles.posterTop}>
              <span className={`${styles.status} ${styles.previewStatus}`}>Development preview</span>
              <span className={styles.posterMeta}>Educational trivia · 1 player</span>
            </div>
            <div className={styles.posterTitle}>
              <span>Test higher cognition</span>
              <strong>High IQ</strong>
            </div>
          </div>

          <div className={styles.cardBody}>
            <h3>Plant science gets a scoreboard.</h3>
            <p>
              Answer reviewed-format questions across plant biology, genetics, environment, reproduction, chemistry, and cultivation science. Harder questions score more and streaks add bonuses.
            </p>
            <div className={styles.tagRow} aria-label="High IQ preview details">
              <span className={styles.tag}>24-question starter bank</span>
              <span className={styles.tag}>4 difficulty tiers</span>
              <span className={styles.tag}>Optional timer</span>
              <span className={styles.tag}>Mobile + keyboard</span>
            </div>
            <div className={styles.cardAction}>
              <Link className={styles.secondaryAction} href="/games/high-iq" aria-label="Test High IQ beta">Test beta</Link>
            </div>
          </div>
        </article>

        <article className={styles.gameCard}>
          <div className={`${styles.poster} ${styles.budPoster}`}>
            <div className={styles.posterTop}>
              <span className={`${styles.status} ${styles.previewStatus}`}>Development preview</span>
              <span className={styles.posterMeta}>Conversation deck · 2–8 players</span>
            </div>
            <div className={styles.posterTitle}>
              <span>Pass the device. Trade grow stories.</span>
              <strong>Grower Conversations</strong>
            </div>
          </div>

          <div className={styles.cardBody}>
            <h3>No scoreboard. Better grow-room conversations.</h3>
            <p>
              Deal prompts about first grows, decisions, lessons, genetics, troubleshooting, and community. Filter the deck by topic or conversation depth, reveal optional follow-ups, and keep every player on equal turns.
            </p>
            <div className={styles.tagRow} aria-label="Grower Conversations preview details">
              <span className={styles.tag}>48 starter prompts</span>
              <span className={styles.tag}>2–8 local players</span>
              <span className={styles.tag}>6 categories</span>
              <span className={styles.tag}>Mobile + keyboard</span>
            </div>
            <div className={styles.cardAction}>
              <Link className={styles.secondaryAction} href="/games/grower-conversations" aria-label="Test Grower Conversations beta">Test conversation beta</Link>
            </div>
          </div>
        </article>

        <article className={styles.gameCard}>
          <div className={`${styles.poster} ${styles.budPoster}`}>
            <div className={styles.posterTop}>
              <span className={`${styles.status} ${styles.previewStatus}`}>Development preview</span>
              <span className={styles.posterMeta}>3D world · 1 player</span>
            </div>
            <div className={styles.posterTitle}>
              <span>Walk into the next DTF game layer</span>
              <strong>DTF World Lab</strong>
            </div>
          </div>

          <div className={styles.cardBody}>
            <h3>Our first explorable 3D systems test.</h3>
            <p>
              Enter a small greenhouse district built to prove third-person movement, orbit camera behavior, world collisions, a playable objective, keyboard controls, mobile touch input, and browser performance diagnostics.
            </p>
            <div className={styles.tagRow} aria-label="DTF World Lab preview details">
              <span className={styles.tag}>Three.js 3D</span>
              <span className={styles.tag}>Third-person movement</span>
              <span className={styles.tag}>Keyboard + touch</span>
              <span className={styles.tag}>Performance HUD</span>
            </div>
            <div className={styles.cardAction}>
              <Link className={styles.secondaryAction} href="/games/dtf-world-lab" aria-label="Test DTF World Lab">Enter 3D preview</Link>
            </div>
          </div>
        </article>

        <article className={styles.gameCard}>
          <div className={`${styles.poster} ${styles.budPoster}`}>
            <div className={styles.posterTop}>
              <span className={`${styles.status} ${styles.previewStatus}`}>Development preview</span>
              <span className={styles.posterMeta}>3D exploration RPG · 1 player</span>
            </div>
            <div className={styles.posterTitle}>
              <span>Archive the living seed vault</span>
              <strong>PhenoQuest</strong>
            </div>
          </div>

          <div className={styles.cardBody}>
            <h3>Explore. Stabilize. Preserve.</h3>
            <p>
              Choose an original Pheno partner, explore Seedling Town and the Terp Fields, stabilize living genetic samples through Resolve Trials, build the PhenoLog, break Team Lockout’s barrier, and challenge the first Garden Trial.
            </p>
            <div className={styles.tagRow} aria-label="PhenoQuest preview details">
              <span className={styles.tag}>6 original Phenos</span>
              <span className={styles.tag}>3D exploration</span>
              <span className={styles.tag}>Resolve Trials</span>
              <span className={styles.tag}>Local save + PhenoLog</span>
            </div>
            <div className={styles.cardAction}>
              <Link className={styles.secondaryAction} href="/games/phenoquest" aria-label="Test PhenoQuest preview">Enter PhenoQuest</Link>
            </div>
          </div>
        </article>

        <article className={styles.gameCard}>
          <div className={`${styles.poster} ${styles.burnPoster}`}>
            <div className={styles.posterTop}>
              <span className={`${styles.status} ${styles.previewStatus}`}>Development preview</span>
              <span className={styles.posterMeta}>15 × 15 board</span>
            </div>
            <div className={styles.posterTitle}>
              <span>Board systems in development</span>
              <strong>Burn Buds</strong>
            </div>
          </div>

          <div className={styles.cardBody}>
            <h3>The board is live. The game is still growing.</h3>
            <p>
              Explore the current responsive 15 × 15 Phaser board shell while the interactive game systems are built out. This route is a preview, not yet a finished playable release.
            </p>
            <div className={styles.tagRow} aria-label="Burn Buds preview details">
              <span className={styles.tag}>Phaser</span>
              <span className={styles.tag}>15 × 15 board</span>
              <span className={styles.tag}>Responsive canvas</span>
              <span className={styles.tag}>In development</span>
            </div>
            <div className={styles.cardAction}>
              <Link className={styles.secondaryAction} href="/games/burn-buds" aria-label="View board preview">View board preview</Link>
            </div>
          </div>
        </article>
      </div>

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
