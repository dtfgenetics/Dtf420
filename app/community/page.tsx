import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community",
  description:
    "DTF Genetics community hub for permanent grow-off rules, browser-game participation, community records, and DTF updates.",
};

const communityAreas = [
  {
    title: "Grow-off rules",
    description:
      "Open the permanent rules and schedule-format records for the THC Solo Cup Grow-Off and Freebie Grow-Off. Edition-specific announcements determine active registration, calendar year, and final results.",
    href: "/community/grow-offs",
    action: "Open grow-off records",
  },
  {
    title: "Browser games",
    description:
      "Play released DTF browser games and use the game hub to distinguish working releases from titles that are still being migrated or expanded.",
    href: "/games",
    action: "Open games",
  },
  {
    title: "DTF Journal",
    description:
      "Use the Journal for dated breeding, education, game, and community updates that need a durable web record rather than a chat-only announcement.",
    href: "/journal",
    action: "Read updates",
  },
];

export default function CommunityPage() {
  return (
    <section className="shell page-section">
      <p className="eyebrow">DTF Genetics · Participate</p>
      <h1>Community</h1>
      <p className="lede">
        DTF community activity can happen in real time elsewhere, while dtfseeds.com keeps the durable public record: rules, schedules, released games, and dated updates that should still make sense after the original conversation has moved on.
      </p>

      <div className="hero__actions">
        <Link className="button button--primary" href="/community/grow-offs">Grow-off rules</Link>
        <Link className="button" href="/games">Play DTF games</Link>
        <Link className="button" href="/journal">Read DTF updates</Link>
      </div>

      <div className="card-grid" style={{ marginTop: 34 }}>
        {communityAreas.map((area) => (
          <Link className="feature-card" href={area.href} key={area.title}>
            <h3>{area.title}</h3>
            <p>{area.description}</p>
            <span>{area.action} →</span>
          </Link>
        ))}
      </div>

      <section className="section" aria-labelledby="community-record-policy">
        <div className="section-heading">
          <p className="eyebrow">Record policy</p>
          <h2 id="community-record-policy">Permanent rules are not the same as a currently open event.</h2>
          <p className="lede">
            Grow-off reference pages preserve the locked format. A dated edition announcement is required before the site labels registration as open or attaches a calendar year, entrant list, judging update, winner, or final result to that edition.
          </p>
        </div>
      </section>
    </section>
  );
}
