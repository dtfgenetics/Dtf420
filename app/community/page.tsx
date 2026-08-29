import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community",
  description:
    "DTF Genetics community hub for grow-offs, event records, game testing, community highlights, and permanent participation information.",
};

const communityAreas = [
  {
    title: "Grow-offs",
    description:
      "Rules, schedules, participation requirements, updates, judging information, and final results should live on the website so the official record does not disappear inside chat history.",
  },
  {
    title: "Event archive",
    description:
      "Preserve previous competitions, winners, announcements, photos, and final standings as dated public records that can be referenced later.",
  },
  {
    title: "Game testing",
    description:
      "Separate playable public releases from active testing and development projects, with clear instructions for reporting bugs and gameplay feedback.",
  },
  {
    title: "Community highlights",
    description:
      "Showcase documented grows, community contributions, educational participation, and project milestones with permission and enough context to remain useful.",
  },
  {
    title: "Submissions",
    description:
      "Provide permanent guidance for grow-log submissions, photos, testing feedback, educational corrections, and other community contributions.",
  },
  {
    title: "Discord",
    description:
      "Use Discord for conversation and active participation while dtfseeds.com remains the permanent source for rules, references, schedules, and results.",
  },
];

export default function CommunityPage() {
  return (
    <section className="shell page-section">
      <p className="eyebrow">DTF Genetics · Participate</p>
      <h1>Community</h1>
      <p className="lede">
        Conversation can happen in Discord, but official rules, schedules, results, project records, and useful community resources should remain available on dtfseeds.com. This hub is the permanent layer for DTF community activity.
      </p>

      <div className="hero__actions">
        <Link className="button button--primary" href="/games">Play and test games</Link>
        <Link className="button" href="/journal">Read DTF updates</Link>
      </div>

      <div className="card-grid" style={{ marginTop: 34 }}>
        {communityAreas.map((area) => (
          <article className="feature-card" key={area.title}>
            <h3>{area.title}</h3>
            <p>{area.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
