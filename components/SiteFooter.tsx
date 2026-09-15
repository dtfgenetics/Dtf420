import Link from "next/link";
import siteShell from "@/configuration/site-shell.json";

const exploreLinks = siteShell.primaryNavigation;

const learningLinks = [
  { href: "/learn/academy", label: "Academy" },
  { href: "/learn/atlas", label: "Plant Atlas" },
  { href: "/learn/plant-health", label: "Plant health & IPM" },
  { href: "/learn/sources", label: "Evidence sources" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div className="site-footer__brand">
          <Link className="brand brand--footer" href={siteShell.brand.homeHref} aria-label="DTF Genetics home">
            <span className="brand__mark" aria-hidden="true">DTF</span>
            <span className="brand__identity">
              <strong>{siteShell.brand.name}</strong>
              <small>{siteShell.brand.tagline}</small>
            </span>
          </Link>
          <p>
            Original genetics, Teaching Healthy Cultivation plant science, practical grow tools, browser games, and community resources in one connected system.
          </p>
        </div>

        <div className="site-footer__column">
          <h2>Explore</h2>
          <ul>
            {exploreLinks.map((item) => (
              <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="site-footer__column">
          <h2>Learning</h2>
          <ul>
            {learningLinks.map((item) => (
              <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="site-footer__column">
          <h2>Company</h2>
          <ul>
            {siteShell.secondaryNavigation.map((item) => (
              <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
            ))}
            <li><Link href="/learn/search">Search education</Link></li>
          </ul>
        </div>
      </div>

      <div className="shell site-footer__legal">
        <span>© 2026 DTF Genetics · Dream the Future</span>
        <span>Adults only. Follow applicable local laws.</span>
      </div>
    </footer>
  );
}
