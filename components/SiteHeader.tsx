import Link from "next/link";
import { SiteNavigationLinks } from "@/components/SiteNavigation";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="DTF Genetics home">
          <span className="brand__mark" aria-hidden="true">DTF</span>
          <span className="brand__identity">
            <strong>DTF Genetics</strong>
            <small>Dream the Future</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <ul className="nav-list">
          <SiteNavigationLinks />
          </ul>
        </nav>

        <Link className="header-action desktop-search" href="/learn/search">
          Search THC
        </Link>

        <div className="mobile-nav-actions">
          <Link className="mobile-search" href="/learn/search" aria-label="Search THC">
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
