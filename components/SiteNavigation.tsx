"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import siteShell from "@/configuration/site-shell.json";

export const navigation = siteShell.primaryNavigation;

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
