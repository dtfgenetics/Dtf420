"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AtlasSectionNav.module.css";

const items = [
  { href: "/learn/atlas/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/learn/atlas", label: "Explore", key: "explore" },
  { href: "/learn/atlas/paths", label: "Paths", key: "paths" },
  { href: "/learn/atlas/practice", label: "Practice", key: "practice" },
  { href: "/learn/atlas/notebook", label: "Notebook", key: "notebook" },
  { href: "/learn/atlas/mastery", label: "Mastery", key: "mastery" },
] as const;

function activeKey(pathname: string) {
  if (pathname.startsWith("/learn/atlas/dashboard")) return "dashboard";
  if (pathname.startsWith("/learn/atlas/paths")) return "paths";
  if (
    pathname.startsWith("/learn/atlas/practice") ||
    pathname.startsWith("/learn/atlas/review") ||
    pathname.startsWith("/learn/atlas/cases") ||
    pathname === "/learn/atlas/compare"
  ) return "practice";
  if (pathname.startsWith("/learn/atlas/notebook")) return "notebook";
  if (pathname.startsWith("/learn/atlas/mastery")) return "mastery";
  if (pathname.startsWith("/learn/atlas/search")) return "search";
  return "explore";
}

export function AtlasSectionNav() {
  const pathname = usePathname();
  const current = activeKey(pathname);

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav} aria-label="Living Plant Atlas sections">
        <Link className={styles.brand} href="/learn/atlas/dashboard">
          <span>THC</span>
          <strong>Living Plant Atlas</strong>
        </Link>
        <div className={styles.scroller}>
          {items.map((item) => {
            const active = item.key === current;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={active ? styles.active : undefined}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <Link
          className={`${styles.searchLink} ${current === "search" ? styles.searchActive : ""}`}
          href="/learn/atlas/search"
          aria-current={current === "search" ? "page" : undefined}
        >
          <span aria-hidden="true">⌕</span>
          Search
        </Link>
      </nav>
    </div>
  );
}
