import Link from "next/link";
import HighIqGame from "./HighIqGame";

export const metadata = {
  title: "High IQ | DTF Games",
  description: "Test higher cognition with cannabis plant-science, genetics, environment, and cultivation-science trivia.",
};

export default function HighIqPage() {
  return (
    <section className="shell page-section">
      <div className="game-page-heading">
        <div>
          <p className="eyebrow">DTF Games · High IQ · Development Preview</p>
        </div>
        <Link className="button" href="/games">All games</Link>
      </div>

      <div style={{ overflowAnchor: "none" }}>
        <HighIqGame />
      </div>
    </section>
  );
}
