import Link from "next/link";
import BudOrBluffGame from "./BudOrBluffGame";

export const metadata = {
  title: "Bud or Bluff | DTF Games",
  description: "Guess whether an absurd cannabis strain name is real or completely made up.",
};

export default function BudOrBluffPage() {
  return (
    <section className="shell page-section">
      <div className="game-page-heading">
        <div>
          <p className="eyebrow">DTF Games · Party Game</p>
          <h1>Bud or Bluff</h1>
          <p className="lede">
            Real strain or fake name? Pick BUD if you think it exists. Pick BLUFF if you think we made it up.
          </p>
        </div>
        <Link className="button" href="/games">All games</Link>
      </div>

      <div style={{ overflowAnchor: "none" }}>
        <BudOrBluffGame />
      </div>
    </section>
  );
}
