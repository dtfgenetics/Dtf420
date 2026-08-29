import type { Metadata } from "next";
import Link from "next/link";
import growOffs from "@/content/community-growoffs.json";

export const metadata: Metadata = {
  title: "Community Grow-Offs",
  description: "Permanent DTF Genetics grow-off rules, schedule formats, participation requirements, and edition-status guidance.",
};

export default function CommunityGrowOffsPage() {
  return (
    <section className="shell page-section">
      <nav aria-label="Breadcrumb" style={{ marginBottom: 28 }}>
        <Link href="/">Home</Link> / <Link href="/community">Community</Link> / <strong>Grow-Offs</strong>
      </nav>

      <p className="eyebrow">DTF Genetics · Community competitions</p>
      <h1>Grow-Offs</h1>
      <p className="lede">
        Permanent rules references for DTF community grow-offs. Each event page separates the locked format from edition-specific registration, calendar year, judging updates, and final results so an old schedule cannot be mistaken for a currently open event.
      </p>

      <div className="card-grid" style={{ marginTop: 34 }}>
        {growOffs.map((event) => (
          <Link className="feature-card" href={`/community/grow-offs/${event.slug}`} key={event.slug}>
            <p className="eyebrow">{event.status}</p>
            <h3>{event.title}</h3>
            <p>{event.summary}</p>
            {event.tagline ? <p><strong>{event.tagline}</strong></p> : null}
            <span>Open rules reference →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
