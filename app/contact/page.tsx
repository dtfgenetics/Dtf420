import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact DTF Genetics",
  description:
    "Verified DTF Genetics contact routing for orders, genetics questions, education corrections, game reports, community matters, and business inquiries.",
};

const routes = [
  ["Order or product question", "Include the product name, order reference, and DTF-controlled website used. Never post payment-card details publicly."],
  ["Breeding or seed question", "Include the line name, generation or package information, and the specific trait or documentation question."],
  ["Correction or source question", "Include the page title, exact statement, supporting source, and the correction you believe should be made."],
  ["Bug or game report", "Include the game name, device and browser, the steps that caused the issue, and a screenshot when possible."],
  ["Event or moderation matter", "Include the event or channel name, approximate date, and a concise description of what happened."],
  ["Business inquiry", "Include the organization, purpose, requested deliverable, and intended timeline."],
];

export default function ContactPage() {
  return (
    <section className="shell page-section">
      <p className="eyebrow">DTF Genetics · Verified channels</p>
      <h1>Contact DTF Genetics</h1>
      <p className="lede">
        Official community links, product announcements, contests, and payment instructions should be checked against DTF-controlled websites and verified DTF Genetics channels. Use the routing below so support questions arrive with enough context to be answerable.
      </p>

      <div className="hero__actions">
        <a className="button button--primary" href="https://discord.gg/xJbUeHFPMt" rel="noreferrer" target="_blank">Official DTF / THC Discord</a>
        <Link className="button" href="/community">Community information</Link>
      </div>

      <section className="section" aria-labelledby="contact-routing">
        <div className="section-heading">
          <p className="eyebrow">Route your question</p>
          <h2 id="contact-routing">Include the details that make the question answerable.</h2>
        </div>
        <div className="card-grid">
          {routes.map(([title, description]) => (
            <article className="feature-card" key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="contact-safety">
        <div className="section-heading">
          <p className="eyebrow">Protect yourself</p>
          <h2 id="contact-safety">Do not send secrets or trust unsolicited offers.</h2>
          <p className="lede">
            Never send passwords, private keys, payment-card numbers, or account-recovery codes through Discord or social direct messages. Use published DTF links, keep checkout and login activity on DTF-controlled domains, and do not trust unsolicited messages offering hidden inventory, prizes, investments, or expedited access.
          </p>
        </div>
      </section>
    </section>
  );
}
