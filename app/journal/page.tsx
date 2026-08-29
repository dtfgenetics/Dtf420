import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DTF Journal",
  description:
    "DTF Genetics updates covering breeding projects, Teaching Healthy Cultivation releases, grow tools, game development, research notes, and community results.",
};

const journalTracks = [
  {
    title: "Breeding notes",
    description: "Document crosses, generation progress, selection goals, phenotype observations, parent information, and release history without mixing permanent genetics records into temporary news posts.",
    href: "/seeds",
    action: "Explore genetics records",
  },
  {
    title: "THC education releases",
    description: "Track new Academy courses, Living Plant Atlas lessons, plant-health references, symptom differentials, field tools, and visual-learning releases.",
    href: "/learn",
    action: "Open Teaching Healthy Cultivation",
  },
  {
    title: "Tool updates",
    description: "Follow GrowLens, Grow Doc, measurement workflows, diagnostic improvements, and new field-record systems as they are released.",
    href: "/tools",
    action: "Open tools",
  },
  {
    title: "Game development",
    description: "Publish playable releases, rules, version changes, test notes, multiplayer milestones, and community testing information in one permanent place.",
    href: "/games",
    action: "Browse games",
  },
  {
    title: "Community records",
    description: "Preserve grow-off rules, schedules, results, winner announcements, testing programs, and community highlights outside temporary chat history.",
    href: "/community",
    action: "Open community",
  },
  {
    title: "Research notes",
    description: "Summarize useful cultivation research with links back to the source library and the permanent lesson or reference that the evidence supports.",
    href: "/learn/sources",
    action: "Browse evidence sources",
  },
];

export default function JournalPage() {
  return (
    <section className="shell page-section">
      <p className="eyebrow">DTF Genetics · Permanent updates</p>
      <h1>DTF Journal</h1>
      <p className="lede">
        The Journal replaces the old generic blog model. Permanent educational knowledge belongs in Teaching Healthy Cultivation; permanent breeding records belong in Genetics. The Journal is for dated DTF updates that explain what changed, what was released, and where the lasting reference now lives.
      </p>

      <div className="card-grid" style={{ marginTop: 34 }}>
        {journalTracks.map((track) => (
          <Link className="feature-card" href={track.href} key={track.title}>
            <h3>{track.title}</h3>
            <p>{track.description}</p>
            <span>{track.action} →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
