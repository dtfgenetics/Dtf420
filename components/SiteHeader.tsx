import Link from "next/link";

const navigation = [
  { href: "/seeds", label: "Genetics" },
  { href: "/learn", label: "Learn" },
  { href: "/tools", label: "Tools" },
  { href: "/games", label: "Games" },
  { href: "/community", label: "Community" },
  { href: "/journal", label: "Journal" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="DTF Genetics home">
          <span className="brand__mark" aria-hidden="true">
            <span>DTF</span>
          </span>
          <span className="brand__identity">
            <strong>DTF Genetics</strong>
            <small>Dream the Future</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          <ul className="nav-list">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link className="header-action" href="/learn/search">
          Search THC
        </Link>
      </div>
    </header>
  );
}
