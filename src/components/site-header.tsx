import Image from "next/image";
import Link from "next/link";
import { getT } from "@/i18n/server";
import { getCurrentStaff } from "@/lib/session";
import { LocaleSwitch } from "./locale-switch";
import { NavLinks } from "./nav-links";

export async function SiteHeader() {
  const { t, locale } = await getT();
  const staff = await getCurrentStaff();
  const items = [
    { href: "/", label: t.nav.home },
    { href: "/report", label: t.nav.report },
    { href: "/track", label: t.nav.track },
    staff ? { href: "/admin", label: t.nav.dashboard } : { href: "/login", label: t.nav.admin },
  ];
  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary">{t.nav.skip}</a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          <Image src="/icon.svg" alt="" width={34} height={34} priority />
          <span>{t.brand}</span>
        </Link>
        <NavLinks items={items} menuLabel={t.nav.menu} extra={<LocaleSwitch locale={locale} label={t.nav.language} />} />
      </div>
    </header>
  );
}
