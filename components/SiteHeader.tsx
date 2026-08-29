import Link from "next/link";

const navigation = [
  { href: "/seeds", label: "Genetics" },
  { href: "/learn", label: "Learn" },
  { href: "/tools", label: "Tools" },
  { href: "/games", label: "Games" },
  { href: "/community", label: "Community" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="DTF Genetics home">
          <span className="brand__mark" aria-hidden="true">DTF</span>
          <span>DTF Genetics</span>
        </Link>

        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
