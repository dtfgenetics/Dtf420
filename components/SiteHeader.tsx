import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/learn", label: "Learn" },
  { href: "/tools", label: "Tools" },
  { href: "/community", label: "Community" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="DTF420 home">
          <span className="brand__mark" aria-hidden="true">420</span>
          <span>DTF420</span>
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
