import Link from "next/link";
import { SiteNavigationLinks } from "@/components/SiteNavigation";
import siteShell from "@/configuration/site-shell.json";

export function SiteHeader() {
  const search = siteShell.utilityNavigation[0];

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href={siteShell.brand.homeHref} aria-label="DTF Genetics home">
          <span className="brand__mark" aria-hidden="true">DTF</span>
          <span className="brand__identity">
            <strong>{siteShell.brand.name}</strong>
            <small>{siteShell.brand.tagline}</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <ul className="nav-list">
            <SiteNavigationLinks />
          </ul>
        </nav>

        <Link className="header-action desktop-search" href={search.href}>
          {search.label}
        </Link>

        <div className="mobile-nav-actions">
          <Link className="mobile-search" href={search.href} aria-label={search.label}>
            Search
          </Link>
          <details className="mobile-menu">
            <summary>Menu</summary>
            <nav className="mobile-menu__panel" aria-label="Mobile navigation">
              <ul className="mobile-menu__links">
                <SiteNavigationLinks />
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
