"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./nav-links";

export function AdminTabs({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  return (
    <nav aria-label="Admin" className="no-print -mx-4 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 py-2">
        {items.map((i) => (
          <li key={i.href}><Link href={i.href} className="nav-link" aria-current={active(i.href) ? "page" : undefined}>{i.label}</Link></li>
        ))}
      </ul>
    </nav>
  );
}
