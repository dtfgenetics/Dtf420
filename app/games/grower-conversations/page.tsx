import type { Metadata } from "next";
import Link from "next/link";
import GrowerConversationsGame from "./GrowerConversationsGame";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Grower Conversations | DTF Games",
  description: "A pass-and-talk browser conversation game for growers, breeders, and cultivation communities.",
};

export default function GrowerConversationsPage() {
  return (
    <section className={`shell ${styles.page}`}>
      <div className={styles.hero}>
        <div>
          <span className={styles.status}>Development preview</span>
          <p className="eyebrow">DTF Games · Conversation deck</p>
          <h1>Grower Conversations</h1>
          <p>
            A no-score pass-and-talk game built around real cultivation experience, decisions,
            mistakes, genetics, troubleshooting, and community discussion.
          </p>
        </div>
        <Link className={styles.backLink} href="/games">← Back to games</Link>
      </div>

      <GrowerConversationsGame />
    </section>
  );
}
