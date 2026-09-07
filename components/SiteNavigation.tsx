"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navigation = [
  { href: "/seeds", label: "Genetics" },
  { href: "/learn", label: "Learn" },
  { href: "/tools", label: "Tools" },
  { href: "/games", label: "Games" },
  { href: "/community", label: "Community" },
  { href: "/journal", label: "Journal" },
] as const;

export function SiteNavigationLinks() {
  const pathname = usePathname();

  return navigation.map((item) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <li key={item.href}>
        <Link href={item.href} aria-current={active ? "page" : undefined} data-active={active || undefined}>
          {item.label}
        </Link>
      </li>
    );
  });
}
