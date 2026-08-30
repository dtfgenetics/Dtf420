import Link from "next/link";
import HighIqGame from "./HighIqGame";

export const metadata = {
  title: "High IQ | DTF Games",
  description: "Test your cannabis plant-science and genetics knowledge in the High IQ browser trivia challenge.",
};

export default function HighIqPage() {
  return (
    <section className="shell page-section">
      <div className="game-page-heading">
        <div>
          <p className="eyebrow">DTF Games · Educational Trivia</p>
          <h1>High IQ</h1>
          <p className="lede">
            Test higher cognition with plant biology, genetics, environment, reproduction, and cultivation-science questions.
          </p>
        </div>
        <Link className="button" href="/games">All games</Link>
      </div>

      <div style={{ overflowAnchor: "none" }}>
        <HighIqGame />
      </div>
    </section>
  );
}
