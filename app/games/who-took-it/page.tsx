import Link from "next/link";
import WhoTookItGame from "./WhoTookItGame";

export const metadata = {
  title: "Who Took It? | DTF Games",
  description: "Ask yes-or-no clues, cross off suspects, and solve which suspect took the missing item.",
};

export default function WhoTookItPage() {
  return (
    <section className="shell page-section">
      <div className="game-page-heading">
        <div>
          <p className="eyebrow">DTF Games · Mystery Deduction</p>
          <h1>Who Took It?</h1>
          <p className="lede">
            One suspect took one missing item. Ask clean yes-or-no clues, cross off bad leads, and close the case before the room forgets what happened.
          </p>
        </div>
        <Link className="button" href="/games">All games</Link>
      </div>

      <WhoTookItGame />
    </section>
  );
}
