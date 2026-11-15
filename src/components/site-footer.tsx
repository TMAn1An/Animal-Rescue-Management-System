import Link from "next/link";
import { PawPrint } from "lucide-react";
import { getT } from "@/i18n/server";

export async function SiteFooter() {
  const { t } = await getT();
  return (
    <footer className="no-print mt-20 border-t border-line bg-surface-2">
      <div className="container-page flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2"><PawPrint size={16} aria-hidden className="text-primary" />{t.common.footer}</p>
        <p>{t.home.emergency}</p>
        <nav className="flex gap-4" aria-label="Footer">
          <Link href="/report" className="hover:text-ink">{t.nav.report}</Link>
          <Link href="/track" className="hover:text-ink">{t.nav.track}</Link>
        </nav>
      </div>
    </footer>
  );
}
