import Link from "next/link";

const navigation = [
  { href: "/seeds", label: "Genetics" },
  { href: "/learn", label: "Learn" },
  { href: "/tools", label: "Tools" },
  { href: "/games", label: "Games" },
  { href: "/community", label: "Community" },
  { href: "/journal", label: "Journal" },
];

function NavigationLinks() {
  return navigation.map((item) => (
    <li key={item.href}>
      <Link href={item.href}>{item.label}</Link>
    </li>
  ));
}

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
            <NavigationLinks />
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
                <NavigationLinks />
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
