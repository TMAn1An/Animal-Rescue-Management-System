"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

export type NavItem = { href: string; label: string; badge?: number };

function isActive(pathname: string, href: string) {
  return href === "/" || href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

/** Inline links on wide screens, a disclosure panel on narrow ones. */
export function NavLinks({ items, menuLabel, extra }: { items: NavItem[]; menuLabel: string; extra?: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const links = items.map((i) => (
    <Link key={i.href} href={i.href} className="nav-link" aria-current={isActive(pathname, i.href) ? "page" : undefined}>
      {i.label}
    </Link>
  ));

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
        {links}
        {extra}
      </nav>
      <button
        type="button" className="btn btn-secondary btn-sm md:hidden" aria-expanded={open} aria-controls="mobile-nav"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
        <span className="sr-only">{menuLabel}</span>
      </button>
      {open && (
        <div id="mobile-nav" ref={panelRef} className="absolute inset-x-0 top-full border-b border-line bg-surface p-3 shadow-lg md:hidden">
          <nav className="container-page flex flex-col gap-1 !px-0" aria-label="Main">
            {links}
            {extra}
          </nav>
        </div>
      )}
    </>
  );
}
