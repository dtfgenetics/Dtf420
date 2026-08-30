import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import growOffs from "@/content/community-growoffs.json";

function getEvent(slug: string) {
  return growOffs.find((event) => event.slug === slug);
}

export function generateStaticParams() {
  return growOffs.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return { title: "DTF Community Grow-Off" };

  return {
    title: event.title,
    description: event.summary,
  };
}

export default async function CommunityGrowOffPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  return (
    <section className="shell page-section">
      <nav aria-label="Breadcrumb" style={{ marginBottom: 28 }}>
        <Link href="/">Home</Link> / <Link href="/community">Community</Link> / <Link href="/community/grow-offs">Grow-Offs</Link> / <strong>{event.title}</strong>
      </nav>

      <p className="eyebrow">{event.status}</p>
      <h1>{event.title}</h1>
      <p className="lede">{event.summary}</p>
      {event.tagline ? <p className="lede"><strong>{event.tagline}</strong></p> : null}

      <article className="feature-card" style={{ marginTop: 34 }}>
        <p className="eyebrow">Edition status</p>
        <h2>Rules reference, not an open-registration notice</h2>
        <p>{event.editionNotice}</p>
      </article>

      <section className="section" aria-labelledby="growoff-rules">
        <div className="section-heading">
          <p className="eyebrow">Participation</p>
          <h2 id="growoff-rules">Locked format rules</h2>
        </div>
        <div className="card-grid">
          {event.rules.map((rule, index) => (
            <article className="feature-card" key={`${event.slug}-rule-${index}`}>
              <p className="eyebrow">Rule {index + 1}</p>
              <p>{rule}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="growoff-timeline">
        <div className="section-heading">
          <p className="eyebrow">Schedule</p>
          <h2 id="growoff-timeline">Event-format timeline</h2>
        </div>
        <div className="card-grid">
          {event.timeline.map((step) => (
            <article className="feature-card" key={`${event.slug}-${step.label}`}>
              <p className="eyebrow">{step.dateLabel}</p>
              <h3>{step.label}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {event.judging.length > 0 ? (
        <section className="section" aria-labelledby="growoff-judging">
          <div className="section-heading">
            <p className="eyebrow">Judging</p>
            <h2 id="growoff-judging">Placement method</h2>
          </div>
          <div className="card-grid">
            {event.judging.map((rule) => (
              <article className="feature-card" key={rule}>
                <p>{rule}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="hero__actions">
        <Link className="button button--primary" href="/community/grow-offs">All grow-offs</Link>
        <Link className="button" href="/community">Community hub</Link>
      </div>
    </section>
  );
}
